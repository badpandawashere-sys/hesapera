'use client';
import { ShareResult } from './share-result';

import { useState, useEffect, useRef } from 'react';
import { CalculatorViewModel } from '@/calculators/core/calculator-types';
import { CalculatorResult } from '@/calculators/core/calculator-result';
import { calculateAction } from '@/app/actions/calculate';
import { CalculatorSubmitButton } from './calculator-submit-button';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { ChevronDown, Loader2 } from 'lucide-react';
import NumberFlow from '@number-flow/react';

interface LoanCalculatorFormProps {
  calculator: CalculatorViewModel;
}

// Custom CSS for slider
const sliderStyles = `
  .loan-slider {
    -webkit-appearance: none;
    width: 100%;
    height: 6px;
    border-radius: 9999px;
    background: #E2E8F0;
    outline: none;
  }
  .loan-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #fff;
    border: 2px solid #7C3AED;
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(124, 58, 237, 0.3);
    transition: transform 0.1s;
  }
  .loan-slider::-webkit-slider-thumb:hover {
    transform: scale(1.1);
  }
  .loan-slider::-moz-range-thumb {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #fff;
    border: 2px solid #7C3AED;
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(124, 58, 237, 0.3);
    transition: transform 0.1s;
  }
  .loan-slider::-moz-range-thumb:hover {
    transform: scale(1.1);
  }
`;

export function LoanCalculatorForm({ calculator }: LoanCalculatorFormProps) {
  // Underlying numeric values
  const [loanAmount, setLoanAmount] = useState<number>(100000);
  const [interestRate, setInterestRate] = useState<number>(3.50);
  const [term, setTerm] = useState<number>(12);

  // Formatted display values for inputs
  const [loanAmountStr, setLoanAmountStr] = useState<string>("100.000");

  const [result, setResult] = useState<CalculatorResult<any, any> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showTable, setShowTable] = useState(false);

  // Auto-calculate on mount
  useEffect(() => {
    handleCalculate();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCalculate = async () => {
    setIsLoading(true);
    try {
      const res = await calculateAction(calculator.slug, {
        loanAmount,
        monthlyInterestRate: interestRate,
        termMonths: term
      });
      if (res.success) {
        setResult(res);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to parse currency strings from backend
  const parseFormattedNumber = (str: string) => {
    if (!str) return 0;
    const cleaned = str.replace(/[^0-9,-]/g, '').replace(',', '.');
    return parseFloat(cleaned) || 0;
  };

  const principal = loanAmount;
  let totalInterest = 0;
  let monthlyPayment = 0;
  
  if (result?.data?.secondaryResults?.['Toplam Faiz']) {
    totalInterest = parseFormattedNumber(result.data.secondaryResults['Toplam Faiz'] as string);
  }
  
  if (result?.data?.primaryResult) {
    monthlyPayment = parseFormattedNumber(result.data.primaryResult);
  }

  const chartData = [
    { name: 'Kredi Tutarı', value: principal, color: '#8B5CF6' }, // Violet-500
    { name: 'Toplam Faiz', value: totalInterest, color: '#C4B5FD' } // Violet-300
  ];

  // Formatting helpers for the inputs
  const formatThousands = (num: number) => new Intl.NumberFormat('tr-TR').format(num);

  const handleLoanAmountInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    if (!val) {
      setLoanAmountStr("");
      setLoanAmount(0);
      return;
    }
    const num = parseInt(val, 10);
    setLoanAmount(num);
    setLoanAmountStr(formatThousands(num));
  };

  const handleLoanAmountSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = Number(e.target.value);
    setLoanAmount(num);
    setLoanAmountStr(formatThousands(num));
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      <style dangerouslySetInnerHTML={{ __html: sliderStyles }} />
      
      {/* Main Premium Card */}
      <div className="bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-6 md:p-10 lg:p-12">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* LEFT: Inputs */}
          <div className="lg:col-span-7 flex flex-col space-y-10">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Kredi Detayları</h2>
              <p className="text-slate-500">İhtiyacınıza uygun tutar, faiz ve vadeyi belirleyin.</p>
            </div>

            <div className="space-y-10">
              {/* Loan Amount */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-slate-700">Kredi Tutarı</label>
                  <div className="relative">
                    <input 
                      type="text"
                      inputMode="numeric"
                      value={loanAmountStr}
                      onChange={handleLoanAmountInputChange}
                      onBlur={handleCalculate}
                      className="w-40 px-4 py-2 pr-10 text-right bg-[#F8FAFC] border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium pointer-events-none">TL</span>
                  </div>
                </div>
                <input 
                  type="range"
                  min={10000}
                  max={5000000}
                  step={5000}
                  value={loanAmount}
                  onChange={handleLoanAmountSliderChange}
                  onMouseUp={handleCalculate}
                  onTouchEnd={handleCalculate}
                  className="loan-slider"
                  style={{
                    background: `linear-gradient(to right, #7C3AED 0%, #7C3AED ${(loanAmount - 10000) / (5000000 - 10000) * 100}%, #E2E8F0 ${(loanAmount - 10000) / (5000000 - 10000) * 100}%, #E2E8F0 100%)`
                  }}
                />
                <div className="flex justify-between text-xs font-medium text-slate-400">
                  <span>10.000 TL</span>
                  <span>5.000.000 TL</span>
                </div>
              </div>

              {/* Interest Rate */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-slate-700">Aylık Faiz Oranı (%)</label>
                  <input 
                    type="text" inputMode="decimal"
                    value={interestRate}
                    onChange={(e) => setInterestRate(Number(e.target.value))}
                    onBlur={handleCalculate}
                    className="w-32 px-4 py-2 text-right bg-[#F8FAFC] border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all"
                  />
                </div>
                <input 
                  type="range"
                  min={0.1}
                  max={10.0}
                  step={0.01}
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  onMouseUp={handleCalculate}
                  onTouchEnd={handleCalculate}
                  className="loan-slider"
                  style={{
                    background: `linear-gradient(to right, #7C3AED 0%, #7C3AED ${(interestRate - 0.1) / (10 - 0.1) * 100}%, #E2E8F0 ${(interestRate - 0.1) / (10 - 0.1) * 100}%, #E2E8F0 100%)`
                  }}
                />
                <div className="flex justify-between text-xs font-medium text-slate-400">
                  <span>%0.10</span>
                  <span>%10.00</span>
                </div>
              </div>

              {/* Term */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-slate-700">Vade (Ay)</label>
                  <input 
                    type="text" inputMode="numeric" pattern="[0-9]*"
                    value={term}
                    onChange={(e) => setTerm(Number(e.target.value))}
                    onBlur={handleCalculate}
                    className="w-32 px-4 py-2 text-right bg-[#F8FAFC] border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all"
                  />
                </div>
                <input 
                  type="range"
                  min={1}
                  max={120}
                  step={1}
                  value={term}
                  onChange={(e) => setTerm(Number(e.target.value))}
                  onMouseUp={handleCalculate}
                  onTouchEnd={handleCalculate}
                  className="loan-slider"
                  style={{
                    background: `linear-gradient(to right, #7C3AED 0%, #7C3AED ${(term - 1) / (120 - 1) * 100}%, #E2E8F0 ${(term - 1) / (120 - 1) * 100}%, #E2E8F0 100%)`
                  }}
                />
                <div className="flex justify-between text-xs font-medium text-slate-400">
                  <span>1 Ay</span>
                  <span>120 Ay</span>
                </div>
              </div>
            </div>

            <div className="w-full flex justify-center mt-6">
              <div className="w-full max-w-[280px]">
                <CalculatorSubmitButton 
                  onClick={handleCalculate} 
                  isLoading={isLoading} 
                  className="!h-[64px] !text-[24px] [&>img]:!h-[42px] shadow-xl hover:shadow-2xl" 
                />
              </div>
            </div>
          </div>

          {/* RIGHT: Result & Chart */}
          <div className="lg:col-span-5 bg-[#F5F3FF] rounded-[2rem] p-8 relative overflow-hidden flex flex-col h-full border border-[#EDE9FE]">
            {/* Subtle decorative circles */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-violet-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 pointer-events-none"></div>
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-fuchsia-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 pointer-events-none"></div>

            <div className="relative z-10 flex-1 flex flex-col">
              <div className="mb-8">
                <h3 className="text-violet-600 font-semibold text-sm tracking-wider uppercase mb-2">Aylık Taksit Tutarı</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight flex items-baseline">
                    <NumberFlow 
                      value={monthlyPayment}
                      format={{ style: 'currency', currency: 'TRY', maximumFractionDigits: 2 }}
                    />
                  </span>
                </div>
              </div>

              {/* Chart */}
              <div className="flex-1 flex flex-col items-center justify-center min-h-[200px] mb-6">
                <div className="h-[200px] w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: any) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value)}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Center Text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Toplam</span>
                    <span className="text-sm font-bold text-slate-800">
                      {result?.data?.secondaryResults?.['Toplam Ödeme'] || "0"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Summary Items */}
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-violet-100">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#8B5CF6]"></div>
                    <span className="text-sm font-medium text-slate-600">Kredi Tutarı</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900">
                    {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(principal)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-violet-100">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#C4B5FD]"></div>
                    <span className="text-sm font-medium text-slate-600">Toplam Faiz</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900">
                    {result?.data?.secondaryResults?.['Toplam Faiz'] || "0,00 ₺"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-sm font-medium text-slate-600 pl-5">Vade</span>
                  <span className="text-sm font-bold text-slate-900">{term} Ay</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Amortization Table Toggle */}
      {result?.data?.table && (
        <div className="bg-white rounded-[2rem] shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 overflow-hidden">
          <button 
            onClick={() => setShowTable(!showTable)}
            className="w-full px-8 py-6 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-violet-100 text-violet-600 rounded-xl">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M9 3v18"/><path d="M15 3v18"/></svg>
              </div>
              <span className="font-semibold text-slate-800 text-lg">Ödeme Planı (Amortisman Tablosu)</span>
            </div>
            <ChevronDown className={`w-6 h-6 text-slate-400 transition-transform duration-300 ${showTable ? 'rotate-180' : ''}`} />
          </button>
          
          {showTable && (
            <div className="p-6 md:p-8 overflow-x-auto">
              <table className="w-full min-w-[600px] text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50/50">
                  <tr>
                    <th className="px-6 py-4 font-semibold rounded-l-xl">Taksit No</th>
                    <th className="px-6 py-4 font-semibold">Taksit Tutarı</th>
                    <th className="px-6 py-4 font-semibold">Anapara</th>
                    <th className="px-6 py-4 font-semibold">Faiz</th>
                    <th className="px-6 py-4 font-semibold rounded-r-xl">Kalan Bakiye</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {result.data.table.map((row: any, i: number) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">{row['Taksit No']}</td>
                      <td className="px-6 py-4 font-semibold text-violet-600">{row['Taksit Tutarı']}</td>
                      <td className="px-6 py-4 text-slate-600">{row['Anapara']}</td>
                      <td className="px-6 py-4 text-slate-600">{row['Faiz']}</td>
                      <td className="px-6 py-4 text-slate-900 font-medium">{row['Kalan Bakiye']}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    
      {result?.data && <ShareResult calculatorName={calculator.name} slug={calculator.slug} data={result.data} />}
    </div>
  );
}

