import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Animal,
  DailyMilkRecord,
  BreedingRecord,
  HealthRecord,
  ExpenseRecord,
  IncomeRecord,
  WorkerRecord,
  FarmSettings,
  MilkDropAlert,
} from '../types';
import {
  initialAnimals,
  initialBreedingRecords,
  initialExpenses,
  initialFarmSettings,
  initialHealthRecords,
  initialWorkers,
  generateSeedMilkRecords,
} from '../data/seedData';
import { detectMilkDropAlerts } from '../utils/aiAnalytics';

interface FarmContextType {
  settings: FarmSettings;
  updateSettings: (newSettings: FarmSettings) => void;
  animals: Animal[];
  addAnimal: (animal: Omit<Animal, 'id' | 'createdAt' | 'updatedAt'>) => { success: boolean; message?: string };
  updateAnimal: (id: string, updates: Partial<Animal>) => void;
  recordAnimalSale: (id: string, saleDetails: Animal['saleDetails']) => void;
  recordAnimalDeath: (id: string, deathDetails: Animal['deathDetails']) => void;

  milkRecords: DailyMilkRecord[];
  addMilkRecord: (record: Omit<DailyMilkRecord, 'id'>) => { success: boolean; message?: string };
  updateMilkRecord: (id: string, updates: Partial<DailyMilkRecord>) => void;
  deleteMilkRecord: (id: string) => void;
  bulkAddDailyMilk: (records: Omit<DailyMilkRecord, 'id'>[]) => { added: number; updated: number };

  breedingRecords: BreedingRecord[];
  addBreedingRecord: (record: Omit<BreedingRecord, 'id'>) => void;
  updateBreedingRecord: (id: string, updates: Partial<BreedingRecord>) => void;

  healthRecords: HealthRecord[];
  addHealthRecord: (record: Omit<HealthRecord, 'id'>) => void;
  updateHealthRecord: (id: string, updates: Partial<HealthRecord>) => void;

  expenseRecords: ExpenseRecord[];
  addExpenseRecord: (record: Omit<ExpenseRecord, 'id'>) => void;
  deleteExpenseRecord: (id: string) => void;

  workers: WorkerRecord[];
  addWorker: (worker: Omit<WorkerRecord, 'id'>) => void;
  updateWorker: (id: string, updates: Partial<WorkerRecord>) => void;

  activeDate: string; // The currently selected view date (default today 2026-10-21)
  setActiveDate: (date: string) => void;

  selectedAnimalId: string | null;
  setSelectedAnimalId: (id: string | null) => void;

  // AI & Analytical Computed States
  activeMilkDropAlerts: MilkDropAlert[];
  resetToSampleData: () => void;
  exportDatabaseJSON: () => string;
  importDatabaseJSON: (jsonStr: string) => boolean;
}

const FarmContext = createContext<FarmContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'smart_dairy_farm_v1_';

export const FarmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<FarmSettings>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}settings`);
    return saved ? JSON.parse(saved) : initialFarmSettings;
  });

  const [animals, setAnimals] = useState<Animal[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}animals`);
    return saved ? JSON.parse(saved) : initialAnimals;
  });

  const [milkRecords, setMilkRecords] = useState<DailyMilkRecord[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}milkRecords`);
    return saved ? JSON.parse(saved) : generateSeedMilkRecords();
  });

  const [breedingRecords, setBreedingRecords] = useState<BreedingRecord[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}breedingRecords`);
    return saved ? JSON.parse(saved) : initialBreedingRecords;
  });

  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}healthRecords`);
    return saved ? JSON.parse(saved) : initialHealthRecords;
  });

  const [expenseRecords, setExpenseRecords] = useState<ExpenseRecord[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}expenseRecords`);
    return saved ? JSON.parse(saved) : initialExpenses;
  });

  const [workers, setWorkers] = useState<WorkerRecord[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}workers`);
    return saved ? JSON.parse(saved) : initialWorkers;
  });

  // Default active view date is today's local date or seed current date (2026-10-21)
  const [activeDate, setActiveDate] = useState<string>('2026-10-21');
  const [selectedAnimalId, setSelectedAnimalId] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}settings`, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}animals`, JSON.stringify(animals));
  }, [animals]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}milkRecords`, JSON.stringify(milkRecords));
  }, [milkRecords]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}breedingRecords`, JSON.stringify(breedingRecords));
  }, [breedingRecords]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}healthRecords`, JSON.stringify(healthRecords));
  }, [healthRecords]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}expenseRecords`, JSON.stringify(expenseRecords));
  }, [expenseRecords]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}workers`, JSON.stringify(workers));
  }, [workers]);

  // AI Milk Drop Alerts for activeDate
  const activeMilkDropAlerts = React.useMemo(() => {
    return detectMilkDropAlerts(animals, milkRecords, activeDate, settings.alertThresholdMilkDropPct);
  }, [animals, milkRecords, activeDate, settings.alertThresholdMilkDropPct]);

  // Animal Operations
  const addAnimal = (animalData: Omit<Animal, 'id' | 'createdAt' | 'updatedAt'>) => {
    // Prevent duplicate Tag
    const cleanTag = animalData.tag.trim().toUpperCase();
    const existing = animals.find((a) => a.tag.toUpperCase() === cleanTag);
    if (existing) {
      return { success: false, message: `Animal with Tag "${cleanTag}" already exists!` };
    }

    const newAnimal: Animal = {
      ...animalData,
      id: `ani-${Date.now()}`,
      tag: cleanTag,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setAnimals((prev) => [newAnimal, ...prev]);
    return { success: true };
  };

  const updateAnimal = (id: string, updates: Partial<Animal>) => {
    // If tag is updated, ensure uniqueness
    if (updates.tag) {
      const cleanTag = updates.tag.trim().toUpperCase();
      const existing = animals.find((a) => a.id !== id && a.tag.toUpperCase() === cleanTag);
      if (existing) {
        alert(`Cannot rename tag: "${cleanTag}" is already used by another animal.`);
        return;
      }
      updates.tag = cleanTag;
    }

    setAnimals((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a))
    );
  };

  const recordAnimalSale = (id: string, saleDetails: Animal['saleDetails']) => {
    updateAnimal(id, {
      status: 'Sold',
      saleDetails,
    });
  };

  const recordAnimalDeath = (id: string, deathDetails: Animal['deathDetails']) => {
    updateAnimal(id, {
      status: 'Deceased',
      deathDetails,
    });
  };

  // Milk Operations
  const addMilkRecord = (record: Omit<DailyMilkRecord, 'id'>) => {
    // Check if record already exists for this animal & date
    const existing = milkRecords.find(
      (r) => r.animalId === record.animalId && r.date === record.date
    );

    if (existing) {
      return {
        success: false,
        message: `A milk entry for ${record.animalTag} on ${record.date} already exists. You can edit it instead.`,
      };
    }

    const newRecord: DailyMilkRecord = {
      ...record,
      id: `mlk-${Date.now()}`,
    };

    setMilkRecords((prev) => [newRecord, ...prev]);
    return { success: true };
  };

  const updateMilkRecord = (id: string, updates: Partial<DailyMilkRecord>) => {
    setMilkRecords((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const morn = updates.morningMilkLiters !== undefined ? updates.morningMilkLiters : r.morningMilkLiters;
        const eve = updates.eveningMilkLiters !== undefined ? updates.eveningMilkLiters : r.eveningMilkLiters;
        const aft = updates.afternoonMilkLiters !== undefined ? updates.afternoonMilkLiters : (r.afternoonMilkLiters || 0);
        const total = Math.round((morn + eve + aft) * 10) / 10;
        const sold = updates.soldQuantityLiters !== undefined ? updates.soldQuantityLiters : total;
        const rate = updates.saleRatePerLiterPKR !== undefined ? updates.saleRatePerLiterPKR : r.saleRatePerLiterPKR;
        const revenue = Math.round(sold * rate);

        return {
          ...r,
          ...updates,
          totalDailyMilkLiters: total,
          soldQuantityLiters: sold,
          totalSaleRevenuePKR: revenue,
        };
      })
    );
  };

  const deleteMilkRecord = (id: string) => {
    setMilkRecords((prev) => prev.filter((r) => r.id !== id));
  };

  const bulkAddDailyMilk = (records: Omit<DailyMilkRecord, 'id'>[]) => {
    let added = 0;
    let updated = 0;

    setMilkRecords((prev) => {
      const next = [...prev];
      for (const rec of records) {
        const idx = next.findIndex((r) => r.animalId === rec.animalId && r.date === rec.date);
        if (idx >= 0) {
          next[idx] = { ...next[idx], ...rec };
          updated++;
        } else {
          next.unshift({ ...rec, id: `mlk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}` });
          added++;
        }
      }
      return next;
    });

    return { added, updated };
  };

  // Breeding Operations
  const addBreedingRecord = (record: Omit<BreedingRecord, 'id'>) => {
    const newRecord: BreedingRecord = {
      ...record,
      id: `brd-${Date.now()}`,
    };
    setBreedingRecords((prev) => [newRecord, ...prev]);

    // If pregnancy status is 'Confirmed Pregnant', update animal status if appropriate
    if (record.pregnancyStatus === 'Confirmed Pregnant') {
      const animal = animals.find((a) => a.id === record.animalId);
      if (animal && animal.status !== 'Milking') {
        updateAnimal(record.animalId, { status: 'Pregnant' });
      }
    }
  };

  const updateBreedingRecord = (id: string, updates: Partial<BreedingRecord>) => {
    setBreedingRecords((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const updated = { ...r, ...updates };
        if (updates.pregnancyStatus === 'Confirmed Pregnant') {
          const animal = animals.find((a) => a.id === r.animalId);
          if (animal && animal.status === 'Dry') {
            updateAnimal(r.animalId, { status: 'Pregnant' });
          }
        }
        return updated;
      })
    );
  };

  // Health Operations
  const addHealthRecord = (record: Omit<HealthRecord, 'id'>) => {
    const newRecord: HealthRecord = {
      ...record,
      id: `hlth-${Date.now()}`,
    };
    setHealthRecords((prev) => [newRecord, ...prev]);

    // If severe illness or mastitis, flag animal status as Sick
    if (record.recordType === 'Diagnosis') {
      updateAnimal(record.animalId, { status: 'Sick' });
    }
  };

  const updateHealthRecord = (id: string, updates: Partial<HealthRecord>) => {
    setHealthRecords((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
  };

  // Expense Operations
  const addExpenseRecord = (record: Omit<ExpenseRecord, 'id'>) => {
    const newRecord: ExpenseRecord = {
      ...record,
      id: `exp-${Date.now()}`,
    };
    setExpenseRecords((prev) => [newRecord, ...prev]);
  };

  const deleteExpenseRecord = (id: string) => {
    setExpenseRecords((prev) => prev.filter((r) => r.id !== id));
  };

  // Worker Operations
  const addWorker = (worker: Omit<WorkerRecord, 'id'>) => {
    const newWorker: WorkerRecord = {
      ...worker,
      id: `wrk-${Date.now()}`,
    };
    setWorkers((prev) => [...prev, newWorker]);
  };

  const updateWorker = (id: string, updates: Partial<WorkerRecord>) => {
    setWorkers((prev) => prev.map((w) => (w.id === id ? { ...w, ...updates } : w)));
  };

  const updateSettings = (newSettings: FarmSettings) => {
    setSettings(newSettings);
  };

  const resetToSampleData = () => {
    setSettings(initialFarmSettings);
    setAnimals(initialAnimals);
    setMilkRecords(generateSeedMilkRecords());
    setBreedingRecords(initialBreedingRecords);
    setHealthRecords(initialHealthRecords);
    setExpenseRecords(initialExpenses);
    setWorkers(initialWorkers);
  };

  const exportDatabaseJSON = () => {
    return JSON.stringify(
      {
        settings,
        animals,
        milkRecords,
        breedingRecords,
        healthRecords,
        expenseRecords,
        workers,
        exportTimestamp: new Date().toISOString(),
      },
      null,
      2
    );
  };

  const importDatabaseJSON = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.animals && Array.isArray(data.animals)) {
        if (data.settings) setSettings(data.settings);
        if (data.animals) setAnimals(data.animals);
        if (data.milkRecords) setMilkRecords(data.milkRecords);
        if (data.breedingRecords) setBreedingRecords(data.breedingRecords);
        if (data.healthRecords) setHealthRecords(data.healthRecords);
        if (data.expenseRecords) setExpenseRecords(data.expenseRecords);
        if (data.workers) setWorkers(data.workers);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  return (
    <FarmContext.Provider
      value={{
        settings,
        updateSettings,
        animals,
        addAnimal,
        updateAnimal,
        recordAnimalSale,
        recordAnimalDeath,
        milkRecords,
        addMilkRecord,
        updateMilkRecord,
        deleteMilkRecord,
        bulkAddDailyMilk,
        breedingRecords,
        addBreedingRecord,
        updateBreedingRecord,
        healthRecords,
        addHealthRecord,
        updateHealthRecord,
        expenseRecords,
        addExpenseRecord,
        deleteExpenseRecord,
        workers,
        addWorker,
        updateWorker,
        activeDate,
        setActiveDate,
        selectedAnimalId,
        setSelectedAnimalId,
        activeMilkDropAlerts,
        resetToSampleData,
        exportDatabaseJSON,
        importDatabaseJSON,
      }}
    >
      {children}
    </FarmContext.Provider>
  );
};

export const useFarm = () => {
  const context = useContext(FarmContext);
  if (!context) {
    throw new Error('useFarm must be used within a FarmProvider');
  }
  return context;
};
