'use client';

import { useState, useEffect } from 'react';
import { ShareResult } from './share-result';
import { CalculatorViewModel } from '@/calculators/core/calculator-types';
import { CalculatorResult } from '@/calculators/core/calculator-result';
import { calculateAction } from '@/app/actions/calculate';
import { CalculatorSubmitButton } from './calculator-submit-button';
import { Loader2, Info, CreditCard } from 'lucide-react';
import NumberFlow from '@number-flow/react';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { NumericInput } from '@/components/calculator/numeric-input';

interface CreditCardMinimumPaymentFormProps {
  calculator: CalculatorViewModel;
}

const sliderStyles = `
  .cc-slider {
    -webkit-appearance: none;
    width: 100%;
    height: 6px;
    border-radius: 9999px;
    background: #E2E8F0;
    outline: none;
  }
  .cc-slider::-webkit-slider-thumb {
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
  .cc-slider::-webkit-slider-thumb:hover {
    transform: scale(1.1);
  }
  .cc-slider::-moz-range-thumb {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #fff;
    border: 2px solid #7C3AED;
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(124, 58, 237, 0.3);
    transition: transform 0.1s;
  }
  .cc-slider::-moz-range-thumb:hover {
    transform: scale(1.1);
  }
`;

export function CreditCardMinimumPaymentForm({ calculator }: CreditCardMinimumPaymentFormProps) {
  const [statementBalance, setStatementBalance] = useState<number>(50000);
  const [minimumPaymentRate, setMinimumPaymentRate] = useState<number>(20);

  const [statementBalanceStr, setStatementBalanceStr] = useState<string>("50.000");

  const [result, setResult] = useState<CalculatorResult<any, any> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    handleCalculate();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCalculate = async () => {
    setIsLoading(true);
    try {
      const res = await calculateAction(calculator.slug, {
        statementBalance,
        minimumPaymentRate
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

  let minimumPayment = 0;
  if (result?.data?.primaryResult) {
    minimumPayment = parseFormattedNumber(result.data.primaryResult);
  }

  const handleStatementBalanceInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    if (!val) {
      setStatementBalanceStr("");
      setStatementBalance(0);
      return;
    }
    const num = parseInt(val, 10);
    setStatementBalance(num);
    setStatementBalanceStr(formatThousands(num));
  };

  const handleStatementBalanceSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = Number(e.target.value);
    setStatementBalance(num);
    setStatementBalanceStr(formatThousands(num));
  };

  const remainingBalance = statementBalance - minimumPayment;

  const ringData = [
    { name: 'Asgari Ödeme', value: minimumPaymentRate, color: '#7C3AED' },
    { name: 'Kalan', value: 100 - minimumPaymentRate, color: '#DDD6FE' }
  ];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      <style dangerouslySetInnerHTML={{ __html: sliderStyles }} />
      
      <div className="bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-6 md:p-10 lg:p-12">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          <div className="lg:col-span-7 flex flex-col space-y-10">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2 flex items-center gap-3">
                <CreditCard className="w-6 h-6 text-violet-600" />
                Kredi Kartı Ödeme Detayları
              </h2>
              <p className="text-slate-500">Ekstre borcu ve asgari ödeme oranını belirleyerek minimum ödeme tutarını hesaplayın.</p>
            </div>

            <div className="space-y-10">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-slate-700">Dönem Borcu</label>
                  <div className="relative">
                    <NumericInput isInteger={true}
                      value={statementBalanceStr}
                      onChange={handleStatementBalanceInputChange}
                      onBlur={handleCalculate}
                      className="w-40 px-4 py-2 pr-10 text-right bg-[#F8FAFC] border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium pointer-events-none">TL</span>
                  </div>
                </div>
                <input 
                  type="range"
                  min={1000}
                  max={500000}
                  step={1000}
                  value={statementBalance}
                  onChange={handleStatementBalanceSliderChange}
                  onMouseUp={handleCalculate}
                  onTouchEnd={handleCalculate}
                  className="cc-slider"
                  style={{
                    background: `linear-gradient(to right, #7C3AED 0%, #7C3AED ${(statementBalance - 1000) / (500000 - 1000) * 100}%, #E2E8F0 ${(statementBalance - 1000) / (500000 - 1000) * 100}%, #E2E8F0 100%)`
                  }}
                />
                <div className="flex justify-between text-xs font-medium text-slate-400">
                  <span>1.000 TL</span>
                  <span>500 Bin TL</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-slate-700">Asgari Ödeme Oranı (%)</label>
                  <NumericInput  
                    value={minimumPaymentRate}
                    onChange={(e) => setMinimumPaymentRate(Number(e.target.value))}
                    onBlur={handleCalculate}
                    step={1}
                    className="w-32 px-4 py-2 text-right bg-[#F8FAFC] border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all"
                  />
                </div>
                <input 
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={minimumPaymentRate}
                  onChange={(e) => setMinimumPaymentRate(Number(e.target.value))}
                  onMouseUp={handleCalculate}
                  onTouchEnd={handleCalculate}
                  className="cc-slider"
                  style={{
                    background: `linear-gradient(to right, #7C3AED 0%, #7C3AED ${minimumPaymentRate}%, #E2E8F0 ${minimumPaymentRate}%, #E2E8F0 100%)`
                  }}
                />
                <div className="flex justify-between text-xs font-medium text-slate-400">
                  <span>%0</span>
                  <span>%100</span>
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
              
              <div className="mb-8 text-center">
                <h3 className="text-violet-600 font-semibold text-sm tracking-wider uppercase mb-2">Asgari Ödeme Tutarı</h3>
                <div className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight flex items-baseline justify-center">
                  {isMounted ? (
                    <NumberFlow 
                      value={minimumPayment}
                      format={{ style: 'currency', currency: 'TRY', maximumFractionDigits: 2 }}
                    />
                  ) : (
                    <span>{formatCurrency(minimumPayment)}</span>
                  )}
                </div>
              </div>

              <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/60 mb-8 shadow-sm flex flex-col items-center">
                <h4 className="text-sm font-semibold text-slate-700 mb-4">Ödeme Oranı</h4>
                
                <div className="relative w-40 h-40">
                  {isMounted && (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={ringData}
                          cx="50%"
                          cy="50%"
                          innerRadius="75%"
                          outerRadius="100%"
                          startAngle={90}
                          endAngle={-270}
                          dataKey="value"
                          stroke="none"
                          isAnimationActive={true}
                        >
                          {ringData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-3xl font-bold text-slate-800">%{minimumPaymentRate}</span>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <span className="text-sm text-slate-500 font-medium">Dönem Borcunun %{minimumPaymentRate}'i</span>
                </div>
              </div>

              <div className="space-y-3 mb-6 bg-white/40 backdrop-blur-md rounded-2xl p-5 border border-white/50">
                <div className="flex justify-between items-center pb-2.5 border-b border-violet-100/50">
                  <span className="text-sm font-medium text-slate-500">Dönem Borcu</span>
                  <span className="text-sm font-bold text-slate-900">
                    {formatCurrency(statementBalance)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2.5 border-b border-violet-100/50">
                  <span className="text-sm font-medium text-slate-500">Asgari Ödeme Oranı</span>
                  <span className="text-sm font-bold text-slate-900">
                    %{minimumPaymentRate}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2.5 border-b border-violet-100/50">
                  <span className="text-sm font-medium text-slate-500">Asgari Ödeme Tutarı</span>
                  <span className="text-sm font-bold text-slate-900">
                    {formatCurrency(minimumPayment)}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2.5">
                  <span className="text-sm font-medium text-slate-500">Asgari Ödeme Sonrası Kalan Borç</span>
                  <span className="text-sm font-bold text-slate-900">
                    {formatCurrency(remainingBalance)}
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
    
      {result?.data && <ShareResult calculatorName={calculator.name} slug={calculator.slug} data={result.data} />}
    </div>
  );
}

