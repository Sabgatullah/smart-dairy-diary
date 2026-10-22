import React, { useState, useMemo } from 'react';
import { useFarm } from '../context/FarmContext';
import { HealthRecord } from '../types';
import {
  ShieldAlert,
  Plus,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Stethoscope,
  Activity,
  Sparkles,
} from 'lucide-react';

interface HealthVeterinaryProps {
  onSelectAnimal: (id: string) => void;
  onNavigateTab: (tab: string) => void;
}

export const HealthVeterinary: React.FC<HealthVeterinaryProps> = ({
  onSelectAnimal,
  onNavigateTab,
}) => {
  const { animals, healthRecords, addHealthRecord, activeDate } = useFarm();

  const [showAddModal, setShowAddModal] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');

  const [formData, setFormData] = useState({
    animalId: '',
    recordType: 'Diagnosis' as HealthRecord['recordType'],
    date: activeDate,
    diseaseOrCondition: 'Mastitis (Saaroo / ساڑو)',
    symptoms: 'Swollen quarter, hot udder, watery clots in milk',
    treatment: 'Intramammary antibiotic infusion + Meloxicam 15ml IM',
    medicineName: 'Ceftiofur intramammary syringe',
    dosage: '1 syringe daily for 3 days',
    veterinarianName: 'Dr. Nasir Iqbal (DVM)',
    costPKR: 4200,
    milkWithdrawalDays: 5,
    nextFollowUpDate: '',
    nextDueDate: '',
    notes: '',
  });

  // Active Milk Withdrawal Alerts (Antibiotics in system)
  const activeWithdrawalAlerts = useMemo(() => {
    const list: { record: HealthRecord; safeDate: string; daysRemaining: number }[] = [];
    const now = new Date(activeDate);

    for (const h of healthRecords) {
      if (h.milkWithdrawalDays > 0) {
        const tDate = new Date(h.date);
        const safeDate = new Date(tDate);
        safeDate.setDate(safeDate.getDate() + h.milkWithdrawalDays);
        const daysRemaining = Math.ceil((safeDate.getTime() - now.getTime()) / (1000 * 3600 * 24));

        if (daysRemaining >= 0) {
          list.push({
            record: h,
            safeDate: safeDate.toISOString().split('T')[0],
            daysRemaining,
          });
        }
      }
    }

    return list.sort((a, b) => a.daysRemaining - b.daysRemaining);
  }, [healthRecords, activeDate]);

  const filteredRecords = useMemo(() => {
    return healthRecords
      .filter((r) => filterType === 'all' || r.recordType === filterType)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [healthRecords, filterType]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.animalId) {
      alert('Please select an animal.');
      return;
    }

    const animal = animals.find((a) => a.id === formData.animalId);
    if (!animal) return;

    addHealthRecord({
      animalId: animal.id,
      animalTag: animal.tag,
      recordType: formData.recordType,
      date: formData.date,
      diseaseOrCondition: formData.diseaseOrCondition,
      symptoms: formData.symptoms ? formData.symptoms.split(',').map((s) => s.trim()) : [],
      treatment: formData.treatment,
      medicineName: formData.medicineName,
      dosage: formData.dosage,
      veterinarianName: formData.veterinarianName,
      costPKR: Number(formData.costPKR) || 0,
      milkWithdrawalDays: Number(formData.milkWithdrawalDays) || 0,
      nextFollowUpDate: formData.nextFollowUpDate || undefined,
      nextDueDate: formData.nextDueDate || undefined,
      notes: formData.notes,
    });

    setShowAddModal(false);
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
            <span>Animal Health & Veterinary Clinic</span>
            <span className="text-xs font-semibold px-2 py-0.5 bg-rose-50 text-rose-800 rounded border border-rose-200">
              صحت اور علاج معالجہ
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Clinical disease logs, medication dosages, bi-annual vaccination planner, and milk withdrawal safety tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab('ai-advisor')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors"
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>AI Symptom Checker</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-rose-700 hover:bg-rose-800 rounded-lg shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Record Clinical Treatment</span>
          </button>
        </div>
      </div>

      {/* Critical Active Milk Withdrawal Warning */}
      {activeWithdrawalAlerts.length > 0 && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-3 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-bold text-rose-900">
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
            <span>Active Milk Disposal / Antibiotic Withdrawal Restrictions</span>
          </div>
          <p className="text-xs text-rose-800">
            The following animal(s) are undergoing antibiotic or chemical treatment. In accordance with dairy food safety standards, their milk must be <strong>discarded</strong> and not sold to consumers or contractors until clearance.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {activeWithdrawalAlerts.map(({ record, safeDate, daysRemaining }) => (
              <div
                key={record.id}
                className="p-3 bg-white rounded-lg border border-rose-200 text-xs text-rose-900 flex justify-between items-center"
              >
                <div>
                  <div className="font-bold flex items-center gap-2">
                    <button
                      onClick={() => onSelectAnimal(record.animalId)}
                      className="text-slate-900 hover:underline"
                    >
                      {record.animalTag}
                    </button>
                    <span className="text-[11px] font-normal text-rose-700">({record.diseaseOrCondition})</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Medicine: {record.medicineName} · Safe on: <strong>{safeDate}</strong>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="px-2 py-0.5 bg-rose-100 text-rose-800 font-bold rounded">
                    {daysRemaining} day{daysRemaining > 1 ? 's' : ''} left
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Standard Vaccination & Preventive Protocol */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          <span>Pakistan Livestock Preventive Vaccination & Deworming Calendar</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="font-bold text-slate-900">Foot & Mouth Disease (FMD / منہ کھر)</div>
            <div className="text-slate-600 mt-1">
              Bi-annual vaccination (Feb-March & Sept-Oct). Trivalent oil adjuvant vaccine (3ml S/C).
            </div>
            <div className="mt-2 text-[11px] text-emerald-700 font-semibold">Status: Farm herd protected</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="font-bold text-slate-900">Hemorrhagic Septicemia (HS / گل گھوٹو)</div>
            <div className="text-slate-600 mt-1">
              Annual pre-monsoon vaccination in May/June. High mortality in Nili-Ravi buffaloes if skipped.
            </div>
            <div className="mt-2 text-[11px] text-emerald-700 font-semibold">Status: Next due May 2027</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="font-bold text-slate-900">Quarterly Deworming (کرم کش دوا)</div>
            <div className="text-slate-600 mt-1">
              Oral drench (Albendazole / Oxyclozanide) for liver fluke and roundworms every 90 days.
            </div>
            <div className="mt-2 text-[11px] text-emerald-700 font-semibold">Status: Next drench Nov 2026</div>
          </div>
        </div>
      </div>

      {/* Filter and Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xs font-bold text-slate-900">
              Clinical Veterinary Log ({filteredRecords.length} records)
            </h2>
            <p className="text-[11px] text-slate-500">
              Treatments, vaccines, and surgical interventions
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Filter Type:</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="text-xs p-1.5 border border-slate-300 rounded-lg bg-white"
            >
              <option value="all">All Records</option>
              <option value="Diagnosis">Diagnoses & Illnesses</option>
              <option value="Vaccination">Vaccinations</option>
              <option value="Deworming">Deworming</option>
              <option value="Checkup">General Checkups</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-800">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Animal Tag</th>
                <th className="py-3 px-4">Record Type</th>
                <th className="py-3 px-4">Condition / Disease</th>
                <th className="py-3 px-4">Treatment & Medicine</th>
                <th className="py-3 px-4">Dosage</th>
                <th className="py-3 px-4">Veterinarian</th>
                <th className="py-3 px-4">Cost (PKR)</th>
                <th className="py-3 px-4">Withdrawal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-mono">{r.date}</td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">
                    <button
                      onClick={() => onSelectAnimal(r.animalId)}
                      className="hover:underline text-emerald-800"
                    >
                      {r.animalTag}
                    </button>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded font-medium bg-slate-100 text-slate-700 text-[11px]">
                      {r.recordType}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-900">{r.diseaseOrCondition}</td>
                  <td className="py-3 px-4 max-w-[200px] truncate" title={r.treatment}>
                    {r.treatment}
                  </td>
                  <td className="py-3 px-4">{r.dosage}</td>
                  <td className="py-3 px-4">{r.veterinarianName}</td>
                  <td className="py-3 px-4 font-semibold">{formatPKR(r.costPKR)}</td>
                  <td className="py-3 px-4">
                    {r.milkWithdrawalDays > 0 ? (
                      <span className="text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        {r.milkWithdrawalDays} days
                      </span>
                    ) : (
                      <span className="text-slate-400">None</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Treatment Record Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <form
            onSubmit={handleAddSubmit}
            className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h2 className="text-base font-bold text-slate-900">Record Health / Treatment Log</h2>
              <span className="text-xs text-rose-700 font-semibold">Clinical Entry</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Animal *</label>
                <select
                  required
                  value={formData.animalId}
                  onChange={(e) => setFormData({ ...formData, animalId: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="">-- Select Animal --</option>
                  {animals.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.tag} - {a.name} ({a.species})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Record Type</label>
                <select
                  value={formData.recordType}
                  onChange={(e) => setFormData({ ...formData, recordType: e.target.value as any })}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="Diagnosis">Clinical Diagnosis / Sickness</option>
                  <option value="Vaccination">Vaccination</option>
                  <option value="Deworming">Deworming Drench</option>
                  <option value="Checkup">Routine Veterinary Checkup</option>
                  <option value="Surgery">Minor Surgery</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Date *</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Disease / Condition *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mastitis, FMD, Milk Fever, Bloat"
                  value={formData.diseaseOrCondition}
                  onChange={(e) => setFormData({ ...formData, diseaseOrCondition: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Observed Symptoms</label>
                <input
                  type="text"
                  placeholder="e.g. High fever, swollen left teat, watery milk clots"
                  value={formData.symptoms}
                  onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Treatment & Medicine Administered</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ceftiofur intramammary + Meloxicam 15ml IM"
                  value={formData.treatment}
                  onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Dosage & Frequency</label>
                <input
                  type="text"
                  placeholder="e.g. 15 ml once daily for 3 days"
                  value={formData.dosage}
                  onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Veterinarian Name</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Nasir Iqbal (DVM)"
                  value={formData.veterinarianName}
                  onChange={(e) => setFormData({ ...formData, veterinarianName: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Medicine & Vet Cost (PKR)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.costPKR}
                  onChange={(e) => setFormData({ ...formData, costPKR: parseFloat(e.target.value) || 0 })}
                  className="w-full p-2 border border-slate-300 rounded-lg font-semibold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Milk Withdrawal Period (Days)
                </label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={formData.milkWithdrawalDays}
                  onChange={(e) => setFormData({ ...formData, milkWithdrawalDays: parseInt(e.target.value, 10) || 0 })}
                  className="w-full p-2 border border-slate-300 rounded-lg font-semibold text-rose-700"
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
                Save Health Record
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
