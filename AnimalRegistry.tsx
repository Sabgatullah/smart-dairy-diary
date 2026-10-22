import React, { useState, useMemo } from 'react';
import { useFarm } from '../context/FarmContext';
import { Animal, Species, AnimalStatus } from '../types';
import {
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  DollarSign,
  AlertTriangle,
  Eye,
  CheckCircle2,
  ChevronDown,
  Info,
  Calendar,
  Layers,
} from 'lucide-react';

interface AnimalRegistryProps {
  onOpenAddModal: () => void;
  onSelectAnimal: (id: string) => void;
  onEditAnimal: (animal: Animal) => void;
}

export const AnimalRegistry: React.FC<AnimalRegistryProps> = ({
  onOpenAddModal,
  onSelectAnimal,
  onEditAnimal,
}) => {
  const { animals, recordAnimalSale, recordAnimalDeath } = useFarm();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedBreed, setSelectedBreed] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Status Action Modals (Sale / Deceased)
  const [statusActionAnimal, setStatusActionAnimal] = useState<Animal | null>(null);
  const [statusActionType, setStatusActionType] = useState<'Sale' | 'Death' | null>(null);
  const [salePrice, setSalePrice] = useState<string>('');
  const [saleBuyer, setSaleBuyer] = useState<string>('');
  const [deathCause, setDeathCause] = useState<string>('');

  // Extract unique breeds
  const breedOptions = useMemo(() => {
    const set = new Set(animals.map((a) => a.breed));
    return Array.from(set).sort();
  }, [animals]);

  // Filtered Animals
  const filteredAnimals = useMemo(() => {
    return animals.filter((animal) => {
      const matchSearch =
        animal.tag.toLowerCase().includes(searchTerm.toLowerCase()) ||
        animal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        animal.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (animal.sellerSource && animal.sellerSource.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchSpecies = selectedSpecies === 'all' || animal.species === selectedSpecies;
      const matchStatus = selectedStatus === 'all' || animal.status === selectedStatus;
      const matchBreed = selectedBreed === 'all' || animal.breed === selectedBreed;

      return matchSearch && matchSpecies && matchStatus && matchBreed;
    });
  }, [animals, searchTerm, selectedSpecies, selectedStatus, selectedBreed]);

  const handleConfirmStatusAction = () => {
    if (!statusActionAnimal || !statusActionType) return;

    if (statusActionType === 'Sale') {
      const price = parseFloat(salePrice);
      if (isNaN(price) || price < 0) {
        alert('Please enter a valid sale price in PKR');
        return;
      }
      recordAnimalSale(statusActionAnimal.id, {
        saleDate: new Date().toISOString().split('T')[0],
        salePricePKR: price,
        buyer: saleBuyer || 'Market Buyer',
        reason: 'Commercial farm culling / sale',
      });
    } else if (statusActionType === 'Death') {
      if (!deathCause.trim()) {
        alert('Please specify the cause of death.');
        return;
      }
      recordAnimalDeath(statusActionAnimal.id, {
        deathDate: new Date().toISOString().split('T')[0],
        causeOfDeath: deathCause,
      });
    }

    setStatusActionAnimal(null);
    setStatusActionType(null);
    setSalePrice('');
    setSaleBuyer('');
    setDeathCause('');
  };

  const formatPKR = (num?: number) => {
    if (!num) return 'Rs. 0';
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  const getStatusBadgeClass = (status: AnimalStatus) => {
    switch (status) {
      case 'Milking':
        return 'text-emerald-800 bg-emerald-50 border border-emerald-200';
      case 'Pregnant':
        return 'text-blue-800 bg-blue-50 border border-blue-200';
      case 'Dry':
        return 'text-slate-700 bg-slate-100 border border-slate-200';
      case 'Sick':
        return 'text-rose-800 bg-rose-50 border border-rose-200 animate-pulse';
      case 'Sold':
        return 'text-purple-800 bg-purple-50 border border-purple-200';
      case 'Deceased':
        return 'text-slate-500 bg-slate-100 border border-slate-300';
      default:
        return 'text-slate-700 bg-slate-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Search & Controls */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Animal Registry & Herd Manager</span>
            <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200">
              {filteredAnimals.length} of {animals.length} Heads
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete records of cows and buffaloes with pedigree, lactation, health, and location tracking.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1 font-medium rounded-md transition-colors ${
                viewMode === 'cards' ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Card View
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 font-medium rounded-md transition-colors ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Table View
            </button>
          </div>

          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Register New Animal</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search Tag, Name, Location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600 text-slate-900"
          />
        </div>

        {/* Species Filter */}
        <div>
          <select
            value={selectedSpecies}
            onChange={(e) => setSelectedSpecies(e.target.value)}
            className="w-full py-2 px-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600 bg-white text-slate-800"
          >
            <option value="all">All Species (Buffaloes & Cows)</option>
            <option value="Buffalo">Buffaloes (بھینس)</option>
            <option value="Cow">Cows (گائے)</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full py-2 px-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600 bg-white text-slate-800"
          >
            <option value="all">All Statuses</option>
            <option value="Milking">Milking (دودھ دینے والی)</option>
            <option value="Dry">Dry (خشک)</option>
            <option value="Pregnant">Pregnant (گابھن)</option>
            <option value="Sick">Sick / Under Treatment (بیمار)</option>
            <option value="Sold">Sold (فروخت شدہ)</option>
            <option value="Deceased">Deceased (مردہ)</option>
          </select>
        </div>

        {/* Breed Filter */}
        <div>
          <select
            value={selectedBreed}
            onChange={(e) => setSelectedBreed(e.target.value)}
            className="w-full py-2 px-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600 bg-white text-slate-800"
          >
            <option value="all">All Breeds</option>
            {breedOptions.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Animal Cards View */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAnimals.map((animal) => (
            <div
              key={animal.id}
              className={`bg-white rounded-xl border transition-all hover:shadow-md flex flex-col justify-between ${
                animal.status === 'Sick'
                  ? 'border-rose-300 ring-1 ring-rose-300'
                  : animal.status === 'Sold' || animal.status === 'Deceased'
                  ? 'border-slate-200 opacity-75'
                  : 'border-slate-200'
              }`}
            >
              <div className="p-4">
                {/* Header Tag & Status */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
                      {animal.tag}
                    </span>
                    <span className="text-xs font-semibold text-slate-800">{animal.name}</span>
                  </div>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${getStatusBadgeClass(animal.status)}`}>
                    {animal.status}
                  </span>
                </div>

                {/* Species, Breed, Lactation */}
                <div className="mt-2.5 flex items-center gap-1.5 text-xs text-slate-600">
                  <span className="font-semibold text-slate-800">{animal.species}</span>
                  <span aria-hidden="true">·</span>
                  <span>{animal.breed}</span>
                  {animal.lactationNumber > 0 && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span>Lactation #{animal.lactationNumber}</span>
                    </>
                  )}
                </div>

                {/* Key Animal Specs */}
                <div className="mt-3.5 space-y-1.5 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Location:</span>
                    <span className="font-medium text-slate-800 truncate max-w-[170px]">{animal.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Gender / Age:</span>
                    <span className="font-medium text-slate-800">
                      {animal.gender} · {animal.dob ? `${animal.dob}` : 'Adult'}
                    </span>
                  </div>
                  {animal.lastCalvingDate && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Last Calving:</span>
                      <span className="font-medium text-slate-800">{animal.lastCalvingDate}</span>
                    </div>
                  )}
                  {animal.purchasePricePKR && animal.purchasePricePKR > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Purchase Price:</span>
                      <span className="font-medium text-slate-800">{formatPKR(animal.purchasePricePKR)}</span>
                    </div>
                  )}
                </div>

                {animal.notes && (
                  <p className="text-[11px] text-slate-500 mt-2.5 line-clamp-2 italic">
                    "{animal.notes}"
                  </p>
                )}

                {/* If Sold or Deceased info */}
                {animal.saleDetails && (
                  <div className="mt-2 p-2 bg-purple-50 text-purple-900 text-xs rounded border border-purple-200">
                    Sold on {animal.saleDetails.saleDate} for {formatPKR(animal.saleDetails.salePricePKR)} to {animal.saleDetails.buyer}
                  </div>
                )}
                {animal.deathDetails && (
                  <div className="mt-2 p-2 bg-rose-50 text-rose-900 text-xs rounded border border-rose-200">
                    Deceased on {animal.deathDetails.deathDate}: {animal.deathDetails.causeOfDeath}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="p-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => onSelectAnimal(animal.id)}
                  className="flex items-center gap-1 font-semibold text-emerald-700 hover:text-emerald-800"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Full Profile & History</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onEditAnimal(animal)}
                    className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded transition-colors"
                    title="Edit Animal Details"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  {animal.status !== 'Sold' && animal.status !== 'Deceased' && (
                    <>
                      <button
                        onClick={() => {
                          setStatusActionAnimal(animal);
                          setStatusActionType('Sale');
                        }}
                        className="px-2 py-1 text-[11px] font-medium text-slate-700 bg-white border border-slate-200 rounded hover:bg-slate-100"
                        title="Record Animal Sale (without deleting records)"
                      >
                        Sell
                      </button>
                      <button
                        onClick={() => {
                          setStatusActionAnimal(animal);
                          setStatusActionType('Death');
                        }}
                        className="px-2 py-1 text-[11px] font-medium text-rose-700 bg-white border border-rose-200 rounded hover:bg-rose-50"
                        title="Record Death"
                      >
                        Death
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-800">
                <tr>
                  <th className="py-3 px-4">Tag / ID</th>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Species & Breed</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Lactation</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Purchase Price</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAnimals.map((animal) => (
                  <tr key={animal.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {animal.tag}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">{animal.name}</td>
                    <td className="py-3 px-4">
                      {animal.species} · {animal.breed}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded font-semibold text-[11px] ${getStatusBadgeClass(animal.status)}`}>
                        {animal.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">#{animal.lactationNumber}</td>
                    <td className="py-3 px-4">{animal.location}</td>
                    <td className="py-3 px-4">{formatPKR(animal.purchasePricePKR)}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onSelectAnimal(animal.id)}
                          className="px-2 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 rounded"
                        >
                          View
                        </button>
                        <button
                          onClick={() => onEditAnimal(animal)}
                          className="p-1 text-slate-500 hover:text-slate-800 rounded"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Status Action Modal (Sale or Death Record) */}
      {statusActionAnimal && statusActionType && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h2 className="text-base font-bold text-slate-900">
              Record {statusActionType === 'Sale' ? 'Animal Sale' : 'Animal Death'}: {statusActionAnimal.tag} ({statusActionAnimal.name})
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Historical milk, breeding, and health records will remain completely preserved for farm audit.
            </p>

            <div className="mt-4 space-y-3">
              {statusActionType === 'Sale' ? (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Sale Price (PKR) *
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 350000"
                      value={salePrice}
                      onChange={(e) => setSalePrice(e.target.value)}
                      className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Buyer Name / Cattle Market
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Haji Munir (Pattoki Mandi)"
                      value={saleBuyer}
                      onChange={(e) => setSaleBuyer(e.target.value)}
                      className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cause of Death *
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Acute bloat, dystocia complications, or sudden cardiac arrest"
                    value={deathCause}
                    onChange={(e) => setDeathCause(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => {
                  setStatusActionAnimal(null);
                  setStatusActionType(null);
                }}
                className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmStatusAction}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm"
              >
                Confirm Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
