'use client';

import { CalculatorSubmitButton } from './calculator-submit-button';
import { useState, useEffect } from 'react';
import { ShareResult } from './share-result';
import { CalculatorViewModel } from '@/calculators/core/calculator-types';
import { CalculatorResult } from '@/calculators/core/calculator-result';
import { calculateAction } from '@/app/actions/calculate';
import { ChevronDown, Loader2, Info, RefreshCw } from 'lucide-react';
import NumberFlow from '@number-flow/react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, CartesianGrid } from 'recharts';
import { NumericInput } from '@/components/calculator/numeric-input';

interface LoanRestructuringFormProps {
  calculator: CalculatorViewModel;
}

const sliderStyles = `
  .lr-slider {
    -webkit-appearance: none;
    width: 100%;
    height: 6px;
    border-radius: 9999px;
    background: #E2E8F0;
    outline: none;
  }
  .lr-slider::-webkit-slider-thumb {
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
  .lr-slider::-webkit-slider-thumb:hover {
    transform: scale(1.1);
  }
  .lr-slider::-moz-range-thumb {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #fff;
    border: 2px solid #7C3AED;
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(124, 58, 237, 0.3);
    transition: transform 0.1s;
  }
  .lr-slider::-moz-range-thumb:hover {
    transform: scale(1.1);
  }
`;

export function LoanRestructuringForm({ calculator }: LoanRestructuringFormProps) {
  const [remainingPrincipal, setRemainingPrincipal] = useState<number>(100000);
  const [newMonthlyInterestRate, setNewMonthlyInterestRate] = useState<number>(3.50);
  const [newTermMonths, setNewTermMonths] = useState<number>(36);

  const [remainingPrincipalStr, setRemainingPrincipalStr] = useState<string>("100.000");

  const [result, setResult] = useState<CalculatorResult<any, any> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    handleCalculate();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCalculate = async () => {
    setIsLoading(true);
    try {
      const res = await calculateAction(calculator.slug, {
        remainingPrincipal,
        newMonthlyInterestRate,
        newTermMonths
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

  const parseFormattedNumber = (str: string) => {
    if (!str) return 0;
    const cleaned = str.replace(/[^0-9,-]/g, '').replace(',', '.');
    return parseFloat(cleaned) || 0;
  };

  const formatThousands = (num: number) => new Intl.NumberFormat('tr-TR').format(num);
  const formatCurrency = (num: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(num);

  let newMonthlyPayment = 0;
  let totalPayment = 0;
  
  if (result?.data?.primaryResult) {
    newMonthlyPayment = parseFormattedNumber(result.data.primaryResult);
  }
  if (result?.data?.secondaryResults?.['Toplam Ödeme']) {
    totalPayment = parseFormattedNumber(result.data.secondaryResults['Toplam Ödeme']);
  }

  const handlePrincipalInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    if (!val) {
      setRemainingPrincipalStr("");
      setRemainingPrincipal(0);
      return;
    }
    const num = parseInt(val, 10);
    setRemainingPrincipal(num);
    setRemainingPrincipalStr(formatThousands(num));
  };

  const handlePrincipalSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = Number(e.target.value);
    setRemainingPrincipal(num);
    setRemainingPrincipalStr(formatThousands(num));
  };

  const chartData = [
    { name: 'Mevcut Anapara', value: remainingPrincipal, color: '#C4B5FD' },
    { name: 'Toplam Geri Ödeme', value: totalPayment, color: '#7C3AED' }
  ];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      <style dangerouslySetInnerHTML={{ __html: sliderStyles }} />
      
      <div className="bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-6 md:p-10 lg:p-12">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          <div className="lg:col-span-7 flex flex-col space-y-10">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2 flex items-center gap-3">
                <RefreshCw className="w-6 h-6 text-violet-600" />
                Kredi Yapılandırma
              </h2>
              <p className="text-slate-500">Mevcut borcunuzu yeni faiz ve vade ile güncelleyerek yeni ödeme planınızı oluşturun.</p>
            </div>

            <div className="space-y-10">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-slate-700">Mevcut Bakiye</label>
                  <div className="relative">
                    <NumericInput isInteger={true}
                      value={remainingPrincipalStr}
                      onChange={handlePrincipalInputChange}
                      onBlur={handleCalculate}
                      className="w-40 px-4 py-2 pr-10 text-right bg-[#F8FAFC] border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium pointer-events-none">TL</span>
                  </div>
                </div>
                <input 
                  type="range"
                  min={1000}
                  max={5000000}
                  step={1000}
                  value={remainingPrincipal}
                  onChange={handlePrincipalSliderChange}
                  onMouseUp={handleCalculate}
                  onTouchEnd={handleCalculate}
                  className="lr-slider"
                  style={{
                    background: `linear-gradient(to right, #7C3AED 0%, #7C3AED ${(remainingPrincipal - 1000) / (5000000 - 1000) * 100}%, #E2E8F0 ${(remainingPrincipal - 1000) / (5000000 - 1000) * 100}%, #E2E8F0 100%)`
                  }}
                />
                <div className="flex justify-between text-xs font-medium text-slate-400">
                  <span>1.000 TL</span>
                  <span>5 Milyon TL</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-slate-700">Yeni Aylık Faiz Oranı (%)</label>
                  <NumericInput  
                    value={newMonthlyInterestRate}
                    onChange={(e) => setNewMonthlyInterestRate(Number(e.target.value))}
                    onBlur={handleCalculate}
                    step={0.01}
                    className="w-32 px-4 py-2 text-right bg-[#F8FAFC] border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all"
                  />
                </div>
                <input 
                  type="range"
                  min={0.1}
                  max={10.0}
                  step={0.01}
                  value={newMonthlyInterestRate}
                  onChange={(e) => setNewMonthlyInterestRate(Number(e.target.value))}
                  onMouseUp={handleCalculate}
                  onTouchEnd={handleCalculate}
                  className="lr-slider"
                  style={{
                    background: `linear-gradient(to right, #7C3AED 0%, #7C3AED ${(newMonthlyInterestRate - 0.1) / (10 - 0.1) * 100}%, #E2E8F0 ${(newMonthlyInterestRate - 0.1) / (10 - 0.1) * 100}%, #E2E8F0 100%)`
                  }}
                />
                <div className="flex justify-between text-xs font-medium text-slate-400">
                  <span>%0.10</span>
                  <span>%10.00</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-slate-700">Yeni Vade (Ay)</label>
                  <NumericInput  
                    value={newTermMonths}
                    onChange={(e) => setNewTermMonths(Number(e.target.value))}
                    onBlur={handleCalculate}
                    className="w-32 px-4 py-2 text-right bg-[#F8FAFC] border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all"
                  />
                </div>
                <input 
                  type="range"
                  min={1}
                  max={360}
                  step={1}
                  value={newTermMonths}
                  onChange={(e) => setNewTermMonths(Number(e.target.value))}
                  onMouseUp={handleCalculate}
                  onTouchEnd={handleCalculate}
                  className="lr-slider"
                  style={{
                    background: `linear-gradient(to right, #7C3AED 0%, #7C3AED ${(newTermMonths - 1) / (360 - 1) * 100}%, #E2E8F0 ${(newTermMonths - 1) / (360 - 1) * 100}%, #E2E8F0 100%)`
                  }}
                />
                <div className="flex justify-between text-xs font-medium text-slate-400">
                  <span>1 Ay</span>
                  <span>360 Ay</span>
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

          <div className="lg:col-span-5 bg-[#F5F3FF] rounded-[2rem] p-8 relative overflow-hidden flex flex-col h-full border border-[#EDE9FE]">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-violet-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 pointer-events-none"></div>
            
            <div className="relative z-10 flex-1 flex flex-col">
              
              <div className="mb-6 text-center">
                <h3 className="text-violet-600 font-semibold text-sm tracking-wider uppercase mb-2">Yeni Aylık Taksit</h3>
                <div className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight flex items-baseline justify-center">
                  {isMounted ? (
                    <NumberFlow 
                      value={newMonthlyPayment}
                      format={{ style: 'currency', currency: 'TRY', maximumFractionDigits: 2 }}
                    />
                  ) : (
                    <span>{formatCurrency(newMonthlyPayment)}</span>
                  )}
                </div>
              </div>

              <div className="bg-white/50 backdrop-blur-sm rounded-2xl pt-6 pb-2 px-4 border border-white/60 mb-6 shadow-sm flex flex-col">
                <h4 className="text-sm font-semibold text-slate-700 mb-2 text-center">Maliyet Karşılaştırması</h4>
                <p className="text-[11px] text-slate-500 text-center mb-6 leading-relaxed px-2">
                  Mevcut borcunuzu şimdi kapatmanız gereken anapara ile yapılandırma sonunda oluşan toplam geri ödeme arasındaki farkı gösterir.
                </p>
                
                <div className="w-full h-48">
                  {isMounted && (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EDE9FE" />
                        <XAxis 
                          dataKey="name" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 11, fill: '#64748B', fontWeight: 500 }} 
                          dy={10} 
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 11, fill: '#94A3B8' }} 
                          tickFormatter={(val) => `${(val/1000)}B`}
                        />
                        <Tooltip 
                          formatter={(value: any, name: any) => [formatCurrency(Number(value)), 'Tutar']}
                          cursor={{ fill: '#F5F3FF' }}
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontWeight: 600, fontSize: '13px' }}
                          labelStyle={{ color: '#64748B', marginBottom: '4px' }}
                        />
                        <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={45} isAnimationActive={true}>
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              <div className="space-y-3 mb-6 bg-white/40 backdrop-blur-md rounded-2xl p-5 border border-white/50">
                <div className="flex justify-between items-center pb-2.5 border-b border-violet-100/50">
                  <span className="text-sm font-medium text-slate-500">Yapılandırılan Borç</span>
                  <span className="text-sm font-bold text-slate-900">
                    {result?.data?.secondaryResults?.['Yapılandırılan Borç'] || "0,00 ₺"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2.5 border-b border-violet-100/50">
                  <span className="text-sm font-medium text-slate-500">Yeni Toplam Faiz</span>
                  <span className="text-sm font-bold text-slate-900">
                    {result?.data?.secondaryResults?.['Toplam Faiz'] || "0,00 ₺"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2.5 border-b border-violet-100/50">
                  <span className="text-sm font-medium text-slate-500">Yeni Toplam Ödeme</span>
                  <span className="text-sm font-bold text-slate-900">
                    {result?.data?.secondaryResults?.['Toplam Ödeme'] || "0,00 ₺"}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2.5">
                  <span className="text-sm font-medium text-slate-500">Yeni Vade</span>
                  <span className="text-sm font-bold text-slate-900">
                    {newTermMonths} Ay
                  </span>
                </div>
              </div>

              {result?.data?.infoReference && (
                <div className="mt-auto flex items-start gap-3 bg-blue-50/70 backdrop-blur-sm border border-blue-100/50 p-4 rounded-2xl text-blue-800">
                  <Info className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-semibold text-sm">{result.data.infoReference.title}</h5>
                    <p className="text-xs mt-1 leading-relaxed opacity-90">{result.data.infoReference.description}</p>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      {result?.data?.table && (
        <div className="bg-white rounded-[2rem] shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 overflow-hidden">
          <button 
            onClick={() => setShowTable(!showTable)}
            className="w-full px-6 md:px-8 py-5 md:py-6 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-violet-100 text-violet-600 rounded-xl">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M9 3v18"/><path d="M15 3v18"/></svg>
              </div>
              <span className="font-semibold text-slate-800 text-base md:text-lg">Yeni Ödeme Planı (Amortisman Tablosu)</span>
            </div>
            <ChevronDown className={`w-6 h-6 text-slate-400 transition-transform duration-300 ${showTable ? 'rotate-180' : ''}`} />
          </button>
          
          {showTable && (
            <div className="p-4 md:p-8 overflow-x-auto">
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



