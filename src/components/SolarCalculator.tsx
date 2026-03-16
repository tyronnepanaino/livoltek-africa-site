import { useState, useMemo } from 'react';
import { Sun, Zap, TrendingUp, Leaf, Home, ArrowRight, Calculator } from 'lucide-react';
import {
  type InputMode,
  type TariffType,
  type CalculatorInputs,
  PROVINCES,
  PROVINCE_NAMES,
  TARIFF_LABELS,
  TARIFF_RATES,
  calculate,
} from '../lib/solar-data';

// ─── Formatting Helpers ─────────────────────────────────

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value: number, decimals = 0): string {
  return new Intl.NumberFormat('en-ZA', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

// ─── Sub-Components ─────────────────────────────────────

function ModeToggle({ mode, onChange }: { mode: InputMode; onChange: (m: InputMode) => void }) {
  return (
    <div className="flex rounded-xl bg-gray-100 p-1">
      <button
        type="button"
        onClick={() => onChange('bill')}
        className="flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-200"
        style={{
          backgroundColor: mode === 'bill' ? '#009BFF' : 'transparent',
          color: mode === 'bill' ? '#fff' : '#5A6A7E',
        }}
      >
        I know my monthly bill
      </button>
      <button
        type="button"
        onClick={() => onChange('system-size')}
        className="flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-200"
        style={{
          backgroundColor: mode === 'system-size' ? '#009BFF' : 'transparent',
          color: mode === 'system-size' ? '#fff' : '#5A6A7E',
        }}
      >
        I know my system size
      </button>
    </div>
  );
}

function SliderInput({
  label,
  value,
  min,
  max,
  step,
  unit,
  prefix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  prefix?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium" style={{ color: '#0C2340' }}>{label}</label>
        <div className="flex items-center gap-1">
          {prefix && <span className="text-sm font-semibold" style={{ color: '#0C2340' }}>{prefix}</span>}
          <input
            type="number"
            value={value}
            min={min}
            max={max}
            step={step}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              if (!isNaN(v)) onChange(Math.max(min, Math.min(max, v)));
            }}
            className="w-28 rounded-lg border border-gray-200 px-3 py-1.5 text-right text-sm font-semibold focus:border-[#009BFF] focus:outline-none focus:ring-1 focus:ring-[#009BFF]"
            style={{ color: '#0C2340' }}
          />
          {unit && <span className="text-sm" style={{ color: '#5A6A7E' }}>{unit}</span>}
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, #009BFF ${((value - min) / (max - min)) * 100}%, #E5E7EB ${((value - min) / (max - min)) * 100}%)`,
        }}
      />
      <div className="flex justify-between text-xs" style={{ color: '#5A6A7E' }}>
        <span>{prefix}{formatNumber(min)}{unit ? ` ${unit}` : ''}</span>
        <span>{prefix}{formatNumber(max)}{unit ? ` ${unit}` : ''}</span>
      </div>
    </div>
  );
}

function ResultCard({
  icon: Icon,
  label,
  value,
  sub,
  color = '#0C2340',
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  label: string;
  value: string;
  sub?: string;
  color?: string;
}) {
  return (
    <div className="rounded-xl p-4 transition-all duration-300" style={{ backgroundColor: '#F5F7FA' }}>
      <div className="flex items-start gap-3">
        <div className="rounded-lg p-2" style={{ backgroundColor: `${color}15` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium mb-0.5" style={{ color: '#5A6A7E' }}>{label}</p>
          <p className="text-lg font-bold leading-tight transition-all duration-300" style={{ color }}>{value}</p>
          {sub && <p className="text-xs mt-0.5" style={{ color: '#5A6A7E' }}>{sub}</p>}
        </div>
      </div>
    </div>
  );
}

function BillComparisonChart({ before, after }: { before: number; after: number }) {
  const maxVal = Math.max(before, 1);
  const afterPercent = Math.max((after / maxVal) * 100, 2);
  const savingsPercent = Math.round(((before - after) / maxVal) * 100);

  return (
    <div className="rounded-xl p-4" style={{ backgroundColor: '#F5F7FA' }}>
      <p className="text-xs font-medium mb-3" style={{ color: '#5A6A7E' }}>Monthly Bill Comparison</p>
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span style={{ color: '#5A6A7E' }}>Current</span>
            <span className="font-semibold" style={{ color: '#0C2340' }}>{formatCurrency(before)}</span>
          </div>
          <div className="h-6 rounded-md w-full" style={{ backgroundColor: '#FEE2E2' }}>
            <div className="h-full rounded-md" style={{ width: '100%', backgroundColor: '#EF4444' }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span style={{ color: '#5A6A7E' }}>With Solar</span>
            <span className="font-semibold" style={{ color: '#27AE60' }}>{formatCurrency(after)}</span>
          </div>
          <div className="h-6 rounded-md w-full" style={{ backgroundColor: '#D1FAE5' }}>
            <div
              className="h-full rounded-md transition-all duration-500"
              style={{ width: `${afterPercent}%`, backgroundColor: '#27AE60' }}
            />
          </div>
        </div>
      </div>
      {savingsPercent > 0 && (
        <p className="text-center text-sm font-semibold mt-3" style={{ color: '#27AE60' }}>
          {savingsPercent}% reduction in electricity costs
        </p>
      )}
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────

export default function SolarCalculator() {
  const [inputs, setInputs] = useState<CalculatorInputs>({
    mode: 'bill',
    monthlyBill: 50000,
    systemSize: 100,
    tariffType: 'municipal',
    customTariff: 2.50,
    province: 'Gauteng',
  });

  const results = useMemo(() => calculate(inputs), [inputs]);

  const update = <K extends keyof CalculatorInputs>(key: K, value: CalculatorInputs[K]) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const tariffDisplay = inputs.tariffType === 'custom'
    ? inputs.customTariff
    : TARIFF_RATES[inputs.tariffType];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-0 overflow-hidden rounded-2xl shadow-xl border border-gray-100">
      {/* ── Left Panel: Inputs ── */}
      <div className="p-6 md:p-8 bg-white">
        <div className="flex items-center gap-3 mb-6">
          <div className="rounded-xl p-2.5" style={{ backgroundColor: '#E6F3FF' }}>
            <Calculator className="w-6 h-6" style={{ color: '#009BFF' }} />
          </div>
          <div>
            <h3 className="text-lg font-bold" style={{ color: '#0C2340' }}>Configure Your System</h3>
            <p className="text-sm" style={{ color: '#5A6A7E' }}>Adjust the inputs to estimate your savings</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Mode Toggle */}
          <ModeToggle mode={inputs.mode} onChange={(m) => update('mode', m)} />

          {/* Mode-specific inputs */}
          {inputs.mode === 'bill' ? (
            <SliderInput
              label="Monthly Electricity Bill"
              value={inputs.monthlyBill}
              min={5000}
              max={500000}
              step={1000}
              prefix="R"
              onChange={(v) => update('monthlyBill', v)}
            />
          ) : (
            <SliderInput
              label="System Size"
              value={inputs.systemSize}
              min={10}
              max={500}
              step={5}
              unit="kWp"
              onChange={(v) => update('systemSize', v)}
            />
          )}

          {/* Province */}
          <div className="space-y-2">
            <label className="text-sm font-medium" style={{ color: '#0C2340' }}>Province</label>
            <select
              value={inputs.province}
              onChange={(e) => update('province', e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-[#009BFF] focus:outline-none focus:ring-1 focus:ring-[#009BFF]"
              style={{ color: '#0C2340' }}
            >
              {PROVINCE_NAMES.map((p) => (
                <option key={p} value={p}>{p} — {formatNumber(PROVINCES[p])} kWh/kWp</option>
              ))}
            </select>
          </div>

          {/* Tariff Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium" style={{ color: '#0C2340' }}>Tariff Type</label>
            <select
              value={inputs.tariffType}
              onChange={(e) => update('tariffType', e.target.value as TariffType)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-[#009BFF] focus:outline-none focus:ring-1 focus:ring-[#009BFF]"
              style={{ color: '#0C2340' }}
            >
              {(Object.keys(TARIFF_LABELS) as TariffType[]).map((key) => (
                <option key={key} value={key}>
                  {TARIFF_LABELS[key]}{key !== 'custom' ? ` — R${TARIFF_RATES[key].toFixed(2)}/kWh` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Custom Tariff */}
          {inputs.tariffType === 'custom' && (
            <SliderInput
              label="Custom Tariff Rate"
              value={inputs.customTariff}
              min={1.00}
              max={5.00}
              step={0.05}
              prefix="R"
              unit="/kWh"
              onChange={(v) => update('customTariff', v)}
            />
          )}

          {/* Tariff display */}
          <div className="rounded-lg px-4 py-3 flex items-center justify-between" style={{ backgroundColor: '#E6F3FF' }}>
            <span className="text-sm" style={{ color: '#5A6A7E' }}>Active tariff rate</span>
            <span className="text-sm font-bold" style={{ color: '#009BFF' }}>R{tariffDisplay.toFixed(2)}/kWh</span>
          </div>
        </div>
      </div>

      {/* ── Right Panel: Results ── */}
      <div className="p-6 md:p-8" style={{ backgroundColor: '#0C2340' }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="rounded-xl p-2.5" style={{ backgroundColor: 'rgba(0, 155, 255, 0.15)' }}>
            <TrendingUp className="w-6 h-6" style={{ color: '#009BFF' }} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Your Solar Savings</h3>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>Estimated results based on your inputs</p>
          </div>
        </div>

        <div className="space-y-3">
          {/* System size */}
          <ResultCard
            icon={Sun}
            label={inputs.mode === 'bill' ? 'Recommended System Size' : 'System Size'}
            value={`${formatNumber(results.systemSize, 1)} kWp`}
            sub={`System cost: ${formatCurrency(results.systemCost)}`}
            color="#009BFF"
          />

          {/* Monthly savings */}
          <ResultCard
            icon={Zap}
            label="Estimated Monthly Savings"
            value={formatCurrency(results.monthlySavings)}
            sub={`${formatCurrency(results.monthlySavings * 12)}/year`}
            color="#27AE60"
          />

          {/* Payback period */}
          <ResultCard
            icon={TrendingUp}
            label="Payback Period"
            value={`${results.paybackYears} years${results.paybackMonths > 0 ? ` ${results.paybackMonths} months` : ''}`}
            sub={`25-year savings: ${formatCurrency(results.totalSavings25yr)}`}
            color="#009BFF"
          />

          {/* CO2 & Roof area */}
          <div className="grid grid-cols-2 gap-3">
            <ResultCard
              icon={Leaf}
              label="CO₂ Saved/Year"
              value={`${formatNumber(results.co2SavedPerYear, 0)} t`}
              sub={`${formatNumber(results.co2SavedLifetime, 0)}t lifetime`}
              color="#27AE60"
            />
            <ResultCard
              icon={Home}
              label="Roof Area"
              value={`${formatNumber(results.roofArea, 0)} m²`}
              sub={`${formatNumber(results.systemSize, 1)} kWp system`}
              color="#009BFF"
            />
          </div>

          {/* Bill comparison chart */}
          <BillComparisonChart
            before={results.originalMonthlyBill}
            after={results.monthlyBillAfterSolar}
          />
        </div>

        {/* CTA */}
        <div className="mt-6 space-y-3">
          <a
            href="/contact/quote-request"
            className="flex items-center justify-center gap-2 w-full rounded-xl px-6 py-3.5 text-sm font-bold text-white transition-all duration-200 hover:opacity-90"
            style={{ backgroundColor: '#009BFF' }}
          >
            Get an Accurate Quote
            <ArrowRight className="w-4 h-4" />
          </a>
          <p className="text-center text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Estimates based on average conditions. Actual savings depend on site assessment.
          </p>
        </div>
      </div>
    </div>
  );
}
