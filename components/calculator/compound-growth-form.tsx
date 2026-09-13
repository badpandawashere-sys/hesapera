
'use client';

import { useState, useEffect } from 'react';
import { CalculatorViewModel } from '@/calculators/core/calculator-types';
import { calculateAction } from '@/app/actions/calculate';
import { Loader2, Zap, Rocket, ChevronDown, List } from 'lucide-react';
import NumberFlow from '@number-flow/react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export function CompoundGrowthForm({ calculator }: { calculator: CalculatorViewModel }) {
  const [inputs, setInputs] = useState({
    initialValue: 1000,
    growthRate: 15,
    periods: 10
  });
  
  const [res, setRes] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showTable, setShowTable] = useState(false);

  useEffect(() => { setMounted(true); handleCalc(); }, [inputs]); // eslint-disable-line

  const handleCalc = async () => {
    setLoading(true);
    try {
      const resp = await calculateAction(calculator.slug, inputs);
      if (resp.success) setRes(resp);
    } catch(e) {}
    setLoading(false);
  };

  const updateInput = (k: keyof typeof inputs, val: string) => {
    const num = parseFloat(val) || 0;
    if (k === 'initialValue' || k === 'periods') {
      setInputs(prev => ({ ...prev, [k]: Math.max(k==='periods'?1:0, num) }));
    } else {
      setInputs(prev => ({ ...prev, [k]: Math.max(-100, num) }));
    }
  };

  // Helper to parse localized string like "1.234,56" to 1234.56
  const parseNum = (str: any) => {
    if (!str) return 0;
    if (typeof str === 'number') return str;
    const clean = String(str).replace(/[^0-9,-]/g, '').replace(',', '.');
    return parseFloat(clean) || 0;
  };

  const primary = parseNum(res?.data?.primaryResult || '0');
  const multiplier = inputs.initialValue > 0 ? (primary / inputs.initialValue).toFixed(2) : '0.00';
  
  const isPositive = inputs.growthRate >= 0;

  // Process table for charts and display safely (ignoring exact object keys due to encoding)
  const chartData = (res?.data?.table || []).map((row: any) => {
    const vals = Object.values(row);
    // [0]=Dönem, [1]=Start, [2]=Growth, [3]=End
    return {
      period: vals[0],
      start: parseNum(vals[1]),
      growth: parseNum(vals[2]),
      end: parseNum(vals[3]),
      rawEnd: vals[3]
    };
  });

  return (
    <div className="w-full max-w-6xl mx-auto font-sans">
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 p-6 lg:p-10">
        
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Left Column: Inputs */}
          <div className="w-full lg:w-[40%] space-y-8">
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-2xl ${isPositive ? 'bg-fuchsia-100 text-fuchsia-600' : 'bg-slate-100 text-slate-600'}`}>
                <Rocket className="w-6 h-6"/>
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-800">Bileşik Büyüme</h2>
                <p className="text-sm font-medium text-slate-500">Zaman içindeki kartopu etkisini (Snowball) keşfedin</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-3 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Başlangıç Değeri</label>
                <input type="number" value={inputs.initialValue||''} onChange={e=>updateInput('initialValue', e.target.value)} className="w-full text-xl font-bold bg-white border border-slate-200 p-3 rounded-xl focus:ring-2 ring-fuchsia-500 outline-none transition-all" />
              </div>

              <div className="space-y-3 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Dönem (Süre)</label>
                  <span className="text-sm font-bold text-slate-700">{inputs.periods}</span>
                </div>
                <input type="range" min="1" max="100" step="1" value={inputs.periods} onChange={e=>updateInput('periods', e.target.value)} className="w-full accent-fuchsia-500" />
              </div>

              <div className="space-y-3 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Büyüme Oranı (%)</label>
                  <span className={`text-sm font-bold ${isPositive ? 'text-fuchsia-600' : 'text-red-500'}`}>{inputs.growthRate}%</span>
                </div>
                <input type="number" value={inputs.growthRate||''} onChange={e=>updateInput('growthRate', e.target.value)} className="w-full text-xl font-bold bg-white border border-slate-200 p-3 rounded-xl focus:ring-2 ring-fuchsia-500 outline-none transition-all" />
              </div>
            </div>
          </div>

          {/* Right Column: Visualizer */}
          <div className="w-full lg:w-[60%] flex flex-col gap-6">
            
            {/* Result Card */}
            <div className={`rounded-[2rem] p-8 md:p-10 relative overflow-hidden shadow-lg border ${isPositive ? 'bg-fuchsia-950 border-fuchsia-900 text-white' : 'bg-slate-900 border-slate-800 text-white'}`}>
              <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 ${isPositive ? 'bg-fuchsia-500/20' : 'bg-slate-500/20'}`}></div>
              
              <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                     <h3 className={`font-bold tracking-widest text-xs uppercase ${isPositive ? 'text-fuchsia-300' : 'text-slate-400'}`}>Gelecekteki Toplam Değer</h3>
                     {loading && <Loader2 className="w-4 h-4 animate-spin text-white/50" />}
                  </div>
                  <div className="text-5xl md:text-6xl font-black tabular-nums tracking-tight drop-shadow-md">
                    {mounted ? <NumberFlow value={primary} format={{minimumFractionDigits:0, maximumFractionDigits:2}} /> : '0'}
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/5 min-w-[120px]">
                  <div className="text-[10px] font-bold text-white/60 uppercase tracking-wider mb-1">X Çarpanı</div>
                  <div className={`text-2xl font-black ${isPositive ? 'text-fuchsia-200' : 'text-white'}`}>x{multiplier}</div>
                </div>
              </div>
            </div>

            {/* Growth Chart */}
            <div className="flex-1 bg-slate-50 rounded-[2rem] border border-slate-100 p-6 min-h-[250px] relative">
              {mounted && chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={isPositive ? '#d946ef' : '#64748b'} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={isPositive ? '#d946ef' : '#64748b'} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="period" tickLine={false} axisLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                    <YAxis tickFormatter={(v)=>v >= 1000 ? (v/1000).toFixed(0)+'k' : v} tickLine={false} axisLine={false} tick={{fill: '#94a3b8', fontSize: 12}} width={45} />
                    <Tooltip 
                      contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                      labelStyle={{fontWeight: 'bold', color: '#64748b'}}
                      formatter={(val: any) => [Number(val).toLocaleString('tr-TR', {maximumFractionDigits: 2}), 'Değer']}
                    />
                    <Area type="monotone" dataKey="end" stroke={isPositive ? '#c026d3' : '#475569'} strokeWidth={3} fillOpacity={1} fill="url(#colorGrowth)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                   <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Breakdown Table Toggle */}
        <div className="mt-8 pt-8 border-t border-slate-100">
          <button onClick={() => setShowTable(!showTable)} className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors rounded-2xl text-slate-700 font-bold">
            <span className="flex items-center gap-2"><List className="w-5 h-5"/> Dönem Bazlı Detay Tablosu</span>
            <ChevronDown className={`w-5 h-5 transition-transform ${showTable ? 'rotate-180' : ''}`} />
          </button>
          
          {showTable && res?.data?.table && (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-100 text-slate-600 font-bold">
                  <tr>
                    <th className="p-4 rounded-tl-xl">Dönem</th>
                    <th className="p-4">Dönem Başı</th>
                    <th className="p-4">Büyüme</th>
                    <th className="p-4 rounded-tr-xl">Dönem Sonu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(res.data.table as any[]).map((row, i) => {
                    const vals = Object.values(row);
                    return (
                      <tr key={i} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 font-bold text-slate-700">{vals[0] as string}</td>
                        <td className="p-4 font-medium text-slate-600">{vals[1] as string}</td>
                        <td className={`p-4 font-bold ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>{vals[2] as string}</td>
                        <td className="p-4 font-bold text-slate-900">{vals[3] as string}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
