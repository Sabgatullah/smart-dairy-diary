import React, { useState, useMemo } from 'react';
import { useFarm } from '../context/FarmContext';
import { ExpenseRecord, ExpenseCategory, WorkerRecord } from '../types';
import { calculateFeedEconomics } from '../utils/aiAnalytics';
import {
  DollarSign,
  TrendingDown,
  TrendingUp,
  Plus,
  Calendar,
  Layers,
  Users,
  PieChart,
  Trash2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export const FinanceExpenses: React.FC = () => {
  const {
    expenseRecords,
    milkRecords,
    addExpenseRecord,
    deleteExpenseRecord,
    workers,
    addWorker,
    activeDate,
  } = useFarm();

  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [showAddWorkerModal, setShowAddWorkerModal] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const [expenseForm, setExpenseForm] = useState({
    date: activeDate,
    category: 'Wanda & Concentrates' as ExpenseCategory,
    description: 'Supreme Dairy Wanda 20% CP (Punjab Feed Mills)',
    quantity: 10,
    unit: 'bag (50kg)' as ExpenseRecord['unit'],
    ratePerUnitPKR: 4100,
    paidTo: 'Al-Rehman Feed Store',
    paymentMethod: 'Bank Transfer / JazzCash / Easypaisa' as ExpenseRecord['paymentMethod'],
    notes: '',
  });

  const [workerForm, setWorkerForm] = useState({
    name: '',
    role: 'Milker (Gawala)' as WorkerRecord['role'],
    phone: '',
    monthlySalaryPKR: 25000,
    joiningDate: activeDate,
  });

  // Calculate Feed Economics & Financial KPIs
  const economics = useMemo(() => {
    return calculateFeedEconomics(milkRecords, expenseRecords);
  }, [milkRecords, expenseRecords]);

  // Category breakdown for expenses
  const categoryBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    for (const exp of expenseRecords) {
      const current = map.get(exp.category) || 0;
      map.set(exp.category, current + exp.totalAmountPKR);
    }
    return Array.from(map.entries())
      .map(([cat, total]) => ({
        category: cat,
        total,
        percentage: economics.totalExpenses > 0 ? Math.round((total / economics.totalExpenses) * 100) : 0,
      }))
      .sort((a, b) => b.total - a.total);
  }, [expenseRecords, economics.totalExpenses]);

  // Filtered Expenses
  const filteredExpenses = useMemo(() => {
    return expenseRecords
      .filter((e) => filterCategory === 'all' || e.category === filterCategory)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [expenseRecords, filterCategory]);

  const handleAddExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = Number(expenseForm.quantity) || 1;
    const rate = Number(expenseForm.ratePerUnitPKR) || 0;
    const total = qty * rate;

    addExpenseRecord({
      date: expenseForm.date,
      category: expenseForm.category,
      description: expenseForm.description,
      quantity: qty,
      unit: expenseForm.unit,
      ratePerUnitPKR: rate,
      totalAmountPKR: total,
      paidTo: expenseForm.paidTo,
      paymentMethod: expenseForm.paymentMethod,
      notes: expenseForm.notes,
    });

    setShowAddExpenseModal(false);
  };

  const handleAddWorkerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!workerForm.name) return;

    addWorker({
      name: workerForm.name,
      role: workerForm.role,
      phone: workerForm.phone,
      monthlySalaryPKR: Number(workerForm.monthlySalaryPKR) || 0,
      joiningDate: workerForm.joiningDate,
      status: 'Active',
    });

    setShowAddWorkerModal(false);
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
            <span>Feed, Labor & Farm Financials</span>
            <span className="text-xs font-semibold px-2 py-0.5 bg-blue-50 text-blue-800 rounded border border-blue-200">
              آمدنی اور اخراجات
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tracking dairy rations (Wanda, Toori, Barseem), worker wages, power, and feed cost per liter KPI.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddWorkerModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Add Farm Worker</span>
          </button>

          <button
            onClick={() => setShowAddExpenseModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Record New Expense</span>
          </button>
        </div>
      </div>

      {/* Financial Health KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500">Cumulative Milk Revenue</div>
          <div className="text-2xl font-bold text-emerald-800 mt-1">{formatPKR(economics.totalMilkRevenue)}</div>
          <div className="text-[11px] text-slate-500 mt-1">From {economics.totalMilkLiters} L total produced</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500">Total Farm Expenses</div>
          <div className="text-2xl font-bold text-rose-700 mt-1">{formatPKR(economics.totalExpenses)}</div>
          <div className="text-[11px] text-slate-500 mt-1">Feed, Wanda, power, labor</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500">Net Farm Profit / Loss</div>
          <div className={`text-2xl font-bold mt-1 ${economics.netFarmProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
            {formatPKR(economics.netFarmProfit)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {economics.netFarmProfit >= 0 ? 'Surplus balance' : 'Operating loss'}
          </div>
        </div>

        {/* The Benchmark KPI: Feed Cost per Liter */}
        <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-emerald-800 font-semibold">
            <span>Feed Cost / Liter</span>
            <span className="text-[10px] bg-emerald-200 text-emerald-900 px-1.5 py-0.2 rounded">
              {economics.rating}
            </span>
          </div>
          <div className="text-2xl font-bold text-emerald-900 mt-1">
            Rs. {economics.feedCostPerLiter} <span className="text-xs font-normal text-emerald-700">/ Liter</span>
          </div>
          <div className="text-[11px] text-emerald-800 mt-1">
            Feed takes {economics.feedCostRatioPct}% of milk income (Target: &lt; 65%)
          </div>
        </div>
      </div>

      {/* Feed & Cost Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Breakdown Progress Bars */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <PieChart className="w-4 h-4 text-emerald-700" />
              <span>Expense Category Distribution</span>
            </h2>
            <span className="text-xs text-slate-500">Total: {formatPKR(economics.totalExpenses)}</span>
          </div>

          <div className="space-y-3">
            {categoryBreakdown.map((item) => (
              <div key={item.category} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-800 truncate max-w-[280px]">{item.category}</span>
                  <span className="text-slate-600">
                    {formatPKR(item.total)} ({item.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    style={{ width: `${Math.min(100, item.percentage)}%` }}
                    className="bg-emerald-700 h-full rounded-full transition-all duration-300"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Farm Workers & Labor Roster */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-700" />
                <span>Farm Staff ({workers.length})</span>
              </h2>
              <button
                onClick={() => setShowAddWorkerModal(true)}
                className="text-xs text-blue-700 font-semibold hover:underline"
              >
                + Add Staff
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {workers.map((w) => (
                <div key={w.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-900">{w.name}</div>
                    <div className="text-[11px] text-slate-500">
                      {w.role} · {w.phone || 'No phone'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-slate-900">{formatPKR(w.monthlySalaryPKR)}</div>
                    <div className="text-[10px] text-slate-400">Monthly salary</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 flex justify-between">
            <span>Monthly Payroll:</span>
            <span className="font-bold text-slate-900">
              {formatPKR(workers.reduce((acc, w) => acc + w.monthlySalaryPKR, 0))}
            </span>
          </div>
        </div>
      </div>

      {/* Expense Ledger Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xs font-bold text-slate-900">
              Farm Expenses Ledger ({filteredExpenses.length} entries)
            </h2>
            <p className="text-[11px] text-slate-500">Complete itemized receipts and payments</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Filter Category:</span>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="text-xs p-1.5 border border-slate-300 rounded-lg bg-white"
            >
              <option value="all">All Categories</option>
              <option value="Wanda & Concentrates">Wanda & Concentrates</option>
              <option value="Green Fodder (Barseem/Maize/Jowar)">Green Fodder</option>
              <option value="Dry Fodder (Toori/Wheat Straw)">Dry Fodder (Toori)</option>
              <option value="Veterinary & Medicines">Veterinary & Medicines</option>
              <option value="Labor & Salaries">Labor & Salaries</option>
              <option value="Electricity & Diesel Fuel">Electricity & Fuel</option>
              <option value="Maintenance & Equipment">Maintenance</option>
              <option value="Other Farm Expenses">Other</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-800">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Qty & Unit</th>
                <th className="py-3 px-4">Rate (PKR)</th>
                <th className="py-3 px-4">Total Amount (PKR)</th>
                <th className="py-3 px-4">Paid To</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4 text-right">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-mono font-medium">{exp.date}</td>
                  <td className="py-3 px-4 font-medium text-slate-900">{exp.category}</td>
                  <td className="py-3 px-4 max-w-[200px] truncate" title={exp.description}>
                    {exp.description}
                  </td>
                  <td className="py-3 px-4">
                    {exp.quantity ? `${exp.quantity} ${exp.unit || ''}` : '-'}
                  </td>
                  <td className="py-3 px-4">{exp.ratePerUnitPKR ? formatPKR(exp.ratePerUnitPKR) : '-'}</td>
                  <td className="py-3 px-4 font-bold text-rose-700">{formatPKR(exp.totalAmountPKR)}</td>
                  <td className="py-3 px-4">{exp.paidTo}</td>
                  <td className="py-3 px-4 text-[11px] text-slate-500">{exp.paymentMethod}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete expense "${exp.description}"?`)) {
                          deleteExpenseRecord(exp.id);
                        }
                      }}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <form
            onSubmit={handleAddExpenseSubmit}
            className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h2 className="text-base font-bold text-slate-900">Record Farm Expense</h2>
              <span className="text-xs text-rose-700 font-semibold">Expense Slip</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Date *</label>
                <input
                  type="date"
                  required
                  value={expenseForm.date}
                  onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category *</label>
                <select
                  value={expenseForm.category}
                  onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value as any })}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="Wanda & Concentrates">Wanda & Concentrates</option>
                  <option value="Green Fodder (Barseem/Maize/Jowar)">Green Fodder (Barseem/Maize/Jowar)</option>
                  <option value="Dry Fodder (Toori/Wheat Straw)">Dry Fodder (Toori / Wheat Straw)</option>
                  <option value="Veterinary & Medicines">Veterinary & Medicines</option>
                  <option value="Labor & Salaries">Labor & Salaries</option>
                  <option value="Electricity & Diesel Fuel">Electricity & Diesel Fuel</option>
                  <option value="Maintenance & Equipment">Maintenance & Equipment</option>
                  <option value="Other Farm Expenses">Other Farm Expenses</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Item Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Supreme Wanda 20% CP 50kg bags"
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Quantity</label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={expenseForm.quantity}
                  onChange={(e) => setExpenseForm({ ...expenseForm, quantity: parseFloat(e.target.value) || 0 })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Unit</label>
                <select
                  value={expenseForm.unit}
                  onChange={(e) => setExpenseForm({ ...expenseForm, unit: e.target.value as any })}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="bag (50kg)">bag (50kg)</option>
                  <option value="maund (40kg)">maund (40kg)</option>
                  <option value="kg">kg</option>
                  <option value="liter">liter</option>
                  <option value="month">month</option>
                  <option value="hours">hours</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Rate per Unit (PKR) *</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={expenseForm.ratePerUnitPKR}
                  onChange={(e) => setExpenseForm({ ...expenseForm, ratePerUnitPKR: parseFloat(e.target.value) || 0 })}
                  className="w-full p-2 border border-slate-300 rounded-lg font-semibold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Paid To (Vendor / Person)</label>
                <input
                  type="text"
                  placeholder="e.g. Al-Rehman Feed Store"
                  value={expenseForm.paidTo}
                  onChange={(e) => setExpenseForm({ ...expenseForm, paidTo: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Payment Method</label>
                <select
                  value={expenseForm.paymentMethod}
                  onChange={(e) => setExpenseForm({ ...expenseForm, paymentMethod: e.target.value as any })}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="Cash">Cash (نقد)</option>
                  <option value="Bank Transfer / JazzCash / Easypaisa">Bank Transfer / JazzCash / Easypaisa</option>
                  <option value="Cheque">Bank Cheque</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
              <div className="text-xs font-bold text-rose-700">
                Total: {formatPKR((expenseForm.quantity || 1) * (expenseForm.ratePerUnitPKR || 0))}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddExpenseModal(false)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm"
                >
                  Save Expense
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Add Worker Modal */}
      {showAddWorkerModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <form
            onSubmit={handleAddWorkerSubmit}
            className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h2 className="text-base font-bold text-slate-900">Add Farm Worker / Staff</h2>
              <span className="text-xs text-blue-700 font-semibold">Staff Payroll</span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Worker Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Muhammad Ramzan (گوالا)"
                  value={workerForm.name}
                  onChange={(e) => setWorkerForm({ ...workerForm, name: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Role *</label>
                <select
                  value={workerForm.role}
                  onChange={(e) => setWorkerForm({ ...workerForm, role: e.target.value as any })}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="Milker (Gawala)">Milker (Gawala / دودھ دوہنے والا)</option>
                  <option value="Feeder">Feeder (چارہ ڈالنے والا)</option>
                  <option value="Herdsman">Herdsman (چرواہا / نگہبان)</option>
                  <option value="Farm Manager">Farm Manager (فارم منیجر)</option>
                  <option value="Night Guard">Night Guard (چوکیدار)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Contact Phone</label>
                <input
                  type="text"
                  placeholder="e.g. 0301-2345678"
                  value={workerForm.phone}
                  onChange={(e) => setWorkerForm({ ...workerForm, phone: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Monthly Salary (PKR) *</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={workerForm.monthlySalaryPKR}
                  onChange={(e) => setWorkerForm({ ...workerForm, monthlySalaryPKR: parseFloat(e.target.value) || 0 })}
                  className="w-full p-2 border border-slate-300 rounded-lg font-semibold"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowAddWorkerModal(false)}
                className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-sm"
              >
                Add Staff Member
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
