'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Info, AlertCircle, CheckCircle2 } from 'lucide-react';
import { calculateAction } from '@/app/actions/calculate';

export default function MsuForm({ calculator }: { calculator: any }) {
  const [turkceC, setTurkceC] = useState<string>('');
  const [turkceW, setTurkceW] = useState<string>('');
  const [sosyalC, setSosyalC] = useState<string>('');
  const [sosyalW, setSosyalW] = useState<string>('');
  const [matematikC, setMatematikC] = useState<string>('');
  const [matematikW, setMatematikW] = useState<string>('');
  const [fenC, setFenC] = useState<string>('');
  const [fenW, setFenW] = useState<string>('');
  const [felsefeExempt, setFelsefeExempt] = useState('false');

  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [activeTab, setActiveTab] = useState('SAY');

  const handleCalculate = async () => {
    setError(null);
    setIsPending(true);
    try {
      const tc = parseInt(turkceC || '0', 10);
      const tw = parseInt(turkceW || '0', 10);
      const sc = parseInt(sosyalC || '0', 10);
      const sw = parseInt(sosyalW || '0', 10);
      const mc = parseInt(matematikC || '0', 10);
      const mw = parseInt(matematikW || '0', 10);
      const fc = parseInt(fenC || '0', 10);
      const fw = parseInt(fenW || '0', 10);

      const res = await calculateAction(calculator.slug, {
        turkceCorrect: tc, turkceWrong: tw,
        sosyalCorrect: sc, sosyalWrong: sw,
        matematikCorrect: mc, matematikWrong: mw,
        fenCorrect: fc, fenWrong: fw,
        felsefeExempt: felsefeExempt === 'true'
      });

      if (res.errors && res.errors.length > 0) {
        setError(res.errors[0]);
        setResult(null);
      } else if (!res.success) {
        setError('Hesaplama başarısız oldu.');
        setResult(null);
      } else {
        setResult(res.data?.primaryResult);
      }
    } catch (err: any) {
      setError(err.message || 'Hesaplama sirasinda bir hata olustu.');
    } finally {
      setIsPending(false);
    }
  };

  const TestCard = ({ title, c, w, setC, setW, max }: any) => (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
        <CardDescription>{max} Soru</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4">
          <div className="flex-1 space-y-2">
            <Label>Doğru</Label>
            <Input type="number" min="0" max={max} value={c} onChange={(e) => setC(e.target.value)} placeholder="0" />
          </div>
          <div className="flex-1 space-y-2">
            <Label>Yanlış</Label>
            <Input type="number" min="0" max={max} value={w} onChange={(e) => setW(e.target.value)} placeholder="0" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TestCard title="Türkçe" max={40} c={turkceC} w={turkceW} setC={setTurkceC} setW={setTurkceW} />
        <TestCard title="Temel Matematik" max={40} c={matematikC} w={matematikW} setC={setMatematikC} setW={setMatematikW} />
        <Card className="shadow-sm border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Sosyal Bilimler</CardTitle>
            <CardDescription>20 Soru</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Sosyal Bilimler Soru Grubu</Label>
              <Select value={felsefeExempt} onValueChange={(v) => setFelsefeExempt(v || 'false')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="false">Din Kültürü sorularını cevapladım</SelectItem>
                  <SelectItem value="true">İlave Felsefe sorularını cevapladım</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-4">
              <div className="flex-1 space-y-2">
                <Label>Doğru</Label>
                <Input type="number" min="0" max={20} value={sosyalC} onChange={(e) => setSosyalC(e.target.value)} placeholder="0" />
              </div>
              <div className="flex-1 space-y-2">
                <Label>Yanlış</Label>
                <Input type="number" min="0" max={20} value={sosyalW} onChange={(e) => setSosyalW(e.target.value)} placeholder="0" />
              </div>
            </div>
          </CardContent>
        </Card>
        <TestCard title="Fen Bilimleri" max={20} c={fenC} w={fenW} setC={setFenC} setW={setFenW} />
      </div>

      {error && (
        <div className="p-4 border border-red-500 bg-red-50 text-red-700 rounded-md flex items-start gap-2">
          <AlertCircle className="h-5 w-5 mt-0.5" />
          <div>
            <h4 className="font-semibold">Hata</h4>
            <p>{error}</p>
          </div>
        </div>
      )}

      <Button onClick={handleCalculate} disabled={isPending} className="w-full text-lg h-12" size="lg">
        {isPending ? 'Hesaplanıyor...' : 'Netleri Hesapla'}
      </Button>

      {result ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="border-2 border-primary/20">
            <CardHeader className="bg-primary/5 pb-4 border-b">
              <CardTitle className="flex items-center gap-2 text-xl text-primary">
                <CheckCircle2 className="h-6 w-6" /> MSÜ Net Sonucu
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <div className="p-4 bg-muted/50 rounded-lg text-center flex flex-col justify-center border">
                  <div className="text-sm font-medium text-muted-foreground mb-1">Türkçe</div>
                  <div className="text-2xl font-bold">{result.nets.turkce.toFixed(2)}</div>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg text-center flex flex-col justify-center border">
                  <div className="text-sm font-medium text-muted-foreground mb-1">Sosyal</div>
                  <div className="text-2xl font-bold">{result.nets.sosyal.toFixed(2)}</div>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg text-center flex flex-col justify-center border">
                  <div className="text-sm font-medium text-muted-foreground mb-1">Matematik</div>
                  <div className="text-2xl font-bold">{result.nets.matematik.toFixed(2)}</div>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg text-center flex flex-col justify-center border">
                  <div className="text-sm font-medium text-muted-foreground mb-1">Fen</div>
                  <div className="text-2xl font-bold">{result.nets.fen.toFixed(2)}</div>
                </div>
                <div className="p-4 bg-primary/10 rounded-lg text-center flex flex-col justify-center border border-primary/20 col-span-2 md:col-span-1">
                  <div className="text-sm font-medium text-primary mb-1">Toplam Net</div>
                  <div className="text-3xl font-bold text-primary">{result.nets.total.toFixed(2)}</div>
                </div>
              </div>

              {!result.isEligible ? (
                <div className="mb-6 p-4 border border-red-500/50 bg-red-500/10 text-red-600/90 rounded-md flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-red-700">Puan Hesaplama Uygunluğu: Başarısız</h4>
                    <p>ÖSYM kurallarına göre ağırlıklı puanlarınızın hesaplanabilmesi için Türkçe veya Temel Matematik testlerinin en az birinden 0,5 veya daha fazla ham puan (net) almış olmanız gerekir.</p>
                  </div>
                </div>
              ) : (
                <div className="mb-6 p-4 border border-green-500/50 bg-green-500/10 text-green-800 rounded-md flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Puan Hesaplama Uygunluğu: Başarılı</h4>
                    <p>0,5 ham puan şartını sağladığınız için MSÜ ağırlıklı puanlarınız ÖSYM tarafından hesaplanacaktır.</p>
                  </div>
                </div>
              )}
              
              {result.estimatedScores && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Info className="h-5 w-5 text-blue-500" /> Tahmini Puanlar
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="p-4 bg-muted/30 rounded-lg border flex flex-col justify-between">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold">MSÜ-SAYISAL (SA)</span>
                        <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full font-medium">Tahmini Puan</span>
                      </div>
                      <div className="text-3xl font-bold text-primary">{result.estimatedScores.SAY.toFixed(5)}</div>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-lg border flex flex-col justify-between">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold">MSÜ-SÖZEL (SÖ)</span>
                        <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full font-medium">Tahmini Puan</span>
                      </div>
                      <div className="text-3xl font-bold text-primary">{result.estimatedScores.SOZ.toFixed(5)}</div>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-lg border flex flex-col justify-between">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold">MSÜ-EŞİT AĞIRLIK (EA)</span>
                        <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full font-medium">Tahmini Puan</span>
                      </div>
                      <div className="text-3xl font-bold text-primary">{result.estimatedScores.EA.toFixed(5)}</div>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-lg border flex flex-col justify-between">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold">MSÜ-GENEL (GN)</span>
                        <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full font-medium">Tahmini Puan</span>
                      </div>
                      <div className="text-3xl font-bold text-primary">{result.estimatedScores.GENEL.toFixed(5)}</div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-md text-sm mt-4 mb-8">
                    <p className="font-semibold mb-1">Önemli Uyarı:</p>
                    <p>
                      Netleriniz doğru ve yanlış sayılarına göre kesin olarak hesaplanır. MSÜ puanları ise ÖSYM'nin aday kitlesine bağlı standartlaştırma verileri kamuya tam olarak açıklanmadığı için geçmiş sınav sonuçlarıyla kalibre edilmiş tahmini değerlerdir. Kesin puan ÖSYM sonuç belgesidir.
                    </p>
                  </div>
                </div>
              )}
              
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Info className="h-5 w-5 text-blue-500" /> ÖSYM Puan Türü Ağırlıkları
                </h3>
                <div className="w-full">
                  <div className="grid w-full grid-cols-4 bg-muted rounded-md p-1 mb-2">
                    {['SAY', 'EA', 'SOZ', 'GENEL'].map(tab => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`py-1.5 px-3 text-sm font-medium rounded-sm transition-all ${activeTab === tab ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:bg-muted-foreground/10'}`}
                      >
                        {tab === 'SAY' ? 'MSÜ-SA' : tab === 'EA' ? 'MSÜ-EA' : tab === 'SOZ' ? 'MSÜ-SÖ' : 'MSÜ-GN'}
                      </button>
                    ))}
                  </div>
                  
                  {Object.entries(result.weightsInfo).map(([key, w]: any) => (
                    <div key={key} className={`p-4 bg-muted/30 rounded-lg border mt-2 ${activeTab === key ? 'block' : 'hidden'}`}>
                      <div className="grid grid-cols-4 gap-2 text-center text-sm font-medium mb-2">
                        <div>Türkçe<br/><span className="text-lg font-bold text-primary">%{w.turkce}</span></div>
                        <div>Matematik<br/><span className="text-lg font-bold text-primary">%{w.matematik}</span></div>
                        <div>Fen<br/><span className="text-lg font-bold text-primary">%{w.fen}</span></div>
                        <div>Sosyal<br/><span className="text-lg font-bold text-primary">%{w.sosyal}</span></div>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-4 text-center">
                  Uyarı: Bu ağırlıklar ham netlere değil, sınava giren tüm adayların ortalama ve standart sapmaları kullanılarak elde edilen ÖSYM Standart Puanlarına uygulanır. Bu nedenle yalnızca net sayılarından kesin veya tahmini bir MSÜ puanı hesaplanamaz.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="p-4 border border-dashed rounded-md bg-muted/50 flex items-start gap-3">
          <Info className="h-5 w-5 mt-0.5 text-muted-foreground" />
          <div>
            <h4 className="font-semibold">Bilgi</h4>
            <p className="text-muted-foreground">Doğru ve yanlış sayılarını girerek MSÜ netlerinizi hesaplayın.</p>
          </div>
        </div>
      )}
    </div>
  );
}
