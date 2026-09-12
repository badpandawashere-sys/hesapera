// YKS Puan Hesaplama (TYT, SAY, EA, SOZ, DIL)
// Kaynak: OSYM 2026 YKS Kilavuzu
//
// Yaklasik standart sapmasiz veya statik katsayili tahmin formulleri
// Taban: 100

import { calculateNet, validateExamInputs } from "./exams/core";
import { calculateObp } from "./obp";

export interface YksInput {
  puanTuru: 'TYT' | 'SAY' | 'EA' | 'SOZ' | 'DIL';
  // TYT
  tytTurkceC: number; tytTurkceW: number;
  tytSosyalC: number; tytSosyalW: number;
  tytMatC: number; tytMatW: number;
  tytFenC: number; tytFenW: number;
  // AYT
  aytMatC: number; aytMatW: number;
  aytFizikC: number; aytFizikW: number;
  aytKimyaC: number; aytKimyaW: number;
  aytBiyoC: number; aytBiyoW: number;
  aytEdebiyatC: number; aytEdebiyatW: number;
  aytTarih1C: number; aytTarih1W: number;
  aytCografya1C: number; aytCografya1W: number;
  aytTarih2C: number; aytTarih2W: number;
  aytCografya2C: number; aytCografya2W: number;
  aytFelsefeC: number; aytFelsefeW: number;
  aytDinC: number; aytDinW: number;
  // YDT
  ydtDilC: number; ydtDilW: number;
  // OBP
  diplomaNotu?: number;
  isKirikObp?: boolean;
}

export function calculateYks(inputs: YksInput) {
  const penalty = 0.25;

  // 1) TYT Hesapla
  const tTurkNet = calculateNet(inputs.tytTurkceC, inputs.tytTurkceW, penalty);
  const tSosNet = calculateNet(inputs.tytSosyalC, inputs.tytSosyalW, penalty);
  const tMatNet = calculateNet(inputs.tytMatC, inputs.tytMatW, penalty);
  const tFenNet = calculateNet(inputs.tytFenC, inputs.tytFenW, penalty);
  
  // Yaklasik TYT Katkisi
  const tytScore = 100 + (tTurkNet * 3.3) + (tSosNet * 3.4) + (tMatNet * 3.3) + (tFenNet * 3.4);

  // TYT yerlestirme puani (Y-TYT) sadece TYT hesaplanirken gosterilecek
  let yerlestirmePuani = 0;
  let sinavPuani = tytScore;

  let secondary: Record<string, string> = {
    "Yaklaşık TYT Puanı": Math.max(100, tytScore).toFixed(3)
  };

  const aMatNet = calculateNet(inputs.aytMatC, inputs.aytMatW, penalty);
  const aFizNet = calculateNet(inputs.aytFizikC, inputs.aytFizikW, penalty);
  const aKimNet = calculateNet(inputs.aytKimyaC, inputs.aytKimyaW, penalty);
  const aBiyoNet = calculateNet(inputs.aytBiyoC, inputs.aytBiyoW, penalty);
  
  const aEdebiyatNet = calculateNet(inputs.aytEdebiyatC, inputs.aytEdebiyatW, penalty);
  const aTarih1Net = calculateNet(inputs.aytTarih1C, inputs.aytTarih1W, penalty);
  const aCog1Net = calculateNet(inputs.aytCografya1C, inputs.aytCografya1W, penalty);
  
  const aTarih2Net = calculateNet(inputs.aytTarih2C, inputs.aytTarih2W, penalty);
  const aCog2Net = calculateNet(inputs.aytCografya2C, inputs.aytCografya2W, penalty);
  const aFelsefeNet = calculateNet(inputs.aytFelsefeC, inputs.aytFelsefeW, penalty);
  const aDinNet = calculateNet(inputs.aytDinC, inputs.aytDinW, penalty);

  const ydtNet = calculateNet(inputs.ydtDilC, inputs.ydtDilW, penalty);

  // YKS Puaninda TYT'nin etkisi (Tum alanlar icin ayni sayilir: T*1.32, S*1.36, vb. ama genel kabaca TYT Puaninin uzerine eklenmez, ham netler uzerinden carpilir. 
  // Taban puan 100.
  // TYT Katkisi (Alan Puanina) ~ TYT netleri * (yaklasik 1.33)
  const alanTytKatkisi = (tTurkNet * 1.32) + (tSosNet * 1.36) + (tMatNet * 1.32) + (tFenNet * 1.36);

  if (inputs.puanTuru === 'SAY') {
    // SAY = Taban(100) + TYT Katki + (AYT Mat*3.0 + Fiz*2.85 + Kim*3.07 + Biyo*3.07)
    sinavPuani = 100 + alanTytKatkisi + (aMatNet * 3.0) + (aFizNet * 2.85) + (aKimNet * 3.07) + (aBiyoNet * 3.07);
    secondary["SAY Puanı"] = Math.max(100, sinavPuani).toFixed(3);
    secondary["AYT Matematik Net"] = aMatNet.toFixed(2);
    secondary["AYT Fen Toplam Net"] = (aFizNet + aKimNet + aBiyoNet).toFixed(2);
  } 
  else if (inputs.puanTuru === 'EA') {
    // EA = Taban(100) + TYT Katki + (AYT Mat*3.0 + Edebiyat*3.0 + Tar1*2.8 + Cog1*3.3)
    sinavPuani = 100 + alanTytKatkisi + (aMatNet * 3.0) + (aEdebiyatNet * 3.0) + (aTarih1Net * 2.8) + (aCog1Net * 3.33);
    secondary["EA Puanı"] = Math.max(100, sinavPuani).toFixed(3);
    secondary["AYT Matematik Net"] = aMatNet.toFixed(2);
    secondary["Edebiyat-Sosyal-1 Net"] = (aEdebiyatNet + aTarih1Net + aCog1Net).toFixed(2);
  }
  else if (inputs.puanTuru === 'SOZ') {
    // SOZ = Taban(100) + TYT Katki + (Edebiyat*3.0 + Tar1*2.8 + Cog1*3.3 + Tar2*2.9 + Cog2*2.9 + Felsefe*3.0 + Din*3.3)
    sinavPuani = 100 + alanTytKatkisi + (aEdebiyatNet * 3.0) + (aTarih1Net * 2.8) + (aCog1Net * 3.33) + 
      (aTarih2Net * 2.91) + (aCog2Net * 2.91) + (aFelsefeNet * 3.0) + (aDinNet * 3.33);
    secondary["SÖZ Puanı"] = Math.max(100, sinavPuani).toFixed(3);
    secondary["Edebiyat-Sosyal-1 Net"] = (aEdebiyatNet + aTarih1Net + aCog1Net).toFixed(2);
    secondary["Sosyal-2 Net"] = (aTarih2Net + aCog2Net + aFelsefeNet + aDinNet).toFixed(2);
  }
  else if (inputs.puanTuru === 'DIL') {
    // DIL = Taban(100) + TYT Katki + (YDT Dil*3.0)
    sinavPuani = 100 + alanTytKatkisi + (ydtNet * 3.0);
    secondary["DİL Puanı"] = Math.max(100, sinavPuani).toFixed(3);
    secondary["YDT Net"] = ydtNet.toFixed(2);
  }

  // OBP
  if (inputs.diplomaNotu && inputs.diplomaNotu >= 50 && inputs.diplomaNotu <= 100) {
    const obpResult = calculateObp(inputs.diplomaNotu);
    const obpPoints = inputs.isKirikObp ? obpResult.kirikcContribution : obpResult.normalContribution;
    
    yerlestirmePuani = Math.max(100, sinavPuani) + obpPoints;
    secondary["OBP Katkısı"] = `+${obpPoints.toFixed(2)}`;
    secondary["Yerleştirme Puanı (Y-YKS)"] = yerlestirmePuani.toFixed(3);
  }

  return {
    primaryResult: Math.max(100, sinavPuani).toFixed(3),
    secondaryResults: secondary,
    notes: [
      "OSYM 2026-YKS yerleştirme kılavuzu ağırlıklarına göre yaklaşık bir hesaplamadır.",
      "Standart sapma her yıl değiştiği için gerçek sonucunuzda ufak farklılıklar olabilir.",
      "OBP bilgisi girdiyseniz yerleştirme puanınızı 'Yerleştirme Puanı (Y-YKS)' satırında görebilirsiniz."
    ]
  };
}
