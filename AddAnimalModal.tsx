import React, { useState } from 'react';
import { useFarm } from '../context/FarmContext';
import { Animal, Species, AnimalStatus } from '../types';
import { X, Plus, AlertCircle } from 'lucide-react';

interface AddAnimalModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingAnimal?: Animal | null;
}

export const AddAnimalModal: React.FC<AddAnimalModalProps> = ({
  isOpen,
  onClose,
  editingAnimal,
}) => {
  const { addAnimal, updateAnimal, activeDate } = useFarm();

  const [formData, setFormData] = useState({
    tag: editingAnimal?.tag || '',
    name: editingAnimal?.name || '',
    species: (editingAnimal?.species || 'Buffalo') as Species,
    breed: editingAnimal?.breed || 'Nili-Ravi',
    gender: (editingAnimal?.gender || 'Female') as 'Female' | 'Male',
    dob: editingAnimal?.dob || '2021-01-01',
    purchaseDate: editingAnimal?.purchaseDate || activeDate,
    purchasePricePKR: editingAnimal?.purchasePricePKR || 350000,
    sellerSource: editingAnimal?.sellerSource || 'Kasur Livestock Mandi',
    status: (editingAnimal?.status || 'Milking') as AnimalStatus,
    lactationNumber: editingAnimal?.lactationNumber ?? 2,
    lastCalvingDate: editingAnimal?.lastCalvingDate || activeDate,
    location: editingAnimal?.location || 'Shed A - High Yield Milkers',
    notes: editingAnimal?.notes || '',
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!formData.tag.trim()) {
      setErrorMsg('Animal Tag / ID is required.');
      return;
    }

    if (editingAnimal) {
      updateAnimal(editingAnimal.id, {
        tag: formData.tag.trim().toUpperCase(),
        name: formData.name.trim(),
        species: formData.species,
        breed: formData.breed,
        gender: formData.gender,
        dob: formData.dob,
        purchaseDate: formData.purchaseDate,
        purchasePricePKR: Number(formData.purchasePricePKR) || 0,
        sellerSource: formData.sellerSource,
        status: formData.status,
        lactationNumber: Number(formData.lactationNumber) || 0,
        lastCalvingDate: formData.lastCalvingDate || undefined,
        location: formData.location,
        notes: formData.notes,
      });
      onClose();
    } else {
      const res = addAnimal({
        tag: formData.tag.trim().toUpperCase(),
        name: formData.name.trim() || formData.tag.trim().toUpperCase(),
        species: formData.species,
        breed: formData.breed,
        gender: formData.gender,
        dob: formData.dob,
        purchaseDate: formData.purchaseDate,
        purchasePricePKR: Number(formData.purchasePricePKR) || 0,
        sellerSource: formData.sellerSource,
        status: formData.status,
        lactationNumber: Number(formData.lactationNumber) || 0,
        lastCalvingDate: formData.lastCalvingDate || undefined,
        location: formData.location,
        notes: formData.notes,
      });

      if (!res.success) {
        setErrorMsg(res.message || 'Failed to add animal.');
        return;
      }
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {editingAnimal ? `Edit Animal: ${editingAnimal.tag}` : 'Register New Herd Animal'}
            </h2>
            <p className="text-xs text-slate-500">
              Enter identification, pedigree, purchase price (PKR), and lactation details.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Unique Tag / Ear ID *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. PK-BF-05 or PK-CW-06"
                value={formData.tag}
                onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg font-mono font-bold uppercase focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Animal Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Rani, Moti, Suraiya"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Species *</label>
              <select
                value={formData.species}
                onChange={(e) => {
                  const sp = e.target.value as Species;
                  setFormData({
                    ...formData,
                    species: sp,
                    breed: sp === 'Buffalo' ? 'Nili-Ravi' : 'Sahiwal',
                  });
                }}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white"
              >
                <option value="Buffalo">Buffalo (بھینس)</option>
                <option value="Cow">Cow (گائے)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Breed *</label>
              <select
                value={formData.breed}
                onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white"
              >
                {formData.species === 'Buffalo' ? (
                  <>
                    <option value="Nili-Ravi">Nili-Ravi (Pure)</option>
                    <option value="Kundi">Kundi (Sindh)</option>
                    <option value="Crossbred Buffalo">Crossbred Buffalo</option>
                  </>
                ) : (
                  <>
                    <option value="Sahiwal">Sahiwal (Pure Indigenous)</option>
                    <option value="Cholistani">Cholistani</option>
                    <option value="Red Sindhi">Red Sindhi</option>
                    <option value="Crossbred (HF x Sahiwal)">Crossbred (HF x Sahiwal)</option>
                    <option value="Crossbred (Jersey x Sahiwal)">Crossbred (Jersey x Sahiwal)</option>
                    <option value="Holstein Friesian">Holstein Friesian</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white"
              >
                <option value="Female">Female (Cow / Buffalo / Heifer)</option>
                <option value="Male">Male (Breeding Bull / Ox)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Current Status *</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white"
              >
                <option value="Milking">Milking</option>
                <option value="Dry">Dry</option>
                <option value="Pregnant">Pregnant</option>
                <option value="Sick">Sick / Under Treatment</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Date of Birth (or Est. Age)</label>
              <input
                type="date"
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Lactation Number</label>
              <input
                type="number"
                min="0"
                max="12"
                value={formData.lactationNumber}
                onChange={(e) => setFormData({ ...formData, lactationNumber: parseInt(e.target.value, 10) || 0 })}
                className="w-full p-2 border border-slate-300 rounded-lg font-semibold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Last Calving Date</label>
              <input
                type="date"
                value={formData.lastCalvingDate}
                onChange={(e) => setFormData({ ...formData, lastCalvingDate: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Purchase Price (PKR)</label>
              <input
                type="number"
                min="0"
                value={formData.purchasePricePKR}
                onChange={(e) => setFormData({ ...formData, purchasePricePKR: parseFloat(e.target.value) || 0 })}
                className="w-full p-2 border border-slate-300 rounded-lg font-semibold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Seller / Source / Mandi</label>
              <input
                type="text"
                placeholder="e.g. Okara Mandi or Local Breeder"
                value={formData.sellerSource}
                onChange={(e) => setFormData({ ...formData, sellerSource: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Location / Shed Allocation</label>
              <input
                type="text"
                placeholder="e.g. Shed A - High Yield Milkers"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">General Notes & Pedigree</label>
            <textarea
              rows={2}
              placeholder="e.g. Calved with heifer calf; very gentle milker; high fat tester"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm"
            >
              {editingAnimal ? 'Update Animal Record' : 'Register Animal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
