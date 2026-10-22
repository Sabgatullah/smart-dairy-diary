import React, { useMemo } from 'react';
import { useFarm } from '../context/FarmContext';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  ChevronRight,
  DollarSign,
  Heart,
  Milk,
  ShieldAlert,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react';

interface DashboardProps {
  onNavigateTab: (tab: string) => void;
  onOpenQuickMilkModal: () => void;
  onOpenAddAnimalModal: () => void;
  onSelectAnimal: (id: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onNavigateTab,
  onOpenQuickMilkModal,
  onOpenAddAnimalModal,
  onSelectAnimal,
}) => {
  const {
    animals,
    milkRecords,
    breedingRecords,
    healthRecords,
    expenseRecords,
    activeDate,
    activeMilkDropAlerts,
    settings,
  } = useFarm();

  // 1. Animal Counts
  const totalAnimals = animals.filter((a) => a.status !== 'Sold' && a.status !== 'Deceased').length;
  const milkingAnimals = animals.filter((a) => a.status === 'Milking').length;
  const dryAnimals = animals.filter((a) => a.status === 'Dry').length;
  const pregnantAnimals = animals.filter((a) => a.status === 'Pregnant').length;
  const sickAnimals = animals.filter((a) => a.status === 'Sick').length;

  // Active Attention Count (Sick + Active Milk Drop Alerts)
  const animalsRequiringAttention = useMemo(() => {
    const sickIds = new Set(animals.filter((a) => a.status === 'Sick').map((a) => a.id));
    for (const alert of activeMilkDropAlerts) {
      sickIds.add(alert.animalId);
    }
    return sickIds.size;
  }, [animals, activeMilkDropAlerts]);

  // 2. Today's Milk Production & Financials (based on activeDate)
  const todayMilkRecords = useMemo(() => {
    return milkRecords.filter((r) => r.date === activeDate);
  }, [milkRecords, activeDate]);

  const todayMorningLiters = useMemo(() => {
    return todayMilkRecords.reduce((acc, r) => acc + (r.morningMilkLiters || 0), 0);
  }, [todayMilkRecords]);

  const todayEveningLiters = useMemo(() => {
    return todayMilkRecords.reduce((acc, r) => acc + (r.eveningMilkLiters || 0), 0);
  }, [todayMilkRecords]);

  const todayTotalMilkLiters = Math.round((todayMorningLiters + todayEveningLiters) * 10) / 10;

  const todayMilkRevenuePKR = useMemo(() => {
    return todayMilkRecords.reduce((acc, r) => acc + (r.totalSaleRevenuePKR || 0), 0);
  }, [todayMilkRecords]);

  const todayExpensesPKR = useMemo(() => {
    return expenseRecords
      .filter((e) => e.date === activeDate)
      .reduce((acc, e) => acc + e.totalAmountPKR, 0);
  }, [expenseRecords, activeDate]);

  const todayEstimatedProfitPKR = todayMilkRevenuePKR - todayExpensesPKR;

  // 3. Past 14 Days Milk Trend for SVG Chart
  const milkChartData = useMemo(() => {
    const dataPoints: { date: string; displayDate: string; totalLiters: number; morning: number; evening: number }[] = [];
    const baseDate = new Date(activeDate);

    for (let i = 13; i >= 0; i--) {
      const d = new Date(baseDate);
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      const recordsForDay = milkRecords.filter((r) => r.date === dStr);
      const morning = recordsForDay.reduce((acc, r) => acc + (r.morningMilkLiters || 0), 0);
      const evening = recordsForDay.reduce((acc, r) => acc + (r.eveningMilkLiters || 0), 0);
      const total = Math.round((morning + evening) * 10) / 10;

      dataPoints.push({
        date: dStr,
        displayDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        totalLiters: total,
        morning: Math.round(morning * 10) / 10,
        evening: Math.round(evening * 10) / 10,
      });
    }

    return dataPoints;
  }, [milkRecords, activeDate]);

  const maxMilkLiters = Math.max(
    ...milkChartData.map((d) => d.totalLiters),
    50
  );

  // 4. Upcoming Calvings & Pregnancy Checks
  const upcomingBreedingAlerts = useMemo(() => {
    const alerts: {
      type: 'Calving' | 'Pregnancy Check' | 'Dry-Off';
      animalTag: string;
      animalId: string;
      dueDate: string;
      details: string;
      daysRemaining: number;
    }[] = [];

    const now = new Date(activeDate);

    for (const b of breedingRecords) {
      // Expected Calving
      if (b.expectedCalvingDate && b.pregnancyStatus === 'Confirmed Pregnant') {
        const calvD = new Date(b.expectedCalvingDate);
        const diff = Math.round((calvD.getTime() - now.getTime()) / (1000 * 3600 * 24));
        if (diff >= -10 && diff <= 60) {
          alerts.push({
            type: 'Calving',
            animalTag: b.animalTag,
            animalId: b.animalId,
            dueDate: b.expectedCalvingDate,
            details: diff < 0 ? `Overdue by ${Math.abs(diff)} days!` : `Calving in ${diff} days`,
            daysRemaining: diff,
          });
        }
      }

      // Dry-off notice
      if (b.expectedDryOffDate && b.pregnancyStatus === 'Confirmed Pregnant') {
        const dryD = new Date(b.expectedDryOffDate);
        const diff = Math.round((dryD.getTime() - now.getTime()) / (1000 * 3600 * 24));
        if (diff >= -5 && diff <= 20) {
          alerts.push({
            type: 'Dry-Off',
            animalTag: b.animalTag,
            animalId: b.animalId,
            dueDate: b.expectedDryOffDate,
            details: diff <= 0 ? 'Dry-off period starting now (stop milking)' : `Dry-off due in ${diff} days`,
            daysRemaining: diff,
          });
        }
      }

      // Pregnancy Check
      if (b.pregnancyStatus === 'Pending Check' && b.pregnancyCheckDueDate) {
        const checkD = new Date(b.pregnancyCheckDueDate);
        const diff = Math.round((checkD.getTime() - now.getTime()) / (1000 * 3600 * 24));
        if (diff >= -30 && diff <= 30) {
          alerts.push({
            type: 'Pregnancy Check',
            animalTag: b.animalTag,
            animalId: b.animalId,
            dueDate: b.pregnancyCheckDueDate,
            details: diff < 0 ? `Check overdue by ${Math.abs(diff)} days` : `Vet check in ${diff} days`,
            daysRemaining: diff,
          });
        }
      }
    }

    return alerts.sort((a, b) => a.daysRemaining - b.daysRemaining);
  }, [breedingRecords, activeDate]);

  // 5. Active Health & Withdrawal Warnings
  const activeWithdrawals = useMemo(() => {
    const list: { animalTag: string; animalId: string; disease: string; safeDate: string }[] = [];
    const now = new Date(activeDate);

    for (const h of healthRecords) {
      if (h.milkWithdrawalDays > 0) {
        const tDate = new Date(h.date);
        const safeDate = new Date(tDate);
        safeDate.setDate(safeDate.getDate() + h.milkWithdrawalDays);
        if (safeDate >= now) {
          list.push({
            animalTag: h.animalTag,
            animalId: h.animalId,
            disease: h.diseaseOrCondition,
            safeDate: safeDate.toISOString().split('T')[0],
          });
        }
      }
    }
    return list;
  }, [healthRecords, activeDate]);

  // 6. Top Milking Animals Today
  const topMilkers = useMemo(() => {
    return [...todayMilkRecords]
      .sort((a, b) => b.totalDailyMilkLiters - a.totalDailyMilkLiters)
      .slice(0, 4)
      .map((r) => {
        const animal = animals.find((a) => a.id === r.animalId);
        return {
          ...r,
          name: animal?.name || r.animalTag,
          breed: animal?.breed || '',
          species: animal?.species || 'Cow',
        };
      });
  }, [todayMilkRecords, animals]);

  // Format currency
  const formatPKR = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner & Quick Summary */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Dairy Farm Overview</span>
            <span className="text-xs font-semibold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded">
              Live Ledger
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Displaying production and financial balances for <span className="font-semibold text-slate-700">{activeDate}</span>.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onOpenQuickMilkModal}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm transition-all"
          >
            <Milk className="w-4 h-4" />
            <span>Record Today's Milk</span>
          </button>
          <button
            onClick={onOpenAddAnimalModal}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Register Animal</span>
          </button>
          <button
            onClick={() => onNavigateTab('ai-advisor')}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Consult AI Vet</span>
          </button>
        </div>
      </div>

      {/* 2. Critical Alert Banners (Mastitis / Milk Drop / Antibiotic Withdrawal) */}
      {(activeMilkDropAlerts.length > 0 || activeWithdrawals.length > 0) && (
        <div className="space-y-3">
          {activeMilkDropAlerts.map((alert) => (
            <div
              key={alert.animalId}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm">
                      AI Drop Alert: {alert.animalTag} ({alert.animalName})
                    </span>
                    <span className="text-xs font-semibold bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded">
                      {alert.dropPercentage}% Yield Drop
                    </span>
                    <span className="text-xs text-amber-700">
                      (Previous Avg: {alert.previousAvgLiters}L → Today: {alert.todayLiters}L)
                    </span>
                  </div>
                  <p className="text-xs text-amber-800 mt-1">
                    Suspected trigger: <span className="font-medium">{alert.suggestedCauses[0]}</span>. Check udder with CMT or examine for estrus.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => onSelectAnimal(alert.animalId)}
                  className="px-3 py-1.5 text-xs font-semibold bg-amber-200 hover:bg-amber-300 text-amber-900 rounded-lg transition-colors"
                >
                  View Animal File
                </button>
                <button
                  onClick={() => onNavigateTab('ai-advisor')}
                  className="px-3 py-1.5 text-xs font-semibold bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg transition-colors flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  <span>Diagnose</span>
                </button>
              </div>
            </div>
          ))}

          {activeWithdrawals.map((w) => (
            <div
              key={w.animalId}
              className="flex items-center justify-between p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 text-xs shadow-sm"
            >
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                <span>
                  <strong>Milk Disposal Safety Alert:</strong> Tag <strong>{w.animalTag}</strong> is under medicine withdrawal for {w.disease}. Do NOT sell milk until <strong>{w.safeDate}</strong>.
                </span>
              </div>
              <button
                onClick={() => onNavigateTab('health')}
                className="font-semibold text-rose-700 hover:underline shrink-0"
              >
                Health Log &rarr;
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 3. Primary KPI Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Milk Today */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Today's Total Milk</span>
            <div className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg">
              <Milk className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-slate-900">{todayTotalMilkLiters}</span>
              <span className="text-xs font-semibold text-slate-500">Liters</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
              <span>Morn: {Math.round(todayMorningLiters * 10) / 10}L</span>
              <span aria-hidden="true">·</span>
              <span>Eve: {Math.round(todayEveningLiters * 10) / 10}L</span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>{todayMilkRecords.length} recorded today</span>
            <button
              onClick={() => onNavigateTab('milk')}
              className="text-emerald-700 font-medium hover:underline"
            >
              Milking Sheet &rarr;
            </button>
          </div>
        </div>

        {/* Milk Sales / Income Today */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Today's Milk Sales</span>
            <div className="p-1.5 bg-blue-50 text-blue-700 rounded-lg">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-slate-900">{formatPKR(todayMilkRevenuePKR)}</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Cash & contractor milk income
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Rates: Cow Rs.190 / Buf Rs.240</span>
            <button
              onClick={() => onNavigateTab('finance')}
              className="text-blue-700 font-medium hover:underline"
            >
              Financials &rarr;
            </button>
          </div>
        </div>

        {/* Today's Farm Expenses */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Today's Expenses</span>
            <div className="p-1.5 bg-amber-50 text-amber-700 rounded-lg">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-slate-900">{formatPKR(todayExpensesPKR)}</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Feed, Wanda, labor & meds
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Cost tracking</span>
            <button
              onClick={() => onNavigateTab('finance')}
              className="text-amber-700 font-medium hover:underline"
            >
              Add Expense &rarr;
            </button>
          </div>
        </div>

        {/* Estimated Daily Net Profit */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Estimated Day Balance</span>
            <div className={`p-1.5 rounded-lg ${todayEstimatedProfitPKR >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
              {todayEstimatedProfitPKR >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-1">
              <span className={`text-2xl font-bold ${todayEstimatedProfitPKR >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                {formatPKR(todayEstimatedProfitPKR)}
              </span>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Net balance (Revenue - Costs)
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>PKR Currency</span>
            <span className={`font-semibold ${todayEstimatedProfitPKR >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
              {todayEstimatedProfitPKR >= 0 ? 'Profit Margin' : 'Deficit'}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Herd Composition Strip */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-700" />
            <h2 className="text-sm font-bold text-slate-900">Herd Composition & Status</h2>
          </div>
          <button
            onClick={() => onNavigateTab('animals')}
            className="text-xs text-emerald-700 font-medium hover:underline"
          >
            Manage Herd Registry ({totalAnimals}) &rarr;
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
            <div className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Total Herd</div>
            <div className="text-xl font-bold text-slate-900 mt-0.5">{totalAnimals}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Active farm head</div>
          </div>

          <div className="p-3 bg-emerald-50/70 rounded-lg border border-emerald-200/60">
            <div className="text-[11px] text-emerald-800 uppercase tracking-wider font-semibold">Milking</div>
            <div className="text-xl font-bold text-emerald-900 mt-0.5">{milkingAnimals}</div>
            <div className="text-[10px] text-emerald-700 mt-0.5">In milk production</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
            <div className="text-[11px] text-slate-600 uppercase tracking-wider font-semibold">Dry</div>
            <div className="text-xl font-bold text-slate-800 mt-0.5">{dryAnimals}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Resting / pre-calving</div>
          </div>

          <div className="p-3 bg-blue-50/70 rounded-lg border border-blue-200/60">
            <div className="text-[11px] text-blue-800 uppercase tracking-wider font-semibold">Pregnant</div>
            <div className="text-xl font-bold text-blue-900 mt-0.5">{pregnantAnimals}</div>
            <div className="text-[10px] text-blue-700 mt-0.5">Confirmed in gestation</div>
          </div>

          <div className="p-3 bg-rose-50/70 rounded-lg border border-rose-200/60">
            <div className="text-[11px] text-rose-800 uppercase tracking-wider font-semibold">Sick / Bay</div>
            <div className="text-xl font-bold text-rose-900 mt-0.5">{sickAnimals}</div>
            <div className="text-[10px] text-rose-700 mt-0.5">Under clinical care</div>
          </div>

          <div className="p-3 bg-amber-50/70 rounded-lg border border-amber-200/60">
            <div className="text-[11px] text-amber-800 uppercase tracking-wider font-semibold">Attention</div>
            <div className="text-xl font-bold text-amber-900 mt-0.5">{animalsRequiringAttention}</div>
            <div className="text-[10px] text-amber-700 mt-0.5">Drop / Sick / Overdue</div>
          </div>
        </div>
      </div>

      {/* 5. Production Chart & Reminders Column */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 14-Day Production Chart (SVG) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-700" />
                <span>14-Day Farm Milk Production Trajectory (Liters)</span>
              </h2>
              <p className="text-xs text-slate-500">
                Aggregated daily liters from morning & evening milk sessions.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-emerald-700 rounded-sm inline-block"></span>
                <span>Morning</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-emerald-400 rounded-sm inline-block"></span>
                <span>Evening</span>
              </span>
            </div>
          </div>

          {/* Responsive SVG Bar & Line Chart */}
          <div className="h-56 w-full flex items-end gap-1.5 pt-4 pb-2 border-b border-slate-200">
            {milkChartData.map((d, idx) => {
              const heightPct = Math.max(10, Math.round((d.totalLiters / maxMilkLiters) * 100));
              const mornPct = d.totalLiters > 0 ? (d.morning / d.totalLiters) * 100 : 50;
              const isToday = d.date === activeDate;

              return (
                <div
                  key={d.date}
                  className="flex-1 flex flex-col items-center h-full justify-end group relative"
                >
                  {/* Hover Tooltip */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full mb-2 bg-slate-900 text-white text-[11px] rounded px-2 py-1 pointer-events-none whitespace-nowrap z-20 shadow-md">
                    <div className="font-semibold">{d.displayDate}</div>
                    <div>Total: {d.totalLiters} L</div>
                    <div className="text-emerald-300">M: {d.morning}L | E: {d.evening}L</div>
                  </div>

                  {/* Stacked Bar */}
                  <div
                    style={{ height: `${heightPct}%` }}
                    className={`w-full max-w-[28px] rounded-t flex flex-col justify-end overflow-hidden transition-all duration-300 ${
                      isToday ? 'ring-2 ring-emerald-600 ring-offset-1' : ''
                    }`}
                  >
                    <div
                      style={{ height: `${100 - mornPct}%` }}
                      className="bg-emerald-400 w-full"
                    />
                    <div
                      style={{ height: `${mornPct}%` }}
                      className="bg-emerald-700 w-full"
                    />
                  </div>

                  {/* Date Label */}
                  <span className={`text-[10px] mt-2 truncate w-full text-center ${isToday ? 'font-bold text-emerald-800' : 'text-slate-500'}`}>
                    {idx % 2 === 0 ? d.displayDate.split(' ')[1] : ''}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 mt-3 pt-2">
            <span>Peak Day: {Math.max(...milkChartData.map((d) => d.totalLiters))} Liters</span>
            <span>Current: {todayTotalMilkLiters} Liters</span>
            <button
              onClick={() => onNavigateTab('milk')}
              className="text-emerald-700 font-medium hover:underline flex items-center gap-1"
            >
              <span>Full Milking Logs</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Breeding & Veterinary Milestones */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-600" />
                <span>Upcoming Milestones</span>
              </h2>
              <button
                onClick={() => onNavigateTab('breeding')}
                className="text-xs text-rose-700 font-medium hover:underline"
              >
                Breeding &rarr;
              </button>
            </div>

            <div className="space-y-2.5">
              {upcomingBreedingAlerts.length === 0 ? (
                <div className="text-xs text-slate-500 py-6 text-center">
                  No pending calvings or checks within 60 days.
                </div>
              ) : (
                upcomingBreedingAlerts.slice(0, 4).map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/80 flex items-start justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-xs text-slate-900">
                          {item.animalTag}
                        </span>
                        <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-slate-200 text-slate-700">
                          {item.type}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-600 mt-0.5">
                        {item.details}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[10px] font-medium text-slate-500">Due Date</div>
                      <div className="text-xs font-semibold text-slate-800">{item.dueDate}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Pakistani Herd Gestations</span>
            <span className="text-[11px] text-slate-600">Cow: 283d · Buf: 310d</span>
          </div>
        </div>
      </div>

      {/* 6. Top Producers & Recent Milking Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Producers */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Top Milking Animals Today</span>
            </h2>
            <span className="text-xs text-slate-500">Ranked by volume</span>
          </div>

          <div className="divide-y divide-slate-100">
            {topMilkers.map((m, rank) => (
              <div
                key={m.animalId}
                onClick={() => onSelectAnimal(m.animalId)}
                className="py-2.5 flex items-center justify-between hover:bg-slate-50 px-2 rounded-lg cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center">
                    #{rank + 1}
                  </div>
                  <div>
                    <div className="font-semibold text-xs text-slate-900 flex items-center gap-1.5">
                      <span>{m.animalTag}</span>
                      <span className="text-slate-500 font-normal">({m.name})</span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {m.breed} · Fat: {m.fatPercentage || 4.5}%
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold text-emerald-800">
                    {m.totalDailyMilkLiters} L / day
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {formatPKR(m.totalSaleRevenuePKR)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Farm Health & Security Status */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Farm Biosecurity & Feed Status</span>
              </h2>
              <span className="text-xs text-emerald-700 font-medium">Updated</span>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5"></div>
                <div className="text-xs">
                  <div className="font-semibold text-slate-900">Vaccination Coverage</div>
                  <div className="text-slate-600 mt-0.5">
                    FMD (Munh-Khur) trivalent oil vaccine completed. Next booster due in March 2027.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5"></div>
                <div className="text-xs">
                  <div className="font-semibold text-slate-900">Feed Stock & Rations</div>
                  <div className="text-slate-600 mt-0.5">
                    Supreme Dairy Wanda 20% CP in stock (10 bags). Daily green maize silage ration distributed.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5"></div>
                <div className="text-xs">
                  <div className="font-semibold text-slate-900">Active Isolation & Quarantine</div>
                  <div className="text-slate-600 mt-0.5">
                    1 cow (PK-CW-05) in sick bay with subclinical mastitis. Daily intramammary infusion active.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Kasur / Pattoki Dairy Belt</span>
            <button
              onClick={() => onNavigateTab('health')}
              className="text-emerald-700 font-medium hover:underline"
            >
              Veterinary Clinic Logs &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
