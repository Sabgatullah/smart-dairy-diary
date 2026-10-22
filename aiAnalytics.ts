import { Animal, DailyMilkRecord, BreedingRecord, ExpenseRecord, MilkDropAlert } from '../types';

/**
 * Calculates Gestation & Important Milestones
 * Cow: 283 days gestation
 * Buffalo: 310 days gestation
 * Pregnancy check: 60 days after AI
 * Dry-off period: 60 days before expected calving
 */
export function calculateBreedingDates(species: 'Cow' | 'Buffalo', inseminationDateStr: string) {
  const aiDate = new Date(inseminationDateStr);
  if (isNaN(aiDate.getTime())) return null;

  const gestationDays = species === 'Buffalo' ? 310 : 283;

  // Pregnancy check at 60 days
  const pregCheckDate = new Date(aiDate);
  pregCheckDate.setDate(pregCheckDate.getDate() + 60);

  // Expected Calving
  const calvingDate = new Date(aiDate);
  calvingDate.setDate(calvingDate.getDate() + gestationDays);

  // Dry off date (60 days prior to calving)
  const dryOffDate = new Date(calvingDate);
  dryOffDate.setDate(dryOffDate.getDate() - 60);

  return {
    pregnancyCheckDueDate: pregCheckDate.toISOString().split('T')[0],
    expectedCalvingDate: calvingDate.toISOString().split('T')[0],
    expectedDryOffDate: dryOffDate.toISOString().split('T')[0],
    gestationDays,
  };
}

/**
 * AI / Statistical Milk Drop Anomaly Detector
 * Analyzes an animal's recent 7-14 day production history.
 * If today's yield is > 15% lower than the rolling average, flags it as an alert
 * and categorizes probable triggers:
 * - Mastitis (Saaroo)
 * - Heat / Estrus (typical 1-day milk reduction)
 * - Digestive upset / Feed change / Subclinical acidosis
 * - Environmental / Heat stress
 */
export function detectMilkDropAlerts(
  animals: Animal[],
  milkRecords: DailyMilkRecord[],
  targetDateStr: string,
  thresholdPct: number = 15
): MilkDropAlert[] {
  const alerts: MilkDropAlert[] = [];
  const targetDate = new Date(targetDateStr);

  const activeMilkers = animals.filter(
    (a) => a.status === 'Milking' && a.gender === 'Female'
  );

  for (const animal of activeMilkers) {
    // Find today's record
    const todayRecord = milkRecords.find(
      (r) => r.animalId === animal.id && r.date === targetDateStr
    );
    if (!todayRecord || todayRecord.totalDailyMilkLiters <= 0) continue;

    // Find past 7 days records for this animal
    const pastRecords = milkRecords
      .filter((r) => {
        if (r.animalId !== animal.id || r.date >= targetDateStr) return false;
        const d = new Date(r.date);
        const diffDays = (targetDate.getTime() - d.getTime()) / (1000 * 3600 * 24);
        return diffDays > 0 && diffDays <= 7;
      })
      .map((r) => r.totalDailyMilkLiters);

    if (pastRecords.length < 2) continue; // Need at least 2 baseline days

    const sum = pastRecords.reduce((acc, val) => acc + val, 0);
    const avg = sum / pastRecords.length;

    if (avg <= 1) continue;

    const todayYield = todayRecord.totalDailyMilkLiters;
    const dropPct = ((avg - todayYield) / avg) * 100;

    if (dropPct >= thresholdPct) {
      const isSevere = dropPct >= 28;
      const causes: string[] = [];
      const actions: string[] = [];

      if (dropPct >= 25) {
        causes.push('Acute Clinical or Subclinical Mastitis (Saaroo)');
        causes.push('High Fever or Systemic Infection (e.g. Tick Fever / Theileriosis)');
        causes.push('Sudden Off-feed / Ruminal Acidosis or Bloat');
        actions.push('Immediately perform California Mastitis Test (CMT) on all 4 quarters.');
        actions.push('Check rectal temperature (Normal: 101.5°F for cow, 101.0°F for buffalo).');
        actions.push('Isolate animal and consult the farm veterinarian immediately.');
      } else {
        causes.push('Estrus / Heat cycle (often causes temporary 1-2 day dip in milk)');
        causes.push('Early Subclinical Mastitis (udder inflammation)');
        causes.push('Sudden change in Wanda/fodder ratio or poor water intake');
        causes.push('Milking stress or change in milker technique');
        actions.push('Observe animal for heat signs (mucous discharge, bellowing, pacing).');
        actions.push('Examine udder for swelling, heat, or curdled/watery milk clots.');
        actions.push('Verify today\'s feed and clean water availability.');
      }

      alerts.push({
        animalId: animal.id,
        animalTag: animal.tag,
        animalName: animal.name,
        species: animal.species,
        previousAvgLiters: parseFloat(avg.toFixed(1)),
        todayLiters: parseFloat(todayYield.toFixed(1)),
        dropPercentage: parseFloat(dropPct.toFixed(1)),
        severity: isSevere ? 'Severe' : 'Moderate',
        suggestedCauses: causes,
        recommendedActions: actions,
      });
    }
  }

  return alerts.sort((a, b) => b.dropPercentage - a.dropPercentage);
}

/**
 * Predicts Wood's Incomplete Gamma Lactation Curve:
 * y(t) = a * (t ^ b) * exp(-c * t)
 * where t = days in milk (DIM)
 * a: scaling factor (initial yield)
 * b: inclining rate to peak
 * c: declining persistence rate
 */
export function estimateLactationCurve(
  species: 'Cow' | 'Buffalo',
  lactationNumber: number,
  daysInMilk: number,
  currentYield: number
) {
  // Calibrated typical coefficients for Pakistani dairy animals
  const isBuffalo = species === 'Buffalo';
  const a = isBuffalo ? 10.5 : 12.0;
  const b = isBuffalo ? 0.18 : 0.22;
  const c = isBuffalo ? 0.0035 : 0.0038;

  const standardCurvePoints: { day: number; predictedLiters: number }[] = [];
  let totalPredicted305Day = 0;

  for (let day = 5; day <= 305; day += 15) {
    const rawYield = a * Math.pow(day, b) * Math.exp(-c * day);
    // Scale slightly according to current yield relative to typical standard
    const scale = currentYield > 0 ? Math.min(1.6, Math.max(0.6, currentYield / 12)) : 1.0;
    const finalYield = parseFloat((rawYield * scale).toFixed(1));
    standardCurvePoints.push({ day, predictedLiters: finalYield });
    totalPredicted305Day += finalYield * 15;
  }

  const peakDay = Math.round(b / c); // Theoretical peak day (usually ~50-60 days)
  const estimatedPeakMilk = parseFloat((a * Math.pow(peakDay, b) * Math.exp(-c * peakDay)).toFixed(1));

  return {
    peakDay,
    estimatedPeakMilk,
    totalPredicted305Day: Math.round(totalPredicted305Day),
    standardCurvePoints,
  };
}

/**
 * Predicts Upcoming Estrus / Heat window (21-day bovine cycle)
 */
export function predictUpcomingHeat(breedingRecords: BreedingRecord[]) {
  const now = new Date();
  const predictions: {
    animalTag: string;
    animalId: string;
    lastHeatDate: string;
    nextExpectedHeatDate: string;
    daysUntilHeat: number;
    urgency: 'Today' | 'Upcoming' | 'Past Due';
  }[] = [];

  for (const record of breedingRecords) {
    if (record.pregnancyStatus === 'Confirmed Pregnant') continue;

    const baseDateStr = record.inseminationDate || record.heatObservedDate;
    if (!baseDateStr) continue;

    const baseDate = new Date(baseDateStr);
    if (isNaN(baseDate.getTime())) continue;

    // Standard 21 day recurrence (cycle ranges 18 - 24 days)
    const nextHeat = new Date(baseDate);
    nextHeat.setDate(nextHeat.getDate() + 21);

    const diffDays = Math.round((nextHeat.getTime() - now.getTime()) / (1000 * 3600 * 24));

    if (diffDays >= -5 && diffDays <= 14) {
      let urgency: 'Today' | 'Upcoming' | 'Past Due' = 'Upcoming';
      if (diffDays === 0) urgency = 'Today';
      else if (diffDays < 0) urgency = 'Past Due';

      predictions.push({
        animalTag: record.animalTag,
        animalId: record.animalId,
        lastHeatDate: baseDateStr,
        nextExpectedHeatDate: nextHeat.toISOString().split('T')[0],
        daysUntilHeat: diffDays,
        urgency,
      });
    }
  }

  return predictions.sort((a, b) => a.daysUntilHeat - b.daysUntilHeat);
}

/**
 * Feed-to-Milk Economic Efficiency Metrics
 */
export function calculateFeedEconomics(
  milkRecords: DailyMilkRecord[],
  expenseRecords: ExpenseRecord[]
) {
  const totalMilkLiters = milkRecords.reduce((acc, r) => acc + r.totalDailyMilkLiters, 0);

  const feedExpenses = expenseRecords
    .filter(
      (e) =>
        e.category.includes('Fodder') ||
        e.category.includes('Wanda') ||
        e.category.includes('Concentrates')
    )
    .reduce((acc, e) => acc + e.totalAmountPKR, 0);

  const totalExpenses = expenseRecords.reduce((acc, e) => acc + e.totalAmountPKR, 0);
  const totalMilkRevenue = milkRecords.reduce((acc, r) => acc + r.totalSaleRevenuePKR, 0);

  const feedCostPerLiter =
    totalMilkLiters > 0 ? Math.round((feedExpenses / totalMilkLiters) * 10) / 10 : 0;
  const totalCostPerLiter =
    totalMilkLiters > 0 ? Math.round((totalExpenses / totalMilkLiters) * 10) / 10 : 0;
  const avgSellingPricePerLiter =
    totalMilkLiters > 0 ? Math.round((totalMilkRevenue / totalMilkLiters) * 10) / 10 : 0;

  const netFarmProfit = totalMilkRevenue - totalExpenses;
  const feedCostRatioPct =
    totalMilkRevenue > 0 ? Math.round((feedExpenses / totalMilkRevenue) * 100) : 0;

  // Efficiency Rating
  let rating: 'Excellent' | 'Good' | 'Attention Needed' | 'Critical Loss' = 'Good';
  if (feedCostRatioPct > 0 && feedCostRatioPct <= 55) rating = 'Excellent';
  else if (feedCostRatioPct > 55 && feedCostRatioPct <= 70) rating = 'Good';
  else if (feedCostRatioPct > 70 && feedCostRatioPct <= 85) rating = 'Attention Needed';
  else if (feedCostRatioPct > 85) rating = 'Critical Loss';

  return {
    totalMilkLiters: Math.round(totalMilkLiters),
    feedExpenses,
    totalExpenses,
    totalMilkRevenue,
    feedCostPerLiter,
    totalCostPerLiter,
    avgSellingPricePerLiter,
    netFarmProfit,
    feedCostRatioPct,
    rating,
  };
}
