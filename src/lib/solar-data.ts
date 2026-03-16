/**
 * SOLAR SAVINGS CALCULATOR — Data & Formulas
 * ============================================
 * South African commercial solar data for the interactive calculator.
 */

// ─── Province Solar Yields (kWh/kWp/year) ───────────────

export const PROVINCES: Record<string, number> = {
  'Gauteng': 1650,
  'Western Cape': 1700,
  'KwaZulu-Natal': 1550,
  'Eastern Cape': 1650,
  'Free State': 1800,
  'Limpopo': 1750,
  'Mpumalanga': 1600,
  'North West': 1800,
  'Northern Cape': 2000,
};

export const PROVINCE_NAMES = Object.keys(PROVINCES);

// ─── Tariff Rates (R/kWh) ───────────────────────────────

export type TariffType = 'eskom' | 'municipal' | 'custom';

export const TARIFF_RATES: Record<Exclude<TariffType, 'custom'>, number> = {
  eskom: 2.20,
  municipal: 3.10,
};

export const TARIFF_LABELS: Record<TariffType, string> = {
  eskom: 'Eskom Direct',
  municipal: 'Municipal Average',
  custom: 'Custom Rate',
};

// ─── System Constants ───────────────────────────────────

export const SYSTEM_CONSTANTS = {
  performanceRatio: 0.80,
  annualDegradation: 0.005,
  lifespanYears: 25,
  tariffEscalation: 0.10,
  costPerKWp: 14000,
  selfConsumptionRatio: 0.85,
  co2Factor: 1.04,        // kg CO2/kWh
  roofSpacePerKWp: 6,     // m² per kWp
} as const;

// ─── Input Types ────────────────────────────────────────

export type InputMode = 'bill' | 'system-size';

export interface CalculatorInputs {
  mode: InputMode;
  monthlyBill: number;
  systemSize: number;
  tariffType: TariffType;
  customTariff: number;
  province: string;
}

export interface CalculatorResults {
  systemSize: number;
  annualGeneration: number;
  monthlySavings: number;
  paybackYears: number;
  paybackMonths: number;
  totalSavings25yr: number;
  co2SavedPerYear: number;
  co2SavedLifetime: number;
  roofArea: number;
  systemCost: number;
  monthlyBillAfterSolar: number;
  originalMonthlyBill: number;
}

// ─── Calculation Functions ──────────────────────────────

function getTariffRate(inputs: CalculatorInputs): number {
  if (inputs.tariffType === 'custom') return inputs.customTariff;
  return TARIFF_RATES[inputs.tariffType];
}

function getSystemSizeFromBill(inputs: CalculatorInputs): number {
  const tariff = getTariffRate(inputs);
  if (tariff <= 0) return 0;
  const monthlyConsumption = inputs.monthlyBill / tariff;
  const annualConsumption = monthlyConsumption * 12;
  const solarYield = PROVINCES[inputs.province] ?? 1650;
  const { selfConsumptionRatio, performanceRatio } = SYSTEM_CONSTANTS;
  return (annualConsumption * selfConsumptionRatio) / (solarYield * performanceRatio);
}

function calculatePayback(systemCost: number, firstYearSavings: number): { years: number; months: number } {
  if (firstYearSavings <= 0) return { years: 99, months: 0 };

  const { tariffEscalation, annualDegradation } = SYSTEM_CONSTANTS;
  let cumulative = 0;

  for (let n = 0; n < SYSTEM_CONSTANTS.lifespanYears; n++) {
    const yearSavings = firstYearSavings
      * Math.pow(1 + tariffEscalation, n)
      * Math.pow(1 - annualDegradation, n);
    cumulative += yearSavings;

    if (cumulative >= systemCost) {
      // Interpolate to find months within this year
      const prevCumulative = cumulative - yearSavings;
      const remaining = systemCost - prevCumulative;
      const monthFraction = remaining / yearSavings;
      const totalMonths = n * 12 + Math.round(monthFraction * 12);
      return { years: Math.floor(totalMonths / 12), months: totalMonths % 12 };
    }
  }

  return { years: 25, months: 0 };
}

export function calculate(inputs: CalculatorInputs): CalculatorResults {
  const solarYield = PROVINCES[inputs.province] ?? 1650;
  const tariff = getTariffRate(inputs);
  const { performanceRatio, selfConsumptionRatio, costPerKWp, co2Factor, roofSpacePerKWp, lifespanYears, tariffEscalation, annualDegradation } = SYSTEM_CONSTANTS;

  // Determine system size
  const systemSize = inputs.mode === 'bill'
    ? getSystemSizeFromBill(inputs)
    : inputs.systemSize;

  // Annual generation (year 1)
  const annualGeneration = systemSize * solarYield * performanceRatio;

  // Annual savings (year 1)
  const annualSavings = annualGeneration * selfConsumptionRatio * tariff;
  const monthlySavings = annualSavings / 12;

  // System cost
  const systemCost = systemSize * costPerKWp;

  // Payback period
  const { years: paybackYears, months: paybackMonths } = calculatePayback(systemCost, annualSavings);

  // 25-year total savings
  let totalSavings25yr = 0;
  for (let n = 0; n < lifespanYears; n++) {
    totalSavings25yr += annualSavings
      * Math.pow(1 + tariffEscalation, n)
      * Math.pow(1 - annualDegradation, n);
  }

  // CO2 reduction
  const co2SavedPerYear = (annualGeneration * co2Factor) / 1000; // tonnes
  const co2SavedLifetime = co2SavedPerYear * lifespanYears;

  // Roof area
  const roofArea = systemSize * roofSpacePerKWp;

  // Monthly bill comparison
  const originalMonthlyBill = inputs.mode === 'bill'
    ? inputs.monthlyBill
    : (systemSize * solarYield * performanceRatio * selfConsumptionRatio * tariff) / 12 / 0.85 * 1; // estimate what a bill would be if solar covers 85%
  const monthlyBillAfterSolar = Math.max(0, originalMonthlyBill - monthlySavings);

  return {
    systemSize,
    annualGeneration,
    monthlySavings,
    paybackYears,
    paybackMonths,
    totalSavings25yr,
    co2SavedPerYear,
    co2SavedLifetime,
    roofArea,
    systemCost,
    monthlyBillAfterSolar,
    originalMonthlyBill,
  };
}
