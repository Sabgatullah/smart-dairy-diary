import React, { useMemo, useState } from 'react';
import { useFarm } from '../context/FarmContext';
import { estimateLactationCurve } from '../utils/aiAnalytics';
import {
  X,
  Milk,
  Heart,
  Stethoscope,
  Calendar,
  Sparkles,
  TrendingUp,
  Activity,
  Edit2,
  AlertTriangle,
} from 'lucide-react';

interface AnimalDetailModalProps {
  animalId: string | null;
  onClose: () => void;
  onEditAnimal: (animal: any) => void;
}

export const AnimalDetailModal: React.FC<AnimalDetailModalProps> = ({
  animalId,
  onClose,
  onEditAnimal,
}) => {
  const { animals, milkRecords, breedingRecords, healthRecords, settings } = useFarm();
  const [activeTab, setActiveTab] = useState<'milk' | 'breeding' | 'health' | 'curve'>('milk');

  const animal = useMemo(() => {
    return animals.find((a) => a.id === animalId);
  }, [animals, animalId]);

  // Animal Milk Records
  const animalMilkLogs = useMemo(() => {
    if (!animal) return [];
    return milkRecords
      .filter((r) => r.animalId === animal.id)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [milkRecords, animal]);

  // Animal Breeding Records
  const animalBreedingLogs = useMemo(() => {
    if (!animal) return [];
    return breedingRecords
      .filter((b) => b.animalId === animal.id)
      .sort((a, b) => b.inseminationDate.localeCompare(a.inseminationDate));
  }, [breedingRecords, animal]);

  // Animal Health Records
  const animalHealthLogs = useMemo(() => {
    if (!animal) return [];
    return healthRecords
      .filter((h) => h.animalId === animal.id)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [healthRecords, animal]);

  // AI Lactation Curve Projections (Wood's Model)
  const lactationCurve = useMemo(() => {
    if (!animal) return null;
    const latestYield = animalMilkLogs[0]?.totalDailyMilkLiters || 12;
    // Calculate days in milk (DIM) from lastCalvingDate
    let dim = 60;
    if (animal.lastCalvingDate) {
      const calvingDate = new Date(animal.lastCalvingDate);
      dim = Math.max(5, Math.round((new Date().getTime() - calvingDate.getTime()) / (1000 * 3600 * 24)));
    }

    return estimateLactationCurve(animal.species, animal.lactationNumber, dim, latestYield);
  }, [animal, animalMilkLogs]);

  if (!animal) return null;

  const totalLifetimeMilk = animalMilkLogs.reduce((acc, r) => acc + r.totalDailyMilkLiters, 0);
  const totalLifetimeRevenue = animalMilkLogs.reduce((acc, r) => acc + r.totalSaleRevenuePKR, 0);
  const avgYield = animalMilkLogs.length > 0 ? totalLifetimeMilk / animalMilkLogs.length : 0;

  const formatPKR = (num: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-lg font-mono">
              {animal.tag.substring(0, 5)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-slate-900 font-mono">{animal.tag}</h2>
                <span className="text-sm font-semibold text-slate-800">({animal.name})</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  {animal.status}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                <span>{animal.species}</span>
                <span aria-hidden="true">·</span>
                <span>{animal.breed}</span>
                <span aria-hidden="true">·</span>
                <span>Lactation #{animal.lactationNumber}</span>
                <span aria-hidden="true">·</span>
                <span>{animal.location}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onEditAnimal(animal)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Lifetime Quick Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-100/60 border-b border-slate-200 text-xs">
          <div>
            <span className="text-slate-500">Recorded Milk:</span>
            <div className="font-bold text-slate-900 text-sm">{Math.round(totalLifetimeMilk * 10) / 10} L</div>
          </div>
          <div>
            <span className="text-slate-500">Average Daily Milk:</span>
            <div className="font-bold text-slate-900 text-sm">{Math.round(avgYield * 10) / 10} L/day</div>
          </div>
          <div>
            <span className="text-slate-500">Lifetime Revenue:</span>
            <div className="font-bold text-emerald-800 text-sm">{formatPKR(totalLifetimeRevenue)}</div>
          </div>
          <div>
            <span className="text-slate-500">305-Day Est. Yield:</span>
            <div className="font-bold text-blue-800 text-sm">{lactationCurve?.totalPredicted305Day || 0} L</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-5 bg-white text-xs font-medium space-x-4">
          <button
            onClick={() => setActiveTab('milk')}
            className={`py-3 flex items-center gap-1.5 border-b-2 transition-colors ${
              activeTab === 'milk'
                ? 'border-emerald-600 text-emerald-800 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Milk className="w-4 h-4" />
            <span>Milking History ({animalMilkLogs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('curve')}
            className={`py-3 flex items-center gap-1.5 border-b-2 transition-colors ${
              activeTab === 'curve'
                ? 'border-emerald-600 text-emerald-800 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>AI Lactation Curve (Wood's Model)</span>
          </button>

          <button
            onClick={() => setActiveTab('breeding')}
            className={`py-3 flex items-center gap-1.5 border-b-2 transition-colors ${
              activeTab === 'breeding'
                ? 'border-emerald-600 text-emerald-800 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Breeding & AI ({animalBreedingLogs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('health')}
            className={`py-3 flex items-center gap-1.5 border-b-2 transition-colors ${
              activeTab === 'health'
                ? 'border-emerald-600 text-emerald-800 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            <span>Health & Clinical ({animalHealthLogs.length})</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === 'milk' && (
            <div className="space-y-4">
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Morning (L)</th>
                      <th className="py-2.5 px-3">Evening (L)</th>
                      <th className="py-2.5 px-3">Total (L)</th>
                      <th className="py-2.5 px-3">Sold (L)</th>
                      <th className="py-2.5 px-3">Revenue (PKR)</th>
                      <th className="py-2.5 px-3">Notes / Drop</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {animalMilkLogs.map((r) => (
                      <tr key={r.id} className={r.hasAnomaly ? 'bg-amber-50/50' : ''}>
                        <td className="py-2.5 px-3 font-mono font-medium">{r.date}</td>
                        <td className="py-2.5 px-3">{r.morningMilkLiters} L</td>
                        <td className="py-2.5 px-3">{r.eveningMilkLiters} L</td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">{r.totalDailyMilkLiters} L</td>
                        <td className="py-2.5 px-3">{r.soldQuantityLiters} L</td>
                        <td className="py-2.5 px-3 font-semibold text-emerald-800">
                          {formatPKR(r.totalSaleRevenuePKR)}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500">
                          {r.hasAnomaly ? (
                            <span className="text-amber-800 font-bold flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                              <span>{r.anomalyReason}</span>
                            </span>
                          ) : (
                            r.notes || '-'
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'curve' && lactationCurve && (
            <div className="space-y-4">
              <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200 text-xs">
                <div className="font-bold text-emerald-900 flex items-center gap-2 text-sm">
                  <Sparkles className="w-4 h-4 text-emerald-700" />
                  <span>Wood's Incomplete Gamma Lactation Curve: y(t) = a · t^b · e^(-ct)</span>
                </div>
                <p className="text-slate-600 mt-1">
                  Standard physiological curve projection calibrated for Pakistani dairy breeds.
                </p>
                <div className="grid grid-cols-3 gap-3 mt-3">
                  <div className="bg-white p-2.5 rounded-lg border border-emerald-100">
                    <span className="text-slate-500">Estimated Peak Day:</span>
                    <div className="font-bold text-slate-900">Day {lactationCurve.peakDay} in milk</div>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-emerald-100">
                    <span className="text-slate-500">Peak Milk Yield:</span>
                    <div className="font-bold text-slate-900">{lactationCurve.estimatedPeakMilk} L / day</div>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-emerald-100">
                    <span className="text-slate-500">Total 305-Day Projection:</span>
                    <div className="font-bold text-emerald-800">{lactationCurve.totalPredicted305Day} Liters</div>
                  </div>
                </div>
              </div>

              {/* Lactation Curve Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="p-3 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-800">
                  Lactation Trajectory Points (Days in Milk vs Predicted Liters)
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 p-3 text-xs">
                  {lactationCurve.standardCurvePoints.map((pt) => (
                    <div key={pt.day} className="p-2 bg-slate-50 rounded border border-slate-200 text-center">
                      <div className="text-[10px] text-slate-500 font-medium">DIM {pt.day}</div>
                      <div className="font-bold text-emerald-800">{pt.predictedLiters} L</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'breeding' && (
            <div className="space-y-3">
              {animalBreedingLogs.length === 0 ? (
                <div className="text-xs text-slate-400 py-6 text-center">
                  No artificial insemination or mating records logged for this animal.
                </div>
              ) : (
                animalBreedingLogs.map((b) => (
                  <div key={b.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-900">
                        {b.matingType} · {b.inseminationDate}
                      </span>
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-semibold text-[11px]">
                        {b.pregnancyStatus}
                      </span>
                    </div>
                    <div className="text-slate-600">
                      Semen Straw: <strong>{b.semenStrawBrandOrBullId}</strong> · Inseminator: {b.inseminatorName}
                    </div>
                    {b.expectedCalvingDate && (
                      <div className="text-slate-700">
                        Expected Calving: <strong>{b.expectedCalvingDate}</strong>
                        {b.expectedDryOffDate && ` · Dry-off: ${b.expectedDryOffDate}`}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'health' && (
            <div className="space-y-3">
              {animalHealthLogs.length === 0 ? (
                <div className="text-xs text-slate-400 py-6 text-center">
                  Clean veterinary record. No illnesses or clinical interventions logged.
                </div>
              ) : (
                animalHealthLogs.map((h) => (
                  <div key={h.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-900">
                        {h.date} · {h.diseaseOrCondition} ({h.recordType})
                      </span>
                      <span className="font-semibold text-rose-700">{formatPKR(h.costPKR)}</span>
                    </div>
                    <div className="text-slate-600">
                      Treatment: {h.treatment} ({h.dosage}) by {h.veterinarianName}
                    </div>
                    {h.milkWithdrawalDays > 0 && (
                      <div className="text-rose-700 font-semibold bg-rose-50 p-1.5 rounded">
                        Milk Withdrawal Restriction: {h.milkWithdrawalDays} days
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100"
          >
            Close Animal File
          </button>
        </div>
      </div>
    </div>
  );
};
