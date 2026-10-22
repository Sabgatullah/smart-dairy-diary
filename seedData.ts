import {
  Animal,
  DailyMilkRecord,
  BreedingRecord,
  HealthRecord,
  ExpenseRecord,
  IncomeRecord,
  WorkerRecord,
  FarmSettings,
} from '../types';

export const initialFarmSettings: FarmSettings = {
  farmName: 'Al-Madina Dairy Farm (المدینہ ڈیری فارم)',
  ownerName: 'Chaudhry Sabgatullah',
  location: 'Chunian / Kasur Road, Punjab, Pakistan',
  defaultCowMilkRatePKR: 190,
  defaultBuffaloMilkRatePKR: 240,
  alertThresholdMilkDropPct: 15,
  currency: 'PKR',
};

export const initialAnimals: Animal[] = [
  {
    id: 'ani-001',
    tag: 'PK-BF-01',
    name: 'Neeli (نیلی)',
    species: 'Buffalo',
    breed: 'Nili-Ravi (Pure)',
    gender: 'Female',
    dob: '2020-03-12',
    purchaseDate: '2022-09-15',
    purchasePricePKR: 385000,
    sellerSource: 'Vehari Livestock Mandi',
    status: 'Milking',
    lactationNumber: 3,
    lastCalvingDate: '2026-08-10',
    location: 'Shed A - High Yield Milkers',
    sireTag: 'NR-BULL-99',
    damTag: 'NR-DAM-42',
    notes: 'Outstanding milker. Averages 14-16 liters daily with 7.2% fat. Very calm temperament.',
    createdAt: '2022-09-15T00:00:00Z',
    updatedAt: '2026-10-20T00:00:00Z',
  },
  {
    id: 'ani-002',
    tag: 'PK-BF-02',
    name: 'Suraiya (ثریا)',
    species: 'Buffalo',
    breed: 'Nili-Ravi',
    gender: 'Female',
    dob: '2021-01-20',
    purchaseDate: '2023-04-10',
    purchasePricePKR: 360000,
    sellerSource: 'Okara Buffalo Breeders Association',
    status: 'Milking',
    lactationNumber: 2,
    lastCalvingDate: '2026-09-02',
    location: 'Shed A - High Yield Milkers',
    notes: 'Produces 13-14 liters. High butterfat yield.',
    createdAt: '2023-04-10T00:00:00Z',
    updatedAt: '2026-10-20T00:00:00Z',
  },
  {
    id: 'ani-003',
    tag: 'PK-CW-01',
    name: 'Rani (رانی)',
    species: 'Cow',
    breed: 'Sahiwal (Indigenous)',
    gender: 'Female',
    dob: '2021-05-14',
    purchaseDate: '2023-02-18',
    purchasePricePKR: 245000,
    sellerSource: 'Sahiwal Livestock Research Farm',
    status: 'Milking',
    lactationNumber: 2,
    lastCalvingDate: '2026-08-25',
    location: 'Shed B - Indigenous Milkers',
    notes: 'Pure Sahiwal with pronounced hump and sweet A2 milk. Averages 15 liters daily.',
    createdAt: '2023-02-18T00:00:00Z',
    updatedAt: '2026-10-20T00:00:00Z',
  },
  {
    id: 'ani-004',
    tag: 'PK-CW-02',
    name: 'Lakshmi (لکشمی)',
    species: 'Cow',
    breed: 'Crossbred (HF x Sahiwal)',
    gender: 'Female',
    dob: '2020-08-11',
    purchaseDate: '2022-11-05',
    purchasePricePKR: 290000,
    sellerSource: 'Pattoki Dairy Farm',
    status: 'Milking',
    lactationNumber: 3,
    lastCalvingDate: '2026-07-18',
    location: 'Shed A - High Yield Milkers',
    notes: 'Top producer on farm. Gives 20-22 liters daily on high Wanda diet.',
    createdAt: '2022-11-05T00:00:00Z',
    updatedAt: '2026-10-20T00:00:00Z',
  },
  {
    id: 'ani-005',
    tag: 'PK-BF-03',
    name: 'Chandi (چاندی)',
    species: 'Buffalo',
    breed: 'Nili-Ravi',
    gender: 'Female',
    dob: '2019-11-04',
    purchaseDate: '2022-01-14',
    purchasePricePKR: 340000,
    sellerSource: 'Bahawalpur Livestock Farm',
    status: 'Pregnant',
    lactationNumber: 4,
    lastCalvingDate: '2025-11-12',
    location: 'Shed C - Maternity & Gestation',
    notes: 'Confirmed pregnant by Dr. Arshad (AI with Semen Straw B-110). Expected calving in Dec 2026.',
    createdAt: '2022-01-14T00:00:00Z',
    updatedAt: '2026-10-20T00:00:00Z',
  },
  {
    id: 'ani-006',
    tag: 'PK-CW-03',
    name: 'Gulabo (گلابو)',
    species: 'Cow',
    breed: 'Cholistani',
    gender: 'Female',
    dob: '2022-04-18',
    purchaseDate: '2024-03-22',
    purchasePricePKR: 195000,
    sellerSource: 'Cholistan Desert Pastoralists',
    status: 'Milking',
    lactationNumber: 1,
    lastCalvingDate: '2026-09-14',
    location: 'Shed B - Indigenous Milkers',
    notes: 'First calf heifer. Distinctive black-spotted coat. Very hardy in hot summer weather.',
    createdAt: '2024-03-22T00:00:00Z',
    updatedAt: '2026-10-20T00:00:00Z',
  },
  {
    id: 'ani-007',
    tag: 'PK-BF-04',
    name: 'Moti (موتی)',
    species: 'Buffalo',
    breed: 'Kundi (Sindh)',
    gender: 'Female',
    dob: '2020-06-30',
    purchaseDate: '2023-08-05',
    purchasePricePKR: 310000,
    sellerSource: 'Hyderabad Cattle Fair',
    status: 'Dry',
    lactationNumber: 3,
    lastCalvingDate: '2025-09-18',
    location: 'Shed D - Dry Animals',
    notes: 'Dry-off period ongoing. Given dry cow intramammary antibiotic infusion.',
    createdAt: '2023-08-05T00:00:00Z',
    updatedAt: '2026-10-20T00:00:00Z',
  },
  {
    id: 'ani-008',
    tag: 'PK-CW-04',
    name: 'Kajal (کاجل)',
    species: 'Cow',
    breed: 'Red Sindhi',
    gender: 'Female',
    dob: '2022-09-05',
    purchaseDate: '2024-05-10',
    purchasePricePKR: 210000,
    sellerSource: 'Karachi Malir Dairy Colony',
    status: 'Milking',
    lactationNumber: 1,
    lastCalvingDate: '2026-09-28',
    location: 'Shed B - Indigenous Milkers',
    notes: 'Recently experienced minor milk drop due to change in green fodder.',
    createdAt: '2024-05-10T00:00:00Z',
    updatedAt: '2026-10-20T00:00:00Z',
  },
  {
    id: 'ani-009',
    tag: 'PK-CW-05',
    name: 'Bhoori (بھوری)',
    species: 'Cow',
    breed: 'Crossbred (Jersey x Sahiwal)',
    gender: 'Female',
    dob: '2021-07-22',
    purchaseDate: '2023-10-01',
    purchasePricePKR: 260000,
    sellerSource: 'Faisalabad Agriculture University Herd',
    status: 'Sick',
    lactationNumber: 2,
    lastCalvingDate: '2026-08-01',
    location: 'Isolation Pen / Sick Bay',
    notes: 'Mild right hind quarter mastitis under treatment with Ceftiofur. Milk withheld!',
    createdAt: '2023-10-01T00:00:00Z',
    updatedAt: '2026-10-20T00:00:00Z',
  },
  {
    id: 'ani-010',
    tag: 'PK-BL-01',
    name: 'Sultan (سلطان)',
    species: 'Buffalo',
    breed: 'Nili-Ravi Stud Bull',
    gender: 'Male',
    dob: '2020-02-15',
    purchaseDate: '2022-06-12',
    purchasePricePKR: 450000,
    sellerSource: 'Qadirabad Buffalo Farm',
    status: 'Dry',
    lactationNumber: 0,
    location: 'Bull Pen',
    notes: 'Pedigree breeding bull. Excellent wall-eye trait and horn curl.',
    createdAt: '2022-06-12T00:00:00Z',
    updatedAt: '2026-10-20T00:00:00Z',
  },
];

// Helper to generate dates relative to today (2026-10-21)
function getDateOffset(daysAgo: number): string {
  const d = new Date(2026, 9, 21); // Month is 0-indexed: 9 = Oct
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

// Generate realistic 14 days of milk records
export function generateSeedMilkRecords(): DailyMilkRecord[] {
  const records: DailyMilkRecord[] = [];
  const milkers = [
    { id: 'ani-001', tag: 'PK-BF-01', baseMorn: 8.5, baseEve: 7.0, rate: 240, fat: 7.2 },
    { id: 'ani-002', tag: 'PK-BF-02', baseMorn: 7.0, baseEve: 6.2, rate: 240, fat: 6.8 },
    { id: 'ani-003', tag: 'PK-CW-01', baseMorn: 8.2, baseEve: 6.8, rate: 190, fat: 4.4 },
    { id: 'ani-004', tag: 'PK-CW-02', baseMorn: 11.5, baseEve: 9.5, rate: 190, fat: 3.9 },
    { id: 'ani-006', tag: 'PK-CW-03', baseMorn: 6.0, baseEve: 5.2, rate: 190, fat: 4.6 },
    { id: 'ani-008', tag: 'PK-CW-04', baseMorn: 5.5, baseEve: 4.8, rate: 190, fat: 4.2 },
    { id: 'ani-009', tag: 'PK-CW-05', baseMorn: 8.0, baseEve: 7.0, rate: 190, fat: 4.5 },
  ];

  let idCounter = 1;

  for (let daysAgo = 13; daysAgo >= 0; daysAgo--) {
    const dateStr = getDateOffset(daysAgo);

    for (const m of milkers) {
      let morn = m.baseMorn + (Math.sin(daysAgo + idCounter) * 0.4);
      let eve = m.baseEve + (Math.cos(daysAgo + idCounter) * 0.3);

      // Introduce a realistic milk drop alert on Bhoori (ani-009) starting 2 days ago due to mastitis
      let hasAnomaly = false;
      let anomalyReason = '';
      if (m.id === 'ani-009' && daysAgo <= 2) {
        morn = 3.5; // Significant drop from 8.0
        eve = 2.8;
        hasAnomaly = true;
        anomalyReason = 'Sudden 55% drop in milk yield. Swollen right rear quarter. Mastitis suspected.';
      }

      // Slightly lower yield for PK-CW-04 today
      if (m.id === 'ani-008' && daysAgo === 0) {
        morn = 4.0;
        eve = 3.5;
        hasAnomaly = true;
        anomalyReason = 'Mild drop (22%) detected compared to 7-day average. Check for heat signs or feed intake.';
      }

      morn = Math.round(morn * 10) / 10;
      eve = Math.round(eve * 10) / 10;
      const total = Math.round((morn + eve) * 10) / 10;
      // If Bhoori is under antibiotic treatment today or yesterday, milk is discarded (not sold)
      const sold = (m.id === 'ani-009' && daysAgo <= 1) ? 0 : total;
      const revenue = Math.round(sold * m.rate);

      records.push({
        id: `mlk-${String(idCounter++).padStart(4, '0')}`,
        date: dateStr,
        animalId: m.id,
        animalTag: m.tag,
        morningMilkLiters: morn,
        eveningMilkLiters: eve,
        totalDailyMilkLiters: total,
        soldQuantityLiters: sold,
        saleRatePerLiterPKR: m.rate,
        totalSaleRevenuePKR: revenue,
        fatPercentage: m.fat,
        hasAnomaly,
        anomalyReason: hasAnomaly ? anomalyReason : undefined,
        notes: (m.id === 'ani-009' && daysAgo <= 1) ? 'Milk withheld due to antibiotic withdrawal.' : undefined,
      });
    }
  }

  return records;
}

export const initialBreedingRecords: BreedingRecord[] = [
  {
    id: 'brd-001',
    animalId: 'ani-005',
    animalTag: 'PK-BF-03',
    heatObservedDate: '2026-02-05',
    heatSymptoms: ['Clear mucous discharge', 'Frequent urination', 'Vulva swelling'],
    matingType: 'AI',
    semenStrawBrandOrBullId: 'ABS Nili-Ravi Supreme Straw #B-110',
    inseminationDate: '2026-02-06',
    inseminatorName: 'Dr. Tariq Mahmood (Punjab Livestock)',
    costPKR: 4500,
    pregnancyCheckDueDate: '2026-04-06',
    pregnancyStatus: 'Confirmed Pregnant',
    pregnancyConfirmedDate: '2026-04-08',
    expectedCalvingDate: '2026-12-13', // 310 days
    expectedDryOffDate: '2026-10-14',
    notes: 'Buffalo in advanced pregnancy. Udder starting to fill. Move to maternity pen.',
  },
  {
    id: 'brd-002',
    animalId: 'ani-001',
    animalTag: 'PK-BF-01',
    heatObservedDate: '2026-10-02',
    heatSymptoms: ['Bellowing', 'Drop in evening milk', 'Mounting other animals'],
    matingType: 'AI',
    semenStrawBrandOrBullId: 'Semen Production Unit Qadirabad #NR-882',
    inseminationDate: '2026-10-03',
    inseminatorName: 'Dr. Tariq Mahmood',
    costPKR: 4000,
    pregnancyCheckDueDate: '2026-12-02',
    pregnancyStatus: 'Pending Check',
    notes: 'AI conducted 12 hours after standing heat. Pregnancy check due in Dec.',
  },
  {
    id: 'brd-003',
    animalId: 'ani-003',
    animalTag: 'PK-CW-01',
    heatObservedDate: '2026-09-29',
    heatSymptoms: ['Restlessness', 'Clear discharge'],
    matingType: 'AI',
    semenStrawBrandOrBullId: 'Sahiwal Pedigree S-404 (Sahiwal Cattle Farm)',
    inseminationDate: '2026-09-30',
    inseminatorName: 'Dr. Nasir Iqbal',
    costPKR: 3500,
    pregnancyCheckDueDate: '2026-11-29',
    pregnancyStatus: 'Pending Check',
    notes: 'First service after 2nd lactation calving.',
  },
];

export const initialHealthRecords: HealthRecord[] = [
  {
    id: 'hlth-001',
    animalId: 'ani-009',
    animalTag: 'PK-CW-05',
    recordType: 'Diagnosis',
    date: '2026-10-19',
    diseaseOrCondition: 'Clinical Mastitis (Saaroo / ساڑو)',
    symptoms: ['Right rear quarter hot & swollen', 'Watery milk with yellow flakes', 'Mild fever 102.8°F'],
    treatment: 'Intramammary Ceftiofur infusion + Injectable Meloxicam (NSAID) 15ml + Vitamin E & Selenium',
    medicineName: 'Ceftiofur intramammary + Melovet + Vit E',
    dosage: '1 syringe daily for 3 days',
    veterinarianName: 'Dr. Nasir Iqbal (DVM)',
    costPKR: 4800,
    milkWithdrawalDays: 5,
    nextFollowUpDate: '2026-10-22',
    notes: 'DO NOT SELL MILK until withdrawal date 2026-10-24. Discard milk after boiling.',
  },
  {
    id: 'hlth-002',
    animalId: 'ani-001',
    animalTag: 'PK-BF-01',
    recordType: 'Vaccination',
    date: '2026-09-10',
    diseaseOrCondition: 'Foot & Mouth Disease (FMD / منہ کھر)',
    symptoms: ['Routine Bi-annual Vaccination'],
    treatment: 'FMD Trivalent Oil Adjuvant Vaccine (A, O, Asia-1)',
    medicineName: 'Aftovaxpur FMD Vaccine',
    dosage: '3 ml subcutaneous',
    veterinarianName: 'Govt Veterinary Hospital Chunian',
    costPKR: 1200,
    milkWithdrawalDays: 0,
    nextDueDate: '2027-03-10',
    notes: 'All animals vaccinated smoothly.',
  },
  {
    id: 'hlth-003',
    animalId: 'ani-004',
    animalTag: 'PK-CW-02',
    recordType: 'Deworming',
    date: '2026-08-15',
    diseaseOrCondition: 'Internal Parasite Deworming (Liver Fluke & Roundworms)',
    symptoms: ['Quarterly Routine Prophylaxis'],
    treatment: 'Oxyclozanide + Levamisole drench',
    medicineName: 'Nilzan Plus Drench',
    dosage: '100 ml oral drench',
    veterinarianName: 'Ch. Sabgatullah (Farm Manager)',
    costPKR: 950,
    milkWithdrawalDays: 1,
    nextDueDate: '2026-11-15',
    notes: 'Good appetite following deworming.',
  },
];

export const initialExpenses: ExpenseRecord[] = [
  {
    id: 'exp-001',
    date: '2026-10-20',
    category: 'Wanda & Concentrates',
    description: 'Supreme Dairy Wanda 20% CP (Punjab Feed Mills) - 10 bags',
    quantity: 10,
    unit: 'bag (50kg)',
    ratePerUnitPKR: 4100,
    totalAmountPKR: 41000,
    paidTo: 'Al-Rehman Feed Store, Pattoki',
    paymentMethod: 'Bank Transfer / JazzCash / Easypaisa',
    notes: 'Standard high-protein feed for milking animals.',
  },
  {
    id: 'exp-002',
    date: '2026-10-18',
    category: 'Green Fodder (Barseem/Maize/Jowar)',
    description: 'Fresh chopped Maize Silage & green Barseem cart',
    quantity: 60,
    unit: 'maund (40kg)',
    ratePerUnitPKR: 350,
    totalAmountPKR: 21000,
    paidTo: 'Haji Aslam (Neighboring land)',
    paymentMethod: 'Cash',
    notes: 'Sweet maize silage high in energy.',
  },
  {
    id: 'exp-003',
    date: '2026-10-15',
    category: 'Dry Fodder (Toori/Wheat Straw)',
    description: 'Clean golden Wheat Straw (Toori / توڑی) - 30 maunds',
    quantity: 30,
    unit: 'maund (40kg)',
    ratePerUnitPKR: 850,
    totalAmountPKR: 25500,
    paidTo: 'Malik Zafar Tractor Trolley',
    paymentMethod: 'Cash',
    notes: 'Essential dry fiber buffer in rumen.',
  },
  {
    id: 'exp-004',
    date: '2026-10-19',
    category: 'Veterinary & Medicines',
    description: 'Mastitis treatment medicines & CMT solution kit',
    quantity: 1,
    totalAmountPKR: 4800,
    paidTo: 'Dr. Nasir Iqbal Clinic',
    paymentMethod: 'Cash',
    notes: 'For animal PK-CW-05.',
  },
  {
    id: 'exp-005',
    date: '2026-10-10',
    category: 'Electricity & Diesel Fuel',
    description: 'LESCO Tube-well and shed fans electricity bill + 40L Diesel for generator',
    quantity: 1,
    totalAmountPKR: 32000,
    paidTo: 'LESCO & PSO Petrol Pump',
    paymentMethod: 'Bank Transfer / JazzCash / Easypaisa',
    notes: 'Monthly power and backup diesel.',
  },
  {
    id: 'exp-006',
    date: '2026-10-01',
    category: 'Labor & Salaries',
    description: 'Monthly salaries for Milker (Gawala) and Herdsman',
    quantity: 2,
    unit: 'month',
    totalAmountPKR: 50000,
    paidTo: 'Muhammad Ramzan & Bilal Ahmed',
    paymentMethod: 'Cash',
    notes: 'Rs. 26,000 for Ramzan (Head Milker), Rs. 24,000 for Bilal (Feeder).',
  },
];

export const initialWorkers: WorkerRecord[] = [
  {
    id: 'wrk-001',
    name: 'Muhammad Ramzan (محمد رمضان)',
    role: 'Milker (Gawala)',
    phone: '0301-7654321',
    monthlySalaryPKR: 26000,
    joiningDate: '2022-03-01',
    status: 'Active',
  },
  {
    id: 'wrk-002',
    name: 'Bilal Ahmed (بلال احمد)',
    role: 'Feeder',
    phone: '0322-9876543',
    monthlySalaryPKR: 24000,
    joiningDate: '2023-01-15',
    status: 'Active',
  },
  {
    id: 'wrk-003',
    name: 'Dr. Nasir Iqbal (DVM)',
    role: 'Farm Manager',
    phone: '0300-1234567',
    monthlySalaryPKR: 45000,
    joiningDate: '2021-06-01',
    status: 'Active',
  },
];
