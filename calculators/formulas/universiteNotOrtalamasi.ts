// Universite Not Ortalamasi Hesaplama (GANO / GPA)

export interface UniversiteNotOrtalamasiInput {
  hesaplamaSistemi: 'Harf Sistemi' | '100\'lük Sistem' | '4\'lük Sistem';
  dersler: {
    dersAdi?: string;
    kredi: number;
    harfNotu?: string;   // if Harf Sistemi
    sayisalNot?: number; // if 100'lük veya 4'lük
  }[];
}

const HarfNotuTablosu: Record<string, number> = {
  'AA': 4.0,
  'BA': 3.5,
  'BB': 3.0,
  'CB': 2.5,
  'CC': 2.0,
  'DC': 1.5,
  'DD': 1.0,
  'FD': 0.5,
  'FF': 0.0,
  // Bazi universitelerde olabilen A, A-, B+ vs. standart YOK uzerinden gitmeyi deniyoruz
  // Eger gecerli degilse asagida fallback atabiliriz ama dropdown'dan sadece bunlari kabul edecegiz.
};

export function calculateUniversiteNotOrtalamasi(inputs: UniversiteNotOrtalamasiInput) {
  if (!inputs.dersler || inputs.dersler.length === 0) {
    throw new Error("Lütfen en az bir ders giriniz.");
  }

  let toplamKredi = 0;
  let toplamAgirlikliPuan = 0;

  for (const d of inputs.dersler) {
    if (d.kredi <= 0) continue; // Skip 0 credit courses (e.g. Pass/Fail depending on uni, usually non-credit)

    let dersCarpani = 0;

    if (inputs.hesaplamaSistemi === 'Harf Sistemi') {
      if (!d.harfNotu || HarfNotuTablosu[d.harfNotu] === undefined) {
        throw new Error("Harf sistemi seçiliyken geçerli bir harf notu girilmelidir (AA, BA, vb.).");
      }
      dersCarpani = HarfNotuTablosu[d.harfNotu];
    } 
    else if (inputs.hesaplamaSistemi === '4\'lük Sistem') {
      if (d.sayisalNot === undefined || d.sayisalNot < 0 || d.sayisalNot > 4) {
        throw new Error("4'lük sistemde notlar 0 ile 4 arasında olmalıdır.");
      }
      dersCarpani = d.sayisalNot;
    } 
    else if (inputs.hesaplamaSistemi === '100\'lük Sistem') {
      if (d.sayisalNot === undefined || d.sayisalNot < 0 || d.sayisalNot > 100) {
        throw new Error("100'lük sistemde notlar 0 ile 100 arasında olmalıdır.");
      }
      dersCarpani = d.sayisalNot;
    }

    toplamAgirlikliPuan += dersCarpani * d.kredi;
    toplamKredi += d.kredi;
  }

  if (toplamKredi === 0) {
    throw new Error("Hesaplama için geçerli kredi girilmedi (Krediler 0'dan büyük olmalıdır).");
  }

  const gpa = toplamAgirlikliPuan / toplamKredi;

  let sistemLabel = inputs.hesaplamaSistemi === '100\'lük Sistem' ? '100 üzerinden GPA' : '4 üzerinden GPA / GANO';

  return {
    primaryResult: gpa.toFixed(2),
    secondaryResults: {
      "Değerlendirme Sistemi": sistemLabel,
      "Toplam Kredi": toplamKredi.toString(),
      "Hesaba Katılan Ders": inputs.dersler.filter(d => d.kredi > 0).length.toString()
    },
    notes: [
      "Genel Akademik Not Ortalaması (GANO/GPA); ders kredileri ile ders notlarının/harf katsayılarının çarpılıp, toplam krediye bölünmesiyle bulunur.",
      "Üniversitelerin harf notu dönüşüm tabloları (örneğin 90-100 arası AA vb.) ve 100'lük sistemden 4'lük sisteme dönüşüm oranları üniversiteye göre farklılık gösterebilir.",
      inputs.hesaplamaSistemi === 'Harf Sistemi' ? "Bu hesaplamada genel YÖK standart harf değerleri (AA=4.0, BA=3.5, BB=3.0, CB=2.5, CC=2.0, DC=1.5, DD=1.0, FD=0.5, FF=0) kullanılmıştır." : "Girdiğiniz sayısal notlar doğrudan ağırlıklı ortalamaya katılmıştır."
    ]
  };
}
