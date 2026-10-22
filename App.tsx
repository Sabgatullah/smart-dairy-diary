import React, { useState } from 'react';
import { FarmProvider, useFarm } from './context/FarmContext';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { AnimalRegistry } from './components/AnimalRegistry';
import { MilkDiary } from './components/MilkDiary';
import { BreedingReproduction } from './components/BreedingReproduction';
import { HealthVeterinary } from './components/HealthVeterinary';
import { FinanceExpenses } from './components/FinanceExpenses';
import { AIDairyAdvisor } from './components/AIDairyAdvisor';
import { QuickMilkEntryModal } from './components/QuickMilkEntryModal';
import { AnimalDetailModal } from './components/AnimalDetailModal';
import { AddAnimalModal } from './components/AddAnimalModal';
import { DataReportsModal } from './components/DataReportsModal';
import { Animal } from './types';

const MainApp: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');

  // Modals state
  const [isQuickMilkModalOpen, setIsQuickMilkModalOpen] = useState(false);
  const [isAddAnimalModalOpen, setIsAddAnimalModalOpen] = useState(false);
  const [isReportsModalOpen, setIsReportsModalOpen] = useState(false);
  const [editingAnimal, setEditingAnimal] = useState<Animal | null>(null);

  const { selectedAnimalId, setSelectedAnimalId, settings, activeDate } = useFarm();

  const handleEditAnimal = (animal: Animal) => {
    setEditingAnimal(animal);
    setIsAddAnimalModalOpen(true);
  };

  const handleCloseAddAnimal = () => {
    setIsAddAnimalModalOpen(false);
    setEditingAnimal(null);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans">
      {/* Printable Farm Header (Only visible when printing) */}
      <div className="hidden print:block p-6 border-b-2 border-slate-900 mb-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold uppercase">{settings.farmName}</h1>
          <p className="text-sm text-slate-600">{settings.location} · Owner: {settings.ownerName}</p>
          <p className="text-xs text-slate-500 mt-1">Official Daily Dairy Farm Record Slip · Date: {activeDate}</p>
        </div>
      </div>

      {/* Navigation Header */}
      <div className="print:hidden">
        <Navbar
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          onOpenQuickMilkModal={() => setIsQuickMilkModalOpen(true)}
          onOpenAddAnimalModal={() => {
            setEditingAnimal(null);
            setIsAddAnimalModalOpen(true);
          }}
          onOpenReportsModal={() => setIsReportsModalOpen(true)}
        />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'dashboard' && (
          <Dashboard
            onNavigateTab={setCurrentTab}
            onOpenQuickMilkModal={() => setIsQuickMilkModalOpen(true)}
            onOpenAddAnimalModal={() => {
              setEditingAnimal(null);
              setIsAddAnimalModalOpen(true);
            }}
            onSelectAnimal={setSelectedAnimalId}
          />
        )}

        {currentTab === 'animals' && (
          <AnimalRegistry
            onOpenAddModal={() => {
              setEditingAnimal(null);
              setIsAddAnimalModalOpen(true);
            }}
            onSelectAnimal={setSelectedAnimalId}
            onEditAnimal={handleEditAnimal}
          />
        )}

        {currentTab === 'milk' && (
          <MilkDiary
            onOpenQuickBulkModal={() => setIsQuickMilkModalOpen(true)}
            onSelectAnimal={setSelectedAnimalId}
            onNavigateTab={setCurrentTab}
          />
        )}

        {currentTab === 'breeding' && (
          <BreedingReproduction onSelectAnimal={setSelectedAnimalId} />
        )}

        {currentTab === 'health' && (
          <HealthVeterinary
            onSelectAnimal={setSelectedAnimalId}
            onNavigateTab={setCurrentTab}
          />
        )}

        {currentTab === 'finance' && <FinanceExpenses />}

        {currentTab === 'ai-advisor' && <AIDairyAdvisor />}
      </main>

      {/* Footer */}
      <footer className="print:hidden border-t border-slate-200 bg-white py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Smart Dairy Diary</span>
            <span aria-hidden="true">·</span>
            <span>Pakistan Dairy Livestock Edition</span>
            <span aria-hidden="true">·</span>
            <span>PKR Currency</span>
          </div>
          <div>
            Built with AI Precision Analytics & Offline Local Persistence
          </div>
        </div>
      </footer>

      {/* Modals */}
      <QuickMilkEntryModal
        isOpen={isQuickMilkModalOpen}
        onClose={() => setIsQuickMilkModalOpen(false)}
      />

      <AddAnimalModal
        isOpen={isAddAnimalModalOpen}
        onClose={handleCloseAddAnimal}
        editingAnimal={editingAnimal}
      />

      <AnimalDetailModal
        animalId={selectedAnimalId}
        onClose={() => setSelectedAnimalId(null)}
        onEditAnimal={handleEditAnimal}
      />

      <DataReportsModal
        isOpen={isReportsModalOpen}
        onClose={() => setIsReportsModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <FarmProvider>
      <MainApp />
    </FarmProvider>
  );
}
