import { Animal, DailyMilkRecord, ExpenseRecord, FarmSettings } from '../types';

export function downloadCSV(filename: string, csvContent: string) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportAnimalsToCSV(animals: Animal[]) {
  const headers = [
    'Tag ID',
    'Name',
    'Species',
    'Breed',
    'Gender',
    'Status',
    'Lactation',
    'DOB',
    'Purchase Date',
    'Purchase Price (PKR)',
    'Seller / Source',
    'Location',
    'Last Calving Date',
    'Notes',
  ];

  const rows = animals.map((a) => [
    `"${a.tag}"`,
    `"${a.name}"`,
    `"${a.species}"`,
    `"${a.breed}"`,
    `"${a.gender}"`,
    `"${a.status}"`,
    a.lactationNumber,
    `"${a.dob || ''}"`,
    `"${a.purchaseDate || ''}"`,
    a.purchasePricePKR || 0,
    `"${a.sellerSource || ''}"`,
    `"${a.location || ''}"`,
    `"${a.lastCalvingDate || ''}"`,
    `"${(a.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  downloadCSV(`smart_dairy_animals_${new Date().toISOString().split('T')[0]}.csv`, csv);
}

export function exportMilkRecordsToCSV(records: DailyMilkRecord[]) {
  const headers = [
    'Date',
    'Animal Tag',
    'Morning Milk (L)',
    'Evening Milk (L)',
    'Afternoon Milk (L)',
    'Total Milk (L)',
    'Sold Quantity (L)',
    'Sale Rate (PKR/L)',
    'Revenue (PKR)',
    'Fat %',
    'Anomaly Flag',
    'Notes',
  ];

  const rows = records.map((r) => [
    `"${r.date}"`,
    `"${r.animalTag}"`,
    r.morningMilkLiters,
    r.eveningMilkLiters,
    r.afternoonMilkLiters || 0,
    r.totalDailyMilkLiters,
    r.soldQuantityLiters,
    r.saleRatePerLiterPKR,
    r.totalSaleRevenuePKR,
    r.fatPercentage || '',
    r.hasAnomaly ? 'YES' : 'NO',
    `"${(r.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  downloadCSV(`smart_dairy_milk_production_${new Date().toISOString().split('T')[0]}.csv`, csv);
}

export function exportExpensesToCSV(expenses: ExpenseRecord[]) {
  const headers = [
    'Date',
    'Category',
    'Description',
    'Quantity',
    'Unit',
    'Rate (PKR)',
    'Total Amount (PKR)',
    'Paid To',
    'Payment Method',
    'Notes',
  ];

  const rows = expenses.map((e) => [
    `"${e.date}"`,
    `"${e.category}"`,
    `"${e.description.replace(/"/g, '""')}"`,
    e.quantity || '',
    `"${e.unit || ''}"`,
    e.ratePerUnitPKR || '',
    e.totalAmountPKR,
    `"${e.paidTo || ''}"`,
    `"${e.paymentMethod || ''}"`,
    `"${(e.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  downloadCSV(`smart_dairy_expenses_${new Date().toISOString().split('T')[0]}.csv`, csv);
}
