import React, { useState, useMemo } from 'react';
import { useFarm } from '../context/FarmContext';
import { BreedingRecord } from '../types';
import { calculateBreedingDates, predictUpcomingHeat } from '../utils/aiAnalytics';
import {
  Heart,
  Calendar,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  ChevronRight,
  Baby,
  Edit2,
} from 'lucide-react';

interface BreedingReproductionProps {
  onSelectAnimal: (id: string) => void;
}

export const BreedingReproduction: React.FC<BreedingReproductionProps> = ({ onSelectAnimal }) => {
  const {
    animals,
    breedingRecords,
    addBreedingRecord,
    updateBreedingRecord,
    activeDate,
  } = useFarm();

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedRecordForUpdate, setSelectedRecordForUpdate] = useState<BreedingRecord | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    animalId: '',
    heatObservedDate: activeDate,
    heatSymptoms: ['Clear mucous discharge', 'Bellowing', 'Standing heat'],
    matingType: 'AI' as 'AI' | 'Natural',
    semenStrawBrandOrBullId: 'Punjab Livestock Semen - Sahiwal S-402',
    inseminationDate: activeDate,
    inseminatorName: 'Dr. Tariq Mahmood (Punjab Livestock)',
    costPKR: 4000,
    notes: '',
  });

  const femaleAnimals = useMemo(() => {
    return animals.filter((a) => a.gender === 'Female' && a.status !== 'Sold' && a.status !== 'Deceased');
  }, [animals]);

  // Upcoming heat recurrence predictions (21-day cycle)
  const heatPredictions = useMemo(() => {
    return predictUpcomingHeat(breedingRecords);
  }, [breedingRecords]);

  // Gestation Countdowns & Upcoming Calvings
  const pregnantList = useMemo(() => {
    const now = new Date(activeDate);
    return breedingRecords
      .filter((b) => b.pregnancyStatus === 'Confirmed Pregnant' && b.expectedCalvingDate)
      .map((b) => {
        const calvingD = new Date(b.expectedCalvingDate!);
        const daysLeft = Math.round((calvingD.getTime() - now.getTime()) / (1000 * 3600 * 24));
        const animal = animals.find((a) => a.id === b.animalId);

        return {
          ...b,
          daysLeft,
          species: animal?.species || 'Cow',
          breed: animal?.breed || '',
          name: animal?.name || b.animalTag,
        };
      })
      .sort((a, b) => a.daysLeft - b.daysLeft);
  }, [breedingRecords, activeDate, animals]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.animalId) {
      alert('Please select an animal.');
      return;
    }

    const animal = animals.find((a) => a.id === formData.animalId);
    if (!animal) return;

    const dates = calculateBreedingDates(animal.species, formData.inseminationDate);

    addBreedingRecord({
      animalId: animal.id,
      animalTag: animal.tag,
      heatObservedDate: formData.heatObservedDate,
      heatSymptoms: formData.heatSymptoms,
      matingType: formData.matingType,
      semenStrawBrandOrBullId: formData.semenStrawBrandOrBullId,
      inseminationDate: formData.inseminationDate,
      inseminatorName: formData.inseminatorName,
      costPKR: Number(formData.costPKR) || 0,
      pregnancyCheckDueDate: dates?.pregnancyCheckDueDate || '',
      pregnancyStatus: 'Pending Check',
      expectedCalvingDate: dates?.expectedCalvingDate,
      expectedDryOffDate: dates?.expectedDryOffDate,
      notes: formData.notes,
    });

    setShowAddModal(false);
  };

  const handleConfirmPregnancy = (record: BreedingRecord, status: 'Confirmed Pregnant' | 'Empty / Repeat') => {
    const animal = animals.find((a) => a.id === record.animalId);
    let expectedCalving = record.expectedCalvingDate;
    let expectedDryOff = record.expectedDryOffDate;

    if (status === 'Confirmed Pregnant' && animal && !expectedCalving) {
      const dates = calculateBreedingDates(animal.species, record.inseminationDate);
      expectedCalving = dates?.expectedCalvingDate;
      expectedDryOff = dates?.expectedDryOffDate;
    }

    updateBreedingRecord(record.id, {
      pregnancyStatus: status,
      pregnancyConfirmedDate: activeDate,
      expectedCalvingDate: status === 'Confirmed Pregnant' ? expectedCalving : undefined,
      expectedDryOffDate: status === 'Confirmed Pregnant' ? expectedDryOff : undefined,
    });
  };

  const formatPKR = (num: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Breeding, AI & Calving Management</span>
            <span className="text-xs font-semibold px-2 py-0.5 bg-rose-50 text-rose-800 rounded border border-rose-200">
              نسل کشی اور مصنوعی حمل
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Gestation tracking (283 days for cows, 310 days for buffaloes), estrus recurrence alerts, and pregnancy verification.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-rose-700 hover:bg-rose-800 rounded-lg shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Record AI / Insemination</span>
        </button>
      </div>

      {/* 21-Day Estrus & Pregnancy Check Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Heat Recurrence Monitor */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>21-Day Heat Recurrence Watchlist</span>
            </h2>
            <span className="text-[10px] text-slate-500">Monitor for repeat estrus</span>
          </div>

          <div className="space-y-2">
            {heatPredictions.length === 0 ? (
              <div className="text-xs text-slate-400 py-4 text-center">
                No open animals currently in the 18–24 day heat recurrence window.
              </div>
            ) : (
              heatPredictions.map((p, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg border border-amber-200 bg-amber-50/70 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span>{p.animalTag}</span>
                      <span className="text-[10px] px-1.5 py-0.2 bg-amber-200 text-amber-900 rounded font-semibold">
                        {p.urgency}
                      </span>
                    </div>
                    <div className="text-[11px] text-amber-800 mt-0.5">
                      Last AI: {p.lastHeatDate} · Next Est. Cycle: <strong>{p.nextExpectedHeatDate}</strong>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-amber-900">
                      {p.daysUntilHeat === 0 ? 'Due Today' : p.daysUntilHeat > 0 ? `In ${p.daysUntilHeat}d` : `${Math.abs(p.daysUntilHeat)}d ago`}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Gestation Countdown & Calving Alert */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
              <Baby className="w-4 h-4 text-blue-600" />
              <span>Confirmed Gestation & Calving Calendar</span>
            </h2>
            <span className="text-[10px] text-blue-700 font-semibold">{pregnantList.length} In Calf</span>
          </div>

          <div className="space-y-2">
            {pregnantList.length === 0 ? (
              <div className="text-xs text-slate-400 py-4 text-center">
                No animals currently confirmed pregnant.
              </div>
            ) : (
              pregnantList.map((p) => (
                <div
                  key={p.id}
                  className="p-2.5 rounded-lg border border-blue-200 bg-blue-50/60 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span>{p.animalTag}</span>
                      <span className="text-slate-600 font-normal">({p.name})</span>
                      <span className="text-[10px] text-blue-800 bg-blue-100 px-1.5 py-0.2 rounded font-medium">
                        {p.species}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 mt-0.5">
                      Expected Calving: <strong>{p.expectedCalvingDate}</strong>
                      {p.expectedDryOffDate && (
                        <span> · Dry-off: {p.expectedDryOffDate}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-blue-900">
                      {p.daysLeft > 0 ? `${p.daysLeft} days` : 'Calving Due!'}
                    </div>
                    <div className="text-[10px] text-slate-500">Remaining</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Breeding Records Ledger Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-900">
            Artificial Insemination (AI) & Natural Mating Registry ({breedingRecords.length} records)
          </h2>
          <span className="text-xs text-slate-500">
            Punjab Livestock & Private Semen tracking
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-800">
              <tr>
                <th className="py-3 px-4">Animal Tag</th>
                <th className="py-3 px-4">AI / Mating Date</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Semen Straw / Bull Tag</th>
                <th className="py-3 px-4">Inseminator</th>
                <th className="py-3 px-4">Cost (PKR)</th>
                <th className="py-3 px-4">Pregnancy Status</th>
                <th className="py-3 px-4">Check Due Date</th>
                <th className="py-3 px-4">Expected Calving</th>
                <th className="py-3 px-4 text-right">Update Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {breedingRecords.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">
                    <button
                      onClick={() => onSelectAnimal(r.animalId)}
                      className="hover:underline text-emerald-800"
                    >
                      {r.animalTag}
                    </button>
                  </td>
                  <td className="py-3 px-4 font-medium">{r.inseminationDate}</td>
                  <td className="py-3 px-4">{r.matingType}</td>
                  <td className="py-3 px-4 font-medium text-slate-800">{r.semenStrawBrandOrBullId}</td>
                  <td className="py-3 px-4">{r.inseminatorName}</td>
                  <td className="py-3 px-4">{formatPKR(r.costPKR)}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded font-semibold text-[11px] ${
                        r.pregnancyStatus === 'Confirmed Pregnant'
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : r.pregnancyStatus === 'Empty / Repeat'
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {r.pregnancyStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono">{r.pregnancyCheckDueDate || '-'}</td>
                  <td className="py-3 px-4 font-mono font-medium text-slate-900">{r.expectedCalvingDate || '-'}</td>
                  <td className="py-3 px-4 text-right">
                    {r.pregnancyStatus === 'Pending Check' ? (
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleConfirmPregnancy(r, 'Confirmed Pregnant')}
                          className="px-2 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200"
                          title="Confirm Pregnant"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => handleConfirmPregnancy(r, 'Empty / Repeat')}
                          className="px-2 py-1 text-[11px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded border border-rose-200"
                          title="Mark Empty / Repeat"
                        >
                          Empty
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400">Recorded</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add AI / Breeding Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <form
            onSubmit={handleAddSubmit}
            className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h2 className="text-base font-bold text-slate-900">Record Insemination / Mating Event</h2>
              <span className="text-xs text-rose-700 font-semibold">AI Log</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Animal Tag *</label>
                <select
                  required
                  value={formData.animalId}
                  onChange={(e) => setFormData({ ...formData, animalId: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="">-- Select Female --</option>
                  {femaleAnimals.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.tag} - {a.name} ({a.species} / {a.breed})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mating Method</label>
                <select
                  value={formData.matingType}
                  onChange={(e) => setFormData({ ...formData, matingType: e.target.value as any })}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="AI">Artificial Insemination (AI)</option>
                  <option value="Natural">Natural Service (Bull)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Insemination Date *</label>
                <input
                  type="date"
                  required
                  value={formData.inseminationDate}
                  onChange={(e) => setFormData({ ...formData, inseminationDate: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Heat Observed Date</label>
                <input
                  type="date"
                  value={formData.heatObservedDate}
                  onChange={(e) => setFormData({ ...formData, heatObservedDate: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Semen Straw Brand / Bull Tag *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sahiwal Cattle Farm Straw S-402 or ABS Nili-Ravi B-110"
                  value={formData.semenStrawBrandOrBullId}
                  onChange={(e) => setFormData({ ...formData, semenStrawBrandOrBullId: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Inseminator / Vet Name</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Tariq Mahmood"
                  value={formData.inseminatorName}
                  onChange={(e) => setFormData({ ...formData, inseminatorName: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Cost (PKR)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.costPKR}
                  onChange={(e) => setFormData({ ...formData, costPKR: parseFloat(e.target.value) || 0 })}
                  className="w-full p-2 border border-slate-300 rounded-lg font-semibold"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-700 hover:bg-rose-800 rounded-lg shadow-sm"
              >
                Save Breeding Event
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
