import React, { useState, useEffect } from 'react';
import { useFarm } from '../context/FarmContext';
import { Milk, X, Check, Save } from 'lucide-react';

interface QuickMilkEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickMilkEntryModal: React.FC<QuickMilkEntryModalProps> = ({ isOpen, onClose }) => {
  const { animals, milkRecords, bulkAddDailyMilk, activeDate, settings } = useFarm();

  const activeMilkers = animals.filter(
    (a) => a.status === 'Milking' && a.gender === 'Female'
  );

  // Map of animalId -> { morning, evening, afternoon, soldQty, rate, fat }
  const [entries, setEntries] = useState<
    Record<
      string,
      {
        morning: number;
        evening: number;
        afternoon: number;
        soldQty: number;
        rate: number;
        fat: number;
      }
    >
  >({});

  // Initialize from existing records on activeDate or defaults
  useEffect(() => {
    if (!isOpen) return;

    const initialMap: typeof entries = {};
    for (const a of activeMilkers) {
      const existing = milkRecords.find((r) => r.animalId === a.id && r.date === activeDate);
      const defaultRate = a.species === 'Cow' ? settings.defaultCowMilkRatePKR : settings.defaultBuffaloMilkRatePKR;
      const defaultFat = a.species === 'Cow' ? 4.2 : 6.8;

      if (existing) {
        initialMap[a.id] = {
          morning: existing.morningMilkLiters,
          evening: existing.eveningMilkLiters,
          afternoon: existing.afternoonMilkLiters || 0,
          soldQty: existing.soldQuantityLiters,
          rate: existing.saleRatePerLiterPKR,
          fat: existing.fatPercentage || defaultFat,
        };
      } else {
        initialMap[a.id] = {
          morning: 0,
          evening: 0,
          afternoon: 0,
          soldQty: 0,
          rate: defaultRate,
          fat: defaultFat,
        };
      }
    }
    setEntries(initialMap);
  }, [isOpen, activeMilkers, milkRecords, activeDate, settings]);

  if (!isOpen) return null;

  const handleFieldChange = (
    animalId: string,
    field: 'morning' | 'evening' | 'afternoon' | 'soldQty' | 'rate' | 'fat',
    value: number
  ) => {
    setEntries((prev) => {
      const current = prev[animalId] || { morning: 0, evening: 0, afternoon: 0, soldQty: 0, rate: 200, fat: 5 };
      const updated = { ...current, [field]: value };

      // Auto update soldQty if modifying morning/evening
      if (field === 'morning' || field === 'evening' || field === 'afternoon') {
        updated.soldQty = Math.round((updated.morning + updated.evening + updated.afternoon) * 10) / 10;
      }

      return {
        ...prev,
        [animalId]: updated,
      };
    });
  };

  const handleSaveAll = () => {
    const recordsToSave = activeMilkers.map((a) => {
      const e = entries[a.id] || { morning: 0, evening: 0, afternoon: 0, soldQty: 0, rate: 200, fat: 5 };
      const total = Math.round((e.morning + e.evening + e.afternoon) * 10) / 10;
      const revenue = Math.round(e.soldQty * e.rate);

      return {
        date: activeDate,
        animalId: a.id,
        animalTag: a.tag,
        morningMilkLiters: e.morning,
        eveningMilkLiters: e.evening,
        afternoonMilkLiters: e.afternoon,
        totalDailyMilkLiters: total,
        soldQuantityLiters: e.soldQty,
        saleRatePerLiterPKR: e.rate,
        totalSaleRevenuePKR: revenue,
        fatPercentage: e.fat,
      };
    });

    const result = bulkAddDailyMilk(recordsToSave);
    alert(`Bulk daily milking saved successfully! Added: ${result.added}, Updated: ${result.updated}.`);
    onClose();
  };

  // Calculate totals across all active milkers
  let totalFarmLiters = 0;
  let totalFarmRevenue = 0;
  for (const a of activeMilkers) {
    const e = entries[a.id];
    if (e) {
      const t = e.morning + e.evening + e.afternoon;
      totalFarmLiters += t;
      totalFarmRevenue += e.soldQty * e.rate;
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-700 flex items-center justify-center text-white">
              <Milk className="w-5 h-5 text-emerald-100" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Bulk Milking Log Sheet ({activeDate})
              </h2>
              <p className="text-xs text-slate-500">
                Quickly record morning and evening milking for all {activeMilkers.length} milking animals in one click.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Bulk Milking Table */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100 border-b border-slate-200 font-semibold text-slate-800 sticky top-0 z-10">
              <tr>
                <th className="py-2.5 px-3">Animal Tag & Name</th>
                <th className="py-2.5 px-3">Species</th>
                <th className="py-2.5 px-3 w-28">Morning (L)</th>
                <th className="py-2.5 px-3 w-28">Evening (L)</th>
                <th className="py-2.5 px-3">Total (L)</th>
                <th className="py-2.5 px-3 w-24">Rate (PKR)</th>
                <th className="py-2.5 px-3">Est. Income</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activeMilkers.map((animal) => {
                const entry = entries[animal.id] || { morning: 0, evening: 0, afternoon: 0, soldQty: 0, rate: 200, fat: 5 };
                const dayTotal = Math.round((entry.morning + entry.evening + entry.afternoon) * 10) / 10;
                const estIncome = Math.round(entry.soldQty * entry.rate);

                return (
                  <tr key={animal.id} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-3">
                      <div className="font-mono font-bold text-slate-900">{animal.tag}</div>
                      <div className="text-[11px] text-slate-500">{animal.name}</div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {animal.species} · {animal.breed}
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={entry.morning || ''}
                        placeholder="0"
                        onChange={(e) => handleFieldChange(animal.id, 'morning', parseFloat(e.target.value) || 0)}
                        className="w-full p-1.5 border border-slate-300 rounded font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={entry.evening || ''}
                        placeholder="0"
                        onChange={(e) => handleFieldChange(animal.id, 'evening', parseFloat(e.target.value) || 0)}
                        className="w-full p-1.5 border border-slate-300 rounded font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                      />
                    </td>
                    <td className="py-2.5 px-3 font-bold text-emerald-800 text-sm">
                      {dayTotal} L
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="number"
                        value={entry.rate}
                        onChange={(e) => handleFieldChange(animal.id, 'rate', parseFloat(e.target.value) || 0)}
                        className="w-full p-1.5 border border-slate-300 rounded font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                      />
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                      Rs. {estIncome.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-xs">
            <span className="text-slate-500">Day Production: </span>
            <span className="font-bold text-slate-900 text-sm">{Math.round(totalFarmLiters * 10) / 10} Liters</span>
            <span className="text-slate-400 mx-2">|</span>
            <span className="text-slate-500">Day Income: </span>
            <span className="font-bold text-emerald-800 text-sm">Rs. {Math.round(totalFarmRevenue).toLocaleString()}</span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200/60 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveAll}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Save Complete Milking Sheet</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
