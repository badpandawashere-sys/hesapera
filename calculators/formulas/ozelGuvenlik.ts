// Ozel Guvenlik Sinavi Puani
// Kaynak: EGM Ozel Guvenlik Hizmetleri Genelgesi / 2026 Sinav Talimati
//
// Yazili Sinav: 100 soru, her dogru 1 puan. (Yanlislar dogruyu goturmez)
// Silah Bilgisi (Silahli adaylar icin): 25 soru, her dogru 2 puan.
// Uygulamali Atis: 5 atis, her isabet 10 puan.
//
// Basari Sartlari (Silahsiz):
// - Yazili sinavdan en az 60 puan almak.
//
// Basari Sartlari (Silahli):
// - Yazili sinav ile Silah (bilgi + atis) puani toplaminin yarisi en az 60 olacak.
// - Ayrica; yazili sinav en az 50, silah sinavi (bilgi+atis) en az 50 olmali kosulu genel uygulansa da, 
//   EGM yonetmeligine gore: Silah farki sinavina girenlerin silah puani en az 60 olmalidir.
//   Ancak temel silahli egitimde: (Yazili Puan + Silah Puan) / 2 >= 60 kabul edilir. (Yazili 50, Silah 70 = 60 Basarili gibi).

export interface OzelGuvenlikResult {
  yaziliPuani: number;
  silahBilgisiPuani: number;
  atisPuani: number;
  silahSinaviToplami: number;
  genelPuan: number;
  isSuccessful: boolean;
  statusMessage: string;
}

export function calculateOzelGuvenlik(
  isSilahli: boolean,
  yaziliDogru: number,
  silahDogru: number,
  atisIsabet: number
): OzelGuvenlikResult {
  if (yaziliDogru < 0 || yaziliDogru > 100) throw new Error("Yazili dogru sayisi 0-100 araliginda olmalidir.");
  if (isSilahli) {
    if (silahDogru < 0 || silahDogru > 25) throw new Error("Silah bilgisi dogru sayisi 0-25 araliginda olmalidir.");
    if (atisIsabet < 0 || atisIsabet > 5) throw new Error("Atis isabet sayisi 0-5 araliginda olmalidir.");
  }

  const yaziliPuani = yaziliDogru * 1;
  let silahBilgisiPuani = 0;
  let atisPuani = 0;
  let silahSinaviToplami = 0;
  let genelPuan = yaziliPuani;
  let isSuccessful = false;
  let statusMessage = "";

  if (!isSilahli) {
    isSuccessful = yaziliPuani >= 60;
    statusMessage = isSuccessful ? "Basarili" : "Basarisiz (Yazili sinav 60 altinda)";
  } else {
    silahBilgisiPuani = silahDogru * 2;
    atisPuani = atisIsabet * 10;
    silahSinaviToplami = silahBilgisiPuani + atisPuani;
    genelPuan = (yaziliPuani + silahSinaviToplami) / 2;

    if (genelPuan >= 60 && yaziliPuani >= 50 && silahSinaviToplami >= 50) {
      isSuccessful = true;
      statusMessage = "Basarili";
    } else {
      isSuccessful = false;
      statusMessage = "Basarisiz (Ortalama 60 altinda veya baraj puanlari saglanmadi)";
    }
  }

  return {
    yaziliPuani,
    silahBilgisiPuani,
    atisPuani,
    silahSinaviToplami,
    genelPuan,
    isSuccessful,
    statusMessage
  };
}
