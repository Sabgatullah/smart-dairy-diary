import React, { useState, useMemo } from 'react';
import { useFarm } from '../context/FarmContext';
import { DailyMilkRecord } from '../types';
import {
  Calendar,
  Plus,
  AlertTriangle,
  Edit2,
  Trash2,
  TrendingDown,
  TrendingUp,
  Search,
  Filter,
  CheckCircle2,
  Milk,
  BarChart2,
  Sparkles,
} from 'lucide-react';

interface MilkDiaryProps {
  onOpenQuickBulkModal: () => void;
  onSelectAnimal: (id: string) => void;
  onNavigateTab: (tab: string) => void;
}

export const MilkDiary: React.FC<MilkDiaryProps> = ({
  onOpenQuickBulkModal,
  onSelectAnimal,
  onNavigateTab,
}) => {
  const {
    animals,
    milkRecords,
    addMilkRecord,
    updateMilkRecord,
    deleteMilkRecord,
    activeDate,
    setActiveDate,
    settings,
    activeMilkDropAlerts,
  } = useFarm();

  const [filterAnimalId, setFilterAnimalId] = useState<string>('all');
  const [filterStartDate, setFilterStartDate] = useState<string>('');
  const [filterEndDate, setFilterEndDate] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<DailyMilkRecord | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    date: activeDate,
    animalId: '',
    morning: 0,
    evening: 0,
    afternoon: 0,
    soldQty: 0,
    rate: settings.defaultBuffaloMilkRatePKR,
    fat: 6.5,
    notes: '',
  });

  const milkingAnimals = useMemo(() => {
    return animals.filter((a) => a.status === 'Milking');
  }, [animals]);

  // Selected animal in form
  const selectedFormAnimal = useMemo(() => {
    return animals.find((a) => a.id === formData.animalId);
  }, [animals, formData.animalId]);

  // Set default rate depending on cow vs buffalo
  const handleAnimalSelectInForm = (id: string) => {
    const animal = animals.find((a) => a.id === id);
    const rate = animal?.species === 'Cow' ? settings.defaultCowMilkRatePKR : settings.defaultBuffaloMilkRatePKR;
    const fat = animal?.species === 'Cow' ? 4.2 : 6.8;
    setFormData((prev) => ({
      ...prev,
      animalId: id,
      rate,
      fat,
    }));
  };

  // Filtered Records
  const filteredRecords = useMemo(() => {
    return milkRecords.filter((r) => {
      const matchAnimal = filterAnimalId === 'all' || r.animalId === filterAnimalId;
      const matchStart = !filterStartDate || r.date >= filterStartDate;
      const matchEnd = !filterEndDate || r.date <= filterEndDate;
      return matchAnimal && matchStart && matchEnd;
    }).sort((a, b) => b.date.localeCompare(a.date));
  }, [milkRecords, filterAnimalId, filterStartDate, filterEndDate]);

  // Aggregate stats for filtered records
  const stats = useMemo(() => {
    const totalLiters = filteredRecords.reduce((acc, r) => acc + r.totalDailyMilkLiters, 0);
    const totalRevenue = filteredRecords.reduce((acc, r) => acc + r.totalSaleRevenuePKR, 0);
    const totalSold = filteredRecords.reduce((acc, r) => acc + r.soldQuantityLiters, 0);
    const avgYield = filteredRecords.length > 0 ? totalLiters / filteredRecords.length : 0;

    return {
      totalLiters: Math.round(totalLiters * 10) / 10,
      totalRevenue,
      totalSold: Math.round(totalSold * 10) / 10,
      avgYield: Math.round(avgYield * 10) / 10,
    };
  }, [filteredRecords]);

  const handleSaveEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.animalId) {
      alert('Please select an animal.');
      return;
    }

    const animal = animals.find((a) => a.id === formData.animalId);
    if (!animal) return;

    const morn = parseFloat(String(formData.morning)) || 0;
    const eve = parseFloat(String(formData.evening)) || 0;
    const aft = parseFloat(String(formData.afternoon)) || 0;
    const total = Math.round((morn + eve + aft) * 10) / 10;
    const sold = formData.soldQty !== undefined ? parseFloat(String(formData.soldQty)) : total;
    const rate = parseFloat(String(formData.rate)) || 200;
    const revenue = Math.round(sold * rate);

    if (editingRecord) {
      updateMilkRecord(editingRecord.id, {
        date: formData.date,
        animalId: animal.id,
        animalTag: animal.tag,
        morningMilkLiters: morn,
        eveningMilkLiters: eve,
        afternoonMilkLiters: aft,
        totalDailyMilkLiters: total,
        soldQuantityLiters: sold,
        saleRatePerLiterPKR: rate,
        totalSaleRevenuePKR: revenue,
        fatPercentage: parseFloat(String(formData.fat)) || 0,
        notes: formData.notes,
      });
      setEditingRecord(null);
    } else {
      const res = addMilkRecord({
        date: formData.date,
        animalId: animal.id,
        animalTag: animal.tag,
        morningMilkLiters: morn,
        eveningMilkLiters: eve,
        afternoonMilkLiters: aft,
        totalDailyMilkLiters: total,
        soldQuantityLiters: sold,
        saleRatePerLiterPKR: rate,
        totalSaleRevenuePKR: revenue,
        fatPercentage: parseFloat(String(formData.fat)) || 0,
        notes: formData.notes,
      });

      if (!res.success) {
        alert(res.message);
        return;
      }
    }

    setShowAddForm(false);
    setFormData({
      date: activeDate,
      animalId: '',
      morning: 0,
      evening: 0,
      afternoon: 0,
      soldQty: 0,
      rate: settings.defaultBuffaloMilkRatePKR,
      fat: 6.5,
      notes: '',
    });
  };

  const handleEditClick = (record: DailyMilkRecord) => {
    setEditingRecord(record);
    setFormData({
      date: record.date,
      animalId: record.animalId,
      morning: record.morningMilkLiters,
      evening: record.eveningMilkLiters,
      afternoon: record.afternoonMilkLiters || 0,
      soldQty: record.soldQuantityLiters,
      rate: record.saleRatePerLiterPKR,
      fat: record.fatPercentage || 5.0,
      notes: record.notes || '',
    });
    setShowAddForm(true);
  };

  const formatPKR = (val: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Header & Quick Action */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Daily Milk Production Diary</span>
            <span className="text-xs font-semibold px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded border border-emerald-200">
              روغنی دودھ پیداوار
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Automated morning/evening milking ledger, sales revenue calculations, and AI drop detection.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onOpenQuickBulkModal}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm transition-all"
          >
            <Milk className="w-4 h-4" />
            <span>Fast Bulk Milk Sheet (Today)</span>
          </button>

          <button
            onClick={() => {
              setEditingRecord(null);
              setShowAddForm(!showAddForm);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{showAddForm ? 'Close Form' : 'Single Milk Entry'}</span>
          </button>
        </div>
      </div>

      {/* AI Milk Drop Warning Banner */}
      {activeMilkDropAlerts.length > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <div className="flex items-center gap-2 font-bold text-amber-900 text-sm mb-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>AI Automated Yield Drop Detection Alert</span>
          </div>
          <div className="space-y-2">
            {activeMilkDropAlerts.map((alert) => (
              <div
                key={alert.animalId}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 bg-white/80 rounded-lg border border-amber-200 text-xs text-amber-900"
              >
                <div>
                  <span className="font-bold text-slate-900">{alert.animalTag} ({alert.animalName})</span>: Yield decreased by <strong>{alert.dropPercentage}%</strong> (Avg: {alert.previousAvgLiters}L → Today: {alert.todayLiters}L).
                  <span className="text-amber-800 ml-1">Possible cause: {alert.suggestedCauses[0]}.</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onSelectAnimal(alert.animalId)}
                    className="font-semibold text-amber-900 hover:underline"
                  >
                    Animal History &rarr;
                  </button>
                  <button
                    onClick={() => onNavigateTab('ai-advisor')}
                    className="px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded font-medium flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>AI Diagnose</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Single Entry / Edit Form */}
      {showAddForm && (
        <form
          onSubmit={handleSaveEntry}
          className="bg-white p-5 rounded-xl border border-emerald-300 shadow-md space-y-4"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h2 className="text-sm font-bold text-slate-900">
              {editingRecord ? `Edit Milk Record: ${editingRecord.animalTag} (${editingRecord.date})` : 'Record Single Milking Entry'}
            </h2>
            <span className="text-xs text-slate-500">Auto-calculates daily totals and sales</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Date *</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Animal (Milking) *</label>
              <select
                required
                value={formData.animalId}
                onChange={(e) => handleAnimalSelectInForm(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-600 bg-white"
              >
                <option value="">-- Select Animal --</option>
                {milkingAnimals.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.tag} - {a.name} ({a.species} / {a.breed})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Morning Milk (Liters) *</label>
              <input
                type="number"
                step="0.1"
                min="0"
                required
                value={formData.morning}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  setFormData((prev) => ({
                    ...prev,
                    morning: val,
                    soldQty: val + prev.evening + prev.afternoon,
                  }));
                }}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-600 font-semibold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Evening Milk (Liters) *</label>
              <input
                type="number"
                step="0.1"
                min="0"
                required
                value={formData.evening}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  setFormData((prev) => ({
                    ...prev,
                    evening: val,
                    soldQty: prev.morning + val + prev.afternoon,
                  }));
                }}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-600 font-semibold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Afternoon / 3rd Milk (Liters)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={formData.afternoon}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  setFormData((prev) => ({
                    ...prev,
                    afternoon: val,
                    soldQty: prev.morning + prev.evening + val,
                  }));
                }}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Quantity Sold (Liters)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={formData.soldQty}
                onChange={(e) => setFormData({ ...formData, soldQty: parseFloat(e.target.value) || 0 })}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Sale Rate (PKR / Liter)</label>
              <input
                type="number"
                min="0"
                value={formData.rate}
                onChange={(e) => setFormData({ ...formData, rate: parseFloat(e.target.value) || 0 })}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-600 font-semibold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Fat Percentage (%)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="12"
                value={formData.fat}
                onChange={(e) => setFormData({ ...formData, fat: parseFloat(e.target.value) || 0 })}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-600"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 text-xs mb-1">Milking Session Notes</label>
            <input
              type="text"
              placeholder="e.g. Fed extra Wanda; milker noted calm behavior; test milk fat with Gerber method"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-slate-600 font-semibold">
              Total Today: {Math.round((Number(formData.morning) + Number(formData.evening) + Number(formData.afternoon)) * 10) / 10} L |
              Revenue: {formatPKR(Math.round(Number(formData.soldQty) * Number(formData.rate)))}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingRecord(null);
                }}
                className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm"
              >
                {editingRecord ? 'Update Entry' : 'Save Record'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Filter & Date Range */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
        <div>
          <label className="block font-medium text-slate-600 mb-1">Filter by Animal</label>
          <select
            value={filterAnimalId}
            onChange={(e) => setFilterAnimalId(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded-lg bg-white text-slate-800"
          >
            <option value="all">All Animals</option>
            {animals.map((a) => (
              <option key={a.id} value={a.id}>
                {a.tag} ({a.name})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium text-slate-600 mb-1">From Date</label>
          <input
            type="date"
            value={filterStartDate}
            onChange={(e) => setFilterStartDate(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded-lg"
          />
        </div>

        <div>
          <label className="block font-medium text-slate-600 mb-1">To Date</label>
          <input
            type="date"
            value={filterEndDate}
            onChange={(e) => setFilterEndDate(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded-lg"
          />
        </div>

        <div className="flex items-end">
          <button
            onClick={() => {
              setFilterAnimalId('all');
              setFilterStartDate('');
              setFilterEndDate('');
            }}
            className="w-full p-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Aggregate Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs">
          <div className="text-slate-500">Filtered Milk Output</div>
          <div className="text-lg font-bold text-slate-900 mt-0.5">{stats.totalLiters} L</div>
        </div>
        <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs">
          <div className="text-slate-500">Filtered Sales Revenue</div>
          <div className="text-lg font-bold text-emerald-800 mt-0.5">{formatPKR(stats.totalRevenue)}</div>
        </div>
        <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs">
          <div className="text-slate-500">Total Liters Sold</div>
          <div className="text-lg font-bold text-slate-900 mt-0.5">{stats.totalSold} L</div>
        </div>
        <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs">
          <div className="text-slate-500">Avg Yield / Entry</div>
          <div className="text-lg font-bold text-slate-900 mt-0.5">{stats.avgYield} L</div>
        </div>
      </div>

      {/* Milk Records Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="text-xs font-bold text-slate-900">
            Milking Production Ledger ({filteredRecords.length} Entries)
          </div>
          <div className="text-xs text-slate-500">
            Showing individual morning, evening & sales totals
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-800">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Animal Tag</th>
                <th className="py-3 px-4">Morning (L)</th>
                <th className="py-3 px-4">Evening (L)</th>
                <th className="py-3 px-4">Total (L)</th>
                <th className="py-3 px-4">Sold (L)</th>
                <th className="py-3 px-4">Rate (PKR)</th>
                <th className="py-3 px-4">Revenue (PKR)</th>
                <th className="py-3 px-4">Fat %</th>
                <th className="py-3 px-4">Alert / Notes</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-slate-400 text-xs">
                    No milk records found for the selected filter.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r) => (
                  <tr
                    key={r.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      r.hasAnomaly ? 'bg-amber-50/50' : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-mono font-medium text-slate-800">{r.date}</td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-900">
                      <button
                        onClick={() => onSelectAnimal(r.animalId)}
                        className="hover:underline flex items-center gap-1"
                      >
                        {r.animalTag}
                      </button>
                    </td>
                    <td className="py-3 px-4">{r.morningMilkLiters} L</td>
                    <td className="py-3 px-4">{r.eveningMilkLiters} L</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{r.totalDailyMilkLiters} L</td>
                    <td className="py-3 px-4">
                      {r.soldQuantityLiters === 0 ? (
                        <span className="text-rose-600 font-semibold">Withheld (0L)</span>
                      ) : (
                        `${r.soldQuantityLiters} L`
                      )}
                    </td>
                    <td className="py-3 px-4">Rs. {r.saleRatePerLiterPKR}</td>
                    <td className="py-3 px-4 font-semibold text-emerald-800">
                      {formatPKR(r.totalSaleRevenuePKR)}
                    </td>
                    <td className="py-3 px-4">{r.fatPercentage ? `${r.fatPercentage}%` : '-'}</td>
                    <td className="py-3 px-4 max-w-[200px] truncate">
                      {r.hasAnomaly ? (
                        <span className="flex items-center gap-1 text-amber-800 font-semibold" title={r.anomalyReason}>
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span className="truncate">{r.anomalyReason || 'Drop detected'}</span>
                        </span>
                      ) : (
                        <span className="text-slate-500 truncate">{r.notes || '-'}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEditClick(r)}
                          className="p-1 text-slate-500 hover:text-slate-800 rounded"
                          title="Edit Record"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete milk record for ${r.animalTag} on ${r.date}?`)) {
                              deleteMilkRecord(r.id);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded"
                          title="Delete Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
