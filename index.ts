export type Species = 'Buffalo' | 'Cow';

export type AnimalStatus = 'Milking' | 'Dry' | 'Pregnant' | 'Sick' | 'Sold' | 'Deceased';

export interface Animal {
  id: string;
  tag: string; // Ear tag (e.g. PK-BF-01) - unique
  name: string;
  species: Species;
  breed: string; // e.g., Nili-Ravi, Kundi, Sahiwal, Cholistani, Red Sindhi, Crossbred, Holstein
  gender: 'Female' | 'Male';
  dob: string; // YYYY-MM-DD or estimated
  purchaseDate?: string;
  purchasePricePKR?: number;
  sellerSource?: string;
  status: AnimalStatus;
  lactationNumber: number;
  lastCalvingDate?: string;
  location: string; // Shed 1, High Yield Shed, Maternity Pen, etc.
  notes?: string;
  sireTag?: string;
  damTag?: string;
  photoUrl?: string;
  saleDetails?: {
    saleDate: string;
    salePricePKR: number;
    buyer: string;
    reason?: string;
  };
  deathDetails?: {
    deathDate: string;
    causeOfDeath: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface DailyMilkRecord {
  id: string;
  date: string; // YYYY-MM-DD
  animalId: string;
  animalTag: string;
  morningMilkLiters: number;
  eveningMilkLiters: number;
  afternoonMilkLiters?: number;
  totalDailyMilkLiters: number;
  soldQuantityLiters: number;
  saleRatePerLiterPKR: number;
  totalSaleRevenuePKR: number;
  fatPercentage?: number; // e.g. 6.5% for buffalo, 3.8% for cow
  notes?: string;
  hasAnomaly?: boolean;
  anomalyReason?: string;
}

export interface BreedingRecord {
  id: string;
  animalId: string;
  animalTag: string;
  heatObservedDate: string;
  heatSymptoms?: string[];
  matingType: 'AI' | 'Natural';
  semenStrawBrandOrBullId: string; // e.g. "Punjab Livestock Semen - Sahiwal S-402", "ABS Nili-Ravi"
  inseminationDate: string;
  inseminatorName: string;
  costPKR: number;
  pregnancyCheckDueDate: string; // Usually +60 days
  pregnancyStatus: 'Pending Check' | 'Confirmed Pregnant' | 'Empty / Repeat';
  pregnancyConfirmedDate?: string;
  expectedCalvingDate?: string; // 283 days for cow, 310 days for buffalo
  expectedDryOffDate?: string; // Calving date - 60 days
  calvingRecord?: {
    actualCalvingDate: string;
    calfTag: string;
    calfGender: 'Female' | 'Male';
    calvingEase: 'Easy / Unassisted' | 'Assisted' | 'Surgical / Dystocia';
    notes?: string;
  };
  notes?: string;
}

export interface HealthRecord {
  id: string;
  animalId: string;
  animalTag: string;
  recordType: 'Checkup' | 'Diagnosis' | 'Vaccination' | 'Deworming' | 'Surgery';
  date: string;
  diseaseOrCondition: string; // e.g. Mastitis (Saaroo), HS (Gal Ghotu), FMD (Munh-Khur), Lumpy Skin, Milk Fever, Bloat
  symptoms: string[];
  treatment: string;
  medicineName: string;
  dosage: string;
  veterinarianName: string;
  costPKR: number;
  milkWithdrawalDays: number; // Days milk cannot be consumed or sold
  nextFollowUpDate?: string;
  nextDueDate?: string; // For vaccines/deworming
  notes?: string;
}

export type ExpenseCategory =
  | 'Green Fodder (Barseem/Maize/Jowar)'
  | 'Dry Fodder (Toori/Wheat Straw)'
  | 'Wanda & Concentrates'
  | 'Veterinary & Medicines'
  | 'Labor & Salaries'
  | 'Electricity & Diesel Fuel'
  | 'Maintenance & Equipment'
  | 'Other Farm Expenses';

export interface ExpenseRecord {
  id: string;
  date: string;
  category: ExpenseCategory;
  description: string;
  quantity?: number;
  unit?: 'kg' | 'maund (40kg)' | 'bag (50kg)' | 'liter' | 'hours' | 'month';
  ratePerUnitPKR?: number;
  totalAmountPKR: number;
  paidTo: string;
  paymentMethod: 'Cash' | 'Bank Transfer / JazzCash / Easypaisa' | 'Cheque';
  notes?: string;
}

export interface IncomeRecord {
  id: string;
  date: string;
  source: 'Daily Milk Sales' | 'Contract Milk Supply' | 'Animal Sale' | 'Manure / Dung (Gobar)' | 'Breeding Service' | 'Other';
  description: string;
  amountPKR: number;
  buyer: string;
  paymentStatus: 'Paid' | 'Credit / Due';
  notes?: string;
}

export interface WorkerRecord {
  id: string;
  name: string;
  role: 'Farm Manager' | 'Milker (Gawala)' | 'Feeder' | 'Herdsman' | 'Night Guard';
  phone: string;
  monthlySalaryPKR: number;
  joiningDate: string;
  status: 'Active' | 'On Leave' | 'Terminated';
}

export interface FarmSettings {
  farmName: string;
  ownerName: string;
  location: string;
  defaultCowMilkRatePKR: number;
  defaultBuffaloMilkRatePKR: number;
  alertThresholdMilkDropPct: number;
  currency: 'PKR';
}

export interface MilkDropAlert {
  animalId: string;
  animalTag: string;
  animalName: string;
  species: Species;
  previousAvgLiters: number;
  todayLiters: number;
  dropPercentage: number;
  suggestedCauses: string[];
  recommendedActions: string[];
  severity: 'Moderate' | 'Severe';
}
