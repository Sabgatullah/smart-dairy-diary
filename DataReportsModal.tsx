import React, { useState } from 'react';
import { useFarm } from '../context/FarmContext';
import {
  exportAnimalsToCSV,
  exportMilkRecordsToCSV,
  exportExpensesToCSV,
} from '../utils/exportUtils';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Upload,
  Database,
  Check,
  X,
  RotateCcw,
} from 'lucide-react';

interface DataReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DataReportsModal: React.FC<DataReportsModalProps> = ({ isOpen, onClose }) => {
  const {
    animals,
    milkRecords,
    expenseRecords,
    settings,
    activeDate,
    exportDatabaseJSON,
    importDatabaseJSON,
    resetToSampleData,
  } = useFarm();

  const [importStatus, setImportStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleJSONExport = () => {
    const jsonStr = exportDatabaseJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `smart_dairy_farm_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleJSONImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importDatabaseJSON(content);
      if (success) {
        setImportStatus('Backup restored successfully!');
        setTimeout(() => setImportStatus(null), 3000);
      } else {
        setImportStatus('Invalid backup JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const handlePrintLedger = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Farm Reports, CSV Export & Data Backup
              </h2>
              <p className="text-xs text-slate-500">
                Export farm records to Excel-compatible CSV, generate printable reports, or backup database.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-6 text-xs">
          {/* Section 1: CSV Exports */}
          <div>
            <h3 className="font-bold text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Download className="w-4 h-4 text-emerald-700" />
              <span>Export CSV Spreadsheets</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => exportAnimalsToCSV(animals)}
                className="p-3 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-xl text-left transition-colors"
              >
                <div className="font-bold text-slate-900">Animals Registry</div>
                <div className="text-[11px] text-slate-500 mt-1">
                  {animals.length} heads (breed, tag, DOB, status)
                </div>
                <div className="mt-2 text-emerald-700 font-semibold text-[11px] flex items-center gap-1">
                  <span>Download CSV</span> &rarr;
                </div>
              </button>

              <button
                onClick={() => exportMilkRecordsToCSV(milkRecords)}
                className="p-3 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-xl text-left transition-colors"
              >
                <div className="font-bold text-slate-900">Daily Milk Ledger</div>
                <div className="text-[11px] text-slate-500 mt-1">
                  {milkRecords.length} entries (morning, evening, sales)
                </div>
                <div className="mt-2 text-emerald-700 font-semibold text-[11px] flex items-center gap-1">
                  <span>Download CSV</span> &rarr;
                </div>
              </button>

              <button
                onClick={() => exportExpensesToCSV(expenseRecords)}
                className="p-3 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-xl text-left transition-colors"
              >
                <div className="font-bold text-slate-900">Feed & Expenses</div>
                <div className="text-[11px] text-slate-500 mt-1">
                  {expenseRecords.length} records (Wanda, Toori, Labor)
                </div>
                <div className="mt-2 text-emerald-700 font-semibold text-[11px] flex items-center gap-1">
                  <span>Download CSV</span> &rarr;
                </div>
              </button>
            </div>
          </div>

          {/* Section 2: Print Farm Summary Slip */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Printer className="w-4 h-4 text-slate-700" />
                <span>Print Official Farm Slip / Daily Ledger</span>
              </div>
              <p className="text-slate-500 mt-0.5">
                Formatted for thermal receipt or A4 paper with {settings.farmName} header.
              </p>
            </div>
            <button
              onClick={handlePrintLedger}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg shadow-sm"
            >
              Print / Save PDF
            </button>
          </div>

          {/* Section 3: Database JSON Backup & Restore */}
          <div>
            <h3 className="font-bold text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Database className="w-4 h-4 text-blue-700" />
              <span>Full Local Database Backup & Restore</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-200 flex flex-col justify-between">
                <div>
                  <div className="font-bold text-blue-900">Download Full JSON Backup</div>
                  <p className="text-blue-800 text-[11px] mt-1">
                    Back up all animals, milk records, breeding, and financial logs to your device.
                  </p>
                </div>
                <button
                  onClick={handleJSONExport}
                  className="mt-3 w-full py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg shadow-sm"
                >
                  Save Backup File (.json)
                </button>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="font-bold text-slate-900">Restore from JSON Backup</div>
                  <p className="text-slate-500 text-[11px] mt-1">
                    Upload a previously saved Smart Dairy Diary JSON backup file.
                  </p>
                </div>
                <label className="mt-3 w-full py-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-semibold rounded-lg text-center cursor-pointer">
                  <span>Choose Backup File</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleJSONImport}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {importStatus && (
              <div className="mt-2 p-2 bg-emerald-50 text-emerald-800 rounded font-semibold text-center border border-emerald-200">
                {importStatus}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
