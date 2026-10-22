import React from 'react';
import { useFarm } from '../context/FarmContext';
import {
  Calendar,
  Plus,
  FileSpreadsheet,
  AlertTriangle,
  Sparkles,
  Milk,
  RotateCcw,
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenQuickMilkModal: () => void;
  onOpenAddAnimalModal: () => void;
  onOpenReportsModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  onOpenQuickMilkModal,
  onOpenAddAnimalModal,
  onOpenReportsModal,
}) => {
  const { settings, activeDate, setActiveDate, activeMilkDropAlerts, resetToSampleData } = useFarm();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'animals', label: 'Animals' },
    { id: 'milk', label: 'Daily Milk' },
    { id: 'breeding', label: 'Breeding & AI' },
    { id: 'health', label: 'Health & Vet' },
    { id: 'finance', label: 'Feed & Finance' },
    { id: 'ai-advisor', label: 'AI Advisor', badge: 'Gemini' },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Top Banner with Farm Identity & Quick Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Farm Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 flex items-center justify-center text-white shadow-sm ring-2 ring-emerald-600/20">
              <Milk className="w-5 h-5 text-emerald-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight">Smart Dairy Diary</span>
                <span className="text-xs text-emerald-800 font-medium px-2 py-0.5 bg-emerald-50 rounded border border-emerald-200">
                  اسمارٹ ڈیری
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="truncate max-w-[200px] sm:max-w-xs">{settings.farmName}</span>
                <span aria-hidden="true">·</span>
                <span>PKR (روپے)</span>
              </div>
            </div>
          </div>

          {/* Center Date Selector & Milk Drop Alert Warning */}
          <div className="hidden md:flex items-center gap-3">
            {activeMilkDropAlerts.length > 0 && (
              <button
                onClick={() => setCurrentTab('milk')}
                className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 rounded-md hover:bg-amber-100 transition-colors animate-pulse"
                title={`${activeMilkDropAlerts.length} animal(s) dropped >15% milk yield today`}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>{activeMilkDropAlerts.length} Milk Drop Alert{activeMilkDropAlerts.length > 1 ? 's' : ''}</span>
              </button>
            )}

            <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
              <Calendar className="w-4 h-4 text-slate-500" />
              <label htmlFor="active-date-input" className="text-xs font-medium text-slate-600">
                Active Date:
              </label>
              <input
                id="active-date-input"
                type="date"
                value={activeDate}
                onChange={(e) => setActiveDate(e.target.value)}
                className="text-xs font-semibold text-slate-800 bg-transparent border-none focus:outline-none cursor-pointer"
              />
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenQuickMilkModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Log Today's Milk</span>
              <span className="sm:hidden">Log Milk</span>
            </button>

            <button
              onClick={onOpenReportsModal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
              title="Reports & CSV Data Export"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">Reports & Export</span>
            </button>

            <button
              onClick={() => {
                if (window.confirm('Reset all farm records to the default realistic sample data?')) {
                  resetToSampleData();
                }
              }}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors"
              title="Reset to Sample Herd Data"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Bar Tabs */}
      <nav className="border-t border-slate-200 bg-slate-50/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 sm:space-x-4 overflow-x-auto py-2 no-scrollbar">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-white text-emerald-800 shadow-sm border border-slate-200 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  {item.label}
                  {item.badge && (
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </header>
  );
};
