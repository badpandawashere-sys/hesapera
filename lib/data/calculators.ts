export interface CalculatorMockData {
  id: string;
  title: string;
  category: string;
  desc: string;
  href: string;
  isPopular?: boolean;
  isFeatured?: boolean;
  isReal?: boolean;
}

export const mockCalculators: CalculatorMockData[] = [
  { 
    id: 'yuzde-hesaplama',
    title: 'Yüzde Hesaplama', 
    category: 'Matematik', 
    desc: 'Artış, azalış, indirim ve oran hesaplamalarını anında yapın.', 
    href: '/hesaplama/yuzde',
    isPopular: true,
    isReal: true
  },
  { 
    id: 'kdv-hesaplama',
    title: 'KDV Hesaplama', 
    category: 'Vergi', 
    desc: 'KDV dahil ve KDV hariç tutarları tek tıkla hesaplayın.', 
    href: '/hesaplama/kdv',
    isPopular: true,
    isReal: true
  },
  { 
    id: 'indirim-hesaplama',
    title: 'İndirim Hesaplama', 
    category: 'Matematik', 
    desc: 'Bir ürünün indirimli fiyatını ve tasarruf tutarınızı bulun.', 
    href: '/hesaplama/indirim',
    isPopular: true,
    isReal: true
  },
  { 
    id: 'zam-hesaplama',
    title: 'Zam Hesaplama', 
    category: 'Finans', 
    desc: 'Maaş veya ürün fiyatlarına yapılan zam oranını hesaplayın.', 
    href: '/hesaplama/zam',
    isPopular: true,
    isReal: true
  },
  { 
    id: 'oran-hesaplama',
    title: 'Oran Hesaplama', 
    category: 'Matematik', 
    desc: 'İki sayı arasındaki oranı ve yüzde karşılığını anında bulun.', 
    href: '/hesaplama/oran',
    isPopular: true,
    isReal: true
  },
  { 
    id: 'ihtiyac-kredisi',
    title: 'İhtiyaç Kredisi', 
    category: 'Kredi', 
    desc: 'Taksit ve toplam maliyet tablosu.', 
    href: '/hesaplama/ihtiyac-kredisi',
    isPopular: true,
    isReal: true
  },
  { 
    id: 'yakit-tuketimi',
    title: 'Yakıt Tüketimi', 
    category: 'Otomotiv', 
    desc: 'Mesafe ve yakıt fiyatı ile yol maliyeti.', 
    href: '/hesaplama/yakit-tuketimi',
    isPopular: true,
    isReal: false
  },
  { 
    id: 'is-yeri-kredisi',
    title: 'İş Yeri Kredisi Hesaplama', 
    category: 'Kredi', 
    desc: 'İş yeri alımı veya ticari ihtiyaçlarınız için kredi taksitlerinizi ve maliyet tablosunu hesaplayın.', 
    href: '/hesaplama/is-yeri-kredisi',
    isPopular: false,
    isReal: true
  },
  { 
    id: 'konut-kredisi',
    title: 'Konut Kredisi', 
    category: 'Kredi', 
    desc: 'Banka komisyonları ve taksit planlaması.', 
    href: '/hesaplama/konut-kredisi',
    isFeatured: true,
    isReal: true
  },
  { 
    id: 'kidem-tazminati',
    title: 'Kıdem ve İhbar Tazminatı', 
    category: 'Maaş & Çalışma', 
    desc: 'Kıdem tavanı ve damga vergisi dahil net tutar.', 
    href: '/hesaplama/kidem-tazminati',
    isFeatured: true,
    isReal: false
  },
  { 
    id: 'mtv-hesaplama',
    title: 'Motorlu Taşıtlar Vergisi', 
    category: 'Vergi', 
    desc: 'Tescil yılı ve motor silindir hacmi tarifesi.', 
    href: '/hesaplama/mtv-hesaplama',
    isFeatured: true,
    isReal: false
  },
  { 
    id: 'basit-faiz-hesaplama',
    title: 'Basit Faiz Hesaplama', 
    category: 'Finans', 
    desc: 'Anapara, faiz oranı ve vade ile basit faiz getirisini hesaplayın.', 
    href: '/hesaplama/basit-faiz',
    isPopular: false,
    isReal: true
  },
  { 
    id: 'bilesik-faiz-hesaplama',
    title: 'Bileşik Faiz Hesaplama', 
    category: 'Finans', 
    desc: 'Bileşik faiz mantığıyla gelecekteki toplam değeri ve kazancınızı hesaplayın.', 
    href: '/hesaplama/bilesik-faiz',
    isPopular: false,
    isReal: true
  },
  { 
    id: 'kar-hesaplama',
    title: 'Kâr Hesaplama', 
    category: 'Finans', 
    desc: 'Bir satıştan elde ettiğiniz kârı ve kâr marjını hesaplayın.', 
    href: '/hesaplama/kar-hesaplama',
    isPopular: true,
    isReal: true
  },
  { 
    id: 'zarar-hesaplama',
    title: 'Zarar Hesaplama', 
    category: 'Finans', 
    desc: 'Satıştan doğan zararı ve zarar oranını anında bulun.', 
    href: '/hesaplama/zarar-hesaplama',
    isPopular: false,
    isReal: true
  },
  { 
    id: 'metrekare-hesaplama',
    title: 'Metrekare Hesaplama', 
    category: 'Matematik', 
    desc: 'Uzunluk ve genişlik girerek bir alanın metrekaresini (m²) hesaplayın.', 
    href: '/hesaplama/metrekare-hesaplama',
    isPopular: false,
    isReal: true
  },
  { 
    id: 'ortalama-maliyet-hesaplama',
    title: 'Ortalama Maliyet Hesaplama', 
    category: 'Finans', 
    desc: 'Farklı fiyatlardan alınan ürünlerin toplam ortalama maliyetini bulun.', 
    href: '/hesaplama/ortalama-maliyet-hesaplama',
    isPopular: false,
    isReal: true
  },
  { 
    id: 'hacim-hesaplama',
    title: 'Hacim Hesaplama', 
    category: 'Matematik', 
    desc: 'Dikdörtgenler prizması, küp veya silindirin hacmini (m³) hesaplayın.', 
    href: '/hesaplama/hacim-hesaplama',
    isPopular: false,
    isReal: true
  },
  { 
    id: 'cevre-hesaplama',
    title: 'Çevre Hesaplama', 
    category: 'Matematik', 
    desc: 'Kare, dikdörtgen, üçgen veya dairenin çevre uzunluğunu hesaplayın.', 
    href: '/hesaplama/cevre-hesaplama',
    isPopular: false,
    isReal: true
  },
  { 
    id: 'alan-hesaplama',
    title: 'Alan Hesaplama', 
    category: 'Matematik', 
    desc: 'Kare, dikdörtgen, üçgen veya dairenin alanını hesaplayın.', 
    href: '/hesaplama/alan-hesaplama',
    isPopular: false,
    isReal: true
  },
  { 
    id: 'faktoriyel-hesaplama',
    title: 'Faktöriyel Hesaplama', 
    category: 'Matematik', 
    desc: 'Verilen n sayısının faktöriyelini (n!) hesaplayın.', 
    href: '/hesaplama/faktoriyel-hesaplama',
    isPopular: false,
    isReal: true
  },
  { 
    id: 'permutasyon-hesaplama',
    title: 'Permütasyon Hesaplama', 
    category: 'Matematik', 
    desc: 'n elemanlı bir kümenin r elemanlı permütasyonlarını hesaplayın.', 
    href: '/hesaplama/permutasyon-hesaplama',
    isPopular: false,
    isReal: true
  },
  { 
    id: 'kombinasyon-hesaplama',
    title: 'Kombinasyon Hesaplama', 
    category: 'Matematik', 
    desc: 'n elemanlı bir kümenin r elemanlı kombinasyonlarını (seçim) hesaplayın.', 
    href: '/hesaplama/kombinasyon',
    isPopular: false,
    isReal: true
  },
  { 
    id: 'yas-hesaplama',
    title: 'Yaş Hesaplama', 
    category: 'Matematik', 
    desc: 'Doğum tarihinizden bugüne kadar ne kadar zaman geçtiğini detaylı hesaplayın.', 
    href: '/hesaplama/yas-hesaplama',
    isPopular: true,
    isReal: true
  },
  {
    id: 'kredi-hesaplama',
    title: 'Kredi Hesaplama',
    category: 'Kredi',
    desc: 'Bireysel veya ticari kredilerinizin taksitlerini, faiz oranlarını ve geri ödeme planını anında hesaplayın.',
    href: '/hesaplama/kredi-hesaplama',
    isPopular: false,
    isReal: true
  },
  {
    id: 'kredi-dosya-masrafi',
    title: 'Kredi Dosya Masrafı Hesaplama',
    category: 'Kredi',
    desc: 'Kullanacağınız krediden kesilecek olan dosya masrafını matematiksel olarak hesaplayın.',
    href: '/hesaplama/kredi-dosya-masrafi',
    isPopular: false,
    isReal: true
  },
  {
    id: 'kredi-erken-kapatma-cezasi',
    title: 'Kredi Erken Kapatma Cezası Hesaplama',
    category: 'Kredi',
    desc: 'Kredinizi vadesinden önce kapatmak istediğinizde ödemeniz gereken ceza tutarını hesaplayın.',
    href: '/hesaplama/kredi-erken-kapatma-cezasi',
    isPopular: false,
    isReal: true
  },
  {
    id: 'kredi-gecikme-faizi',
    title: 'Kredi Gecikme Faizi Hesaplama',
    category: 'Kredi',
    desc: 'Gecikmiş kredi taksitleriniz için uygulanacak gecikme faizi ve toplam ödeme tutarını bulun.',
    href: '/hesaplama/kredi-gecikme-faizi',
    isPopular: false,
    isReal: true
  },
  {
    id: 'kredi-karti-asgari-odeme-tutari',
    title: 'Kredi Kartı Asgari Ödeme Tutarı',
    category: 'Kredi Kartı',
    desc: 'Kredi kartı dönem borcunuz üzerinden ödemeniz gereken asgari tutarı matematiksel olarak hesaplayın.',
    href: '/hesaplama/kredi-karti-asgari-odeme-tutari',
    isPopular: true,
    isReal: true
  },
  {
    id: 'kredi-karti-ek-taksit',
    title: 'Kredi Kartı Ek Taksit Hesaplama',
    category: 'Kredi Kartı',
    desc: 'Mevcut taksitli işleminize ek taksit eklendiğinde yeni taksit tutarınızı faizsiz eşit bölüşüm varsayımıyla hesaplayın.',
    href: '/hesaplama/kredi-karti-ek-taksit',
    isPopular: false,
    isReal: true
  },
  {
    id: 'kredi-karti-gecikme-faizi',
    title: 'Kredi Kartı Gecikme Faizi Hesaplama',
    category: 'Kredi Kartı',
    desc: 'Kredi kartı dönem borcunuzu geciktirdiğinizde doğacak gecikme faizi ve toplam borcu parametrik olarak hesaplayın.',
    href: '/hesaplama/kredi-karti-gecikme-faizi',
    isPopular: false,
    isReal: true
  },
  {
    id: 'kredi-karti-islem-taksitlendirme',
    title: 'Kredi Kartı İşlem Taksitlendirme',
    category: 'Kredi Kartı',
    desc: 'Peşin yaptığınız bir harcamayı sonradan taksitlendirmek istediğinizde aylık ödeme planını oluşturun.',
    href: '/hesaplama/kredi-karti-islem-taksitlendirme',
    isPopular: false,
    isReal: true
  },
  {
    id: 'kredi-karti-taksitli-nakit-avans',
    title: 'Kredi Kartı Taksitli Nakit Avans',
    category: 'Kredi Kartı',
    desc: 'Çektiğiniz nakit avansın taksitlerini ve işlem ücretleriyle toplam maliyetini parametrik olarak hesaplayın.',
    href: '/hesaplama/kredi-karti-taksitli-nakit-avans',
    isPopular: false,
    isReal: true
  },
  {
    id: 'kredi-yapilandirma',
    title: 'Kredi Yapılandırma Hesaplama',
    category: 'Kredi',
    desc: 'Mevcut kredi borcunuzu yeni faiz ve vade koşullarında yapılandırdığınızda oluşacak yeni ödeme planını simüle edin.',
    href: '/hesaplama/kredi-yapilandirma',
    isPopular: true,
    isReal: true
  },
  {
    id: 'kredi-yillik-maliyet-orani',
    title: 'Kredi Yıllık Maliyet Oranı Hesaplama',
    category: 'Kredi',
    desc: 'Kullanılan net anapara ve ödenen taksitleri dikkate alarak efektif yıllık maliyet oranını (IRR) simüle edin.',
    href: '/hesaplama/kredi-yillik-maliyet-orani',
    isPopular: false,
    isReal: true
  },
  {
    id: 'ne-kadar-kredi-alabilirim',
    title: 'Ne Kadar Kredi Alabilirim Hesaplama',
    category: 'Kredi',
    desc: 'Ödeyebileceğiniz aylık taksit kapasitesine göre bankalardan teorik olarak çekebileceğiniz maksimum kredi miktarını hesaplayın.',
    href: '/hesaplama/ne-kadar-kredi-alabilirim',
    isPopular: true,
    isReal: true
  },
  {
    id: 'tasit-kredisi',
    title: 'Taşıt Kredisi Hesaplama',
    category: 'Kredi',
    desc: 'Otomobil veya diğer taşıt alımlarınız için kullanacağınız kredinin taksit ve ödeme planını anında hesaplayın.',
    href: '/hesaplama/tasit-kredisi',
    isPopular: true,
    isReal: true
  },
  {
    id: 'ticari-arac-kredisi',
    title: 'Ticari Araç Kredisi Hesaplama',
    category: 'Kredi',
    desc: 'Ticari faaliyetlerinizde kullanmak üzere alacağınız araçlar için ticari araç kredisi geri ödeme planını oluşturun.',
    href: '/hesaplama/ticari-arac-kredisi',
    isPopular: false,
    isReal: true
  },
  {
    id: 'ticari-ihtiyac-kredisi',
    title: 'Ticari İhtiyaç Kredisi Hesaplama',
    category: 'Kredi',
    desc: 'İşletmenizin kısa ve orta vadeli nakit ihtiyaçları için kullanacağınız ticari ihtiyaç kredisini parametrik olarak simüle edin.',
    href: '/hesaplama/ticari-ihtiyac-kredisi',
    isPopular: false,
    isReal: true
  },
  {
    id: 'ticari-kredi',
    title: 'Ticari Kredi Hesaplama',
    category: 'Kredi',
    desc: 'Şirketiniz için kullanacağınız ticari kredinin genel geri ödeme ve faiz tablosunu hesaplayın.',
    href: '/hesaplama/ticari-kredi',
    isPopular: false,
    isReal: true
  },
  {
    id: 'altin',
    title: 'Altın Hesaplama',
    category: 'Yatırım',
    desc: 'Farklı türdeki altın ve gümüş fiyatlarını kullanarak altından paraya veya paradan altına hızlı değer çevirimi yapın.',
    href: '/hesaplama/altin',
    isPopular: true,
    isReal: true
  },
  {
    id: 'bilesik-buyume',
    title: 'Bileşik Büyüme Hesaplama',
    category: 'Matematik',
    desc: 'Bir değerin belirli dönemlerde ortalama büyüme oranıyla gelecekteki değerini (Compound Growth) hesaplayın.',
    href: '/hesaplama/bilesik-buyume',
    isPopular: false,
    isReal: true
  },
  {
    id: 'birikim',
    title: 'Birikim Hesaplama',
    category: 'Yatırım',
    desc: 'Başlangıç sermayeniz ve düzenli aylık katkılarınızla, varsayımsal bir getiri oranı üzerinden gelecekteki birikiminizi hesaplayın.',
    href: '/hesaplama/birikim',
    isPopular: true,
    isReal: true
  },
  {
    id: 'bono',
    title: 'Bono Hesaplama',
    category: 'Yatırım',
    desc: 'Bononun basit faiz yaklaşımıyla vade sonundaki brüt getirisini hesaplayın.',
    href: '/hesaplama/bono',
    isPopular: false,
    isReal: true
  },
  {
    id: 'doviz',
    title: 'Döviz Hesaplama',
    category: 'Finans',
    desc: 'Bir para biriminin başka bir para birimine güncel kur değerleri üzerinden çevrilmesi ve hesaplanması.',
    href: '/hesaplama/doviz',
    isPopular: true,
    isReal: true
  },
  {
    id: 'enflasyon',
    title: 'Enflasyon Hesaplama',
    category: 'Finans',
    desc: 'Geçmişteki bir parasal tutarın belirlediğiniz kümülatif enflasyon oranına göre güncellenmiş bugünkü değerini hesaplayın.',
    href: '/hesaplama/enflasyon',
    isPopular: true,
    isReal: true
  },
  {
    id: 'eurobond',
    title: 'Eurobond Hesaplama',
    category: 'Yatırım',
    desc: 'Döviz cinsi tahvillerin (Eurobond) tahmini kupon getirisini ve vade sonu toplam nakit akışını simüle edin.',
    href: '/hesaplama/eurobond',
    isPopular: false,
    isReal: true
  },
  {
    id: 'faiz',
    title: 'Faiz Hesaplama',
    category: 'Finans',
    desc: 'Basit ve bileşik faiz formüllerini kullanarak anaparanızın zaman içindeki getirisini detaylıca hesaplayın.',
    href: '/hesaplama/faiz',
    isPopular: true,
    isReal: true
  },
  {
    id: 'gecmis-altin-fiyatlari',
    title: 'Geçmiş Altın Fiyatları Hesaplama',
    category: 'Yatırım',
    desc: 'Belirli bir tarihteki altın fiyatı verisini kullanarak geçmiş tarihli bir altın değer hesabı yapın.',
    href: '/hesaplama/gecmis-altin-fiyatlari',
    isPopular: false,
    isReal: true
  },
  {
    id: 'gecmis-doviz-kurlari',
    title: 'Geçmiş Döviz Kurları Hesaplama',
    category: 'Finans',
    desc: 'Belirli bir tarihteki döviz kurlarını kullanarak geçmiş tutarları güncel veya karşılıklı döviz cinslerine çevirin.',
    href: '/hesaplama/gecmis-doviz-kurlari',
    isPopular: false,
    isReal: true
  },
  {
    id: 'iban-dogrulama',
    title: 'IBAN Doğrulama',
    category: 'Finans',
    desc: 'Türkiye IBAN numarasının formatını ve MOD-97 doğrulama algoritmasını kontrol edin.',
    href: '/hesaplama/iban-dogrulama',
    isPopular: true,
    isReal: true
  },
  {
    id: 'ic-ve-dis-iskonto',
    title: 'İç ve Dış İskonto Hesaplama',
    category: 'Finans',
    desc: 'İç iskonto ve dış iskonto hesaplama formülleriyle senedin veya finansal varlığın net bugünkü değerini simüle edin.',
    href: '/hesaplama/ic-ve-dis-iskonto',
    isPopular: false,
    isReal: true
  },
  {
    id: 'ic-verim-orani',
    title: 'İç Verim Oranı Hesaplama',
    category: 'Finans',
    desc: 'Bir dizi yatırım veya nakit akışının beklenen getiri oranını (IRR) hesaplayın.',
    href: '/hesaplama/ic-verim-orani',
    isPopular: true,
    isReal: true
  },
  {
    id: 'kira-artis-orani',
    title: 'Kira Artış Oranı Hesaplama',
    category: 'Finans',
    desc: 'Eski kira bedeli ve artış oranından yeni kira bedelinizi hesaplayın.',
    href: '/hesaplama/kira-artis-orani',
    isPopular: true,
    isReal: true
  },
  {
    id: 'net-bugunku-deger',
    title: 'Net Bugünkü Değer Hesaplama',
    category: 'Finans',
    desc: 'Gelecekteki nakit akışlarının, belirlenen iskonto oranıyla bugünkü değerini hesaplayın.',
    href: '/hesaplama/net-bugunku-deger',
    isPopular: true,
    isReal: true
  },
  {
    id: 'ortalama-vade',
    title: 'Ortalama Vade Hesaplama',
    category: 'Finans',
    desc: 'Farklı tutarlardaki ödeme veya alacaklarınızın ağırlıklı ortalama vadesini hesaplayın.',
    href: '/hesaplama/ortalama-vade',
    isPopular: false,
    isReal: true
  },
  {
    id: 'parasal-deger',
    title: 'Parasal Değer Hesaplama',
    category: 'Finans',
    desc: 'Bir parasal tutarın belirli bir değişim (örneğin enflasyon) oranı sonrası nominal değerini hesaplayın.',
    href: '/hesaplama/parasal-deger',
    isPopular: false,
    isReal: true
  },
  {
    id: 'reel-getiri',
    title: 'Reel Getiri Hesaplama',
    category: 'Finans',
    desc: 'Nominal getiri ve enflasyon oranını dikkate alarak yatırımınızın gerçek reel getirisini hesaplayın.',
    href: '/hesaplama/reel-getiri',
    isPopular: true,
    isReal: true
  },
  {
    id: 'repo',
    title: 'Repo Hesaplama',
    category: 'Yatırım',
    desc: 'Repo işleminizin anapara, faiz oranı ve vade gününe göre vade sonu net getirisini ve stopaj tutarını hesaplayın.',
    href: '/hesaplama/repo',
    isPopular: false,
    isReal: true
  },
  {
    id: 'sermaye-ve-temettu',
    title: 'Sermaye ve Temettü Hesaplama',
    category: 'Finans',
    desc: 'Sermaye, hisse adedi ve temettü oranları arasındaki ilişkiyi kullanarak hisse başına düşen temettü ve nominal değeri hesaplayın.',
    href: '/hesaplama/sermaye-ve-temettu',
    isPopular: false,
    isReal: true
  },
  {
    id: 'tahvil',
    title: 'Tahvil Hesaplama',
    category: 'Yatırım',
    desc: 'Tahvilin nominal değeri, kupon oranı, vadesi ve piyasa getirisi üzerinden tahvil fiyatı ve getiri göstergelerini hesaplayın.',
    href: '/hesaplama/tahvil',
    isPopular: false,
    isReal: true
  },
  {
    id: 'vadeli-islem-fiyati',
    title: 'Vadeli İşlem Fiyatı Hesaplama',
    category: 'Yatırım',
    desc: 'Dayanak varlığın spot fiyatı, finansman maliyeti ve temettü etkisi üzerinden teorik vadeli işlem fiyatını hesaplayın.',
    href: '/hesaplama/vadeli-islem-fiyati',
    isPopular: false,
    isReal: true
  },
  {
    id: 'vadeli-mevduat-faizi',
    title: 'Vadeli Mevduat Faizi Hesaplama',
    category: 'Finans',
    desc: 'Vadeli mevduatınızın anapara, faiz oranı, vade ve stopaj oranına göre net getirisini ve vade sonu bakiyesini hesaplayın.',
    href: '/hesaplama/vadeli-mevduat-faizi',
    isPopular: true,
    isReal: true
  },
  {
    id: 'ags-puan',
    title: 'AGS Puan Hesaplama',
    category: 'Eğitim',
    desc: 'MEB Akademi Giriş Sınavı (AGS) için doğru/yanlış sayılarınıza göre tahmini puanınızı hesaplayın.',
    href: '/hesaplama/ags-puan',
    isPopular: false,
    isReal: true
  },
  {
    id: 'aks-puan',
    title: 'AKS Puan Hesaplama',
    category: 'Eğitim',
    desc: 'MEB Adaylık Kaldırma Sınavı (AKS) için doğru/yanlış sayılarınıza göre puanınızı hesaplayın.',
    href: '/hesaplama/aks-puan',
    isPopular: false,
    isReal: true
  },
  {
    id: 'ales-puan',
    title: 'ALES Puan Hesaplama',
    category: 'Eğitim',
    desc: 'ALES Sayısal, Sözel ve Eşit Ağırlık puanlarınızı ÖSYM standartlarına göre hesaplayın.',
    href: '/hesaplama/ales-puan',
    isPopular: true,
    isReal: true
  },
  {
    id: 'dgs-puan',
    title: 'DGS Puan Hesaplama',
    category: 'Eğitim',
    desc: 'Dikey Geçiş Sınavı (DGS) SAY, SÖZ ve EA puanlarınızı ÖBP dahil şekilde hesaplayın.',
    href: '/hesaplama/dgs-puan',
    isPopular: true,
    isReal: true
  },
  {
    id: 'dgs-taban-puanlari',
    title: 'DGS Taban Puanları',
    category: 'Eğitim',
    desc: 'DGS taban puanlarını yıl, üniversite ve program bazında inceleyin. (Demo veri)',
    href: '/hesaplama/dgs-taban-puanlari',
    isPopular: false,
    isReal: true
  },
  {
    id: 'dib-mbsts-puan',
    title: 'DİB MBSTS Puan Hesaplama',
    category: 'Eğitim',
    desc: '2026-DİB-MBSTS sınavı doğru/yanlış sayılarınıza göre tahmini puanınızı hesaplayın.',
    href: '/hesaplama/dib-mbsts-puan',
    isPopular: false,
    isReal: true
  },
  {
    id: 'dus-puan',
    title: 'DUS Puan Hesaplama',
    category: 'Eğitim',
    desc: '2026-DUS (Diş Hekimliği Uzmanlık Sınavı) tahmini puanınızı Temel ve Klinik Bilimler doğru/yanlış sayılarınıza göre hesaplayın.',
    href: '/hesaplama/dus-puan',
    isPopular: false,
    isReal: true
  },
  {
    id: 'ehliyet-sinavi-puan',
    title: 'Ehliyet Sınavı Puan Hesaplama',
    category: 'Eğitim',
    desc: 'MEB motorlu taşıt sürücü kursu teorik sınavı doğru sayınıza göre puanınızı ve başarı durumunuzu hesaplayın.',
    href: '/hesaplama/ehliyet-sinavi-puan',
    isPopular: true,
    isReal: true
  },
  {
    id: 'ekpss-puan',
    title: 'EKPSS Puan Hesaplama',
    category: 'Eğitim',
    desc: '2026-EKPSS (Engelli Kamu Personeli Seçme Sınavı) Genel Yetenek ve Genel Kültür testleri doğru/yanlış sayılarınıza göre tahmini puanınızı hesaplayın.',
    href: '/hesaplama/ekpss-puan',
    isPopular: false,
    isReal: true
  },
  {
    id: 'eus-puan',
    title: 'EUS Puan Hesaplama',
    category: 'Eğitim',
    desc: '2026-EUS (Eczacılıkta Uzmanlık Eğitimi Giriş Sınavı) Temel Eczacılık ve Klinik/Uygulamalı Eczacılık testleri doğru/yanlış sayılarınıza göre tahmini puanınızı hesaplayın. (7 Kasım 2026)',
    href: '/hesaplama/eus-puan',
    isPopular: false,
    isReal: true
  },
  {
    id: 'h-kim-ve-savci-yardimciligi-sinavi-puan',
    title: 'Hâkim ve Savcı Yardımcılığı Sınavı Puan Hesaplama',
    category: 'Eğitim',
    desc: 'Adalet Bakanlığı Hâkim ve Savcı Yardımcılığı Yazılı Sınavı Genel Yetenek ve Hukuk testleri doğru/yanlış sayılarınıza göre tahmini puanınızı hesaplayın.',
    href: '/hesaplama/h-kim-ve-savci-yardimciligi-sinavi-puan',
    isPopular: false,
    isReal: true
  },
  {
    id: 'hmgs-puan',
    title: 'HMGS Puan Hesaplama',
    category: 'Eğitim',
    desc: '2026-HMGS (Hukuk Mesleklerine Giriş Sınavı) Medeni Hukuk-Borçlar Hukuku ve Ticaret Hukuku-Usul Hukuku testleri doğru/yanlış sayılarınıza göre tahmini puanınızı hesaplayın.',
    href: '/hesaplama/hmgs-puan',
    isPopular: false,
    isReal: true
  },
  {
    id: 'isg-puan',
    title: 'İSG Puan Hesaplama',
    category: 'Eğitim',
    desc: 'ÇSGB İş Sağlığı ve Güvenliği Uzmanlık Sınavı (Sınıf A/B/C) doğru/yanlış sayılarınıza göre puanınızı ve başarı durumunuzu hesaplayın.',
    href: '/hesaplama/isg-puan',
    isPopular: false,
    isReal: true
  },
  {
    id: 'iyos-puan',
    title: 'İYÖS Puan Hesaplama',
    category: 'Eğitim',
    desc: '2026-İYÖS (İdari Yargı Ön Sınavı, 27 Eylül 2026) Genel Yetenek ve Hukuk testleri doğru/yanlış sayılarınıza göre yaklaşık puanınızı hesaplayın.',
    href: '/hesaplama/iyos-puan',
    isPopular: false,
    isReal: true
  },
  {
    id: 'kpss-puan',
    title: 'KPSS Puan Hesaplama',
    category: 'Eğitim',
    desc: 'KPSS Genel Yetenek ve Genel Kültür testleri doğru/yanlış sayılarınıza göre KPSSP1 veya KPSSP3 yaklaşık puanınızı hesaplayın.',
    href: '/hesaplama/kpss-puan',
    isPopular: true,
    isReal: true
  },
  {
    id: 'lgs-puan',
    title: 'LGS Puan Hesaplama',
    category: 'Eğitim',
    desc: '2026 LGS (Liselere Giriş Sınavı) 6 test doğru/yanlış sayılarınıza göre yaklaşık puanınızı (100–500) hesaplayın.',
    href: '/hesaplama/lgs-puan',
    isPopular: true,
    isReal: true
  },
  {
    id: 'lise-lgs-taban-puanlari',
    title: 'Lise / LGS Taban Puanları Hesaplama',
    category: 'Eğitim',
    desc: 'LGS ile öğrenci alan lise ve ortaöğretim kurumlarının geçmiş taban puanlarını sorgulayın.',
    href: '/hesaplama/lise-lgs-taban-puanlari',
    isPopular: false,
    isReal: true
  },
  {
    id: 'msu-puan',
    title: 'MSÜ Puan Hesaplama',
    category: 'Eğitim',
    desc: '2026-MSÜ (Millî Savunma Üniversitesi Sınavı) doğru/yanlış sayılarınıza göre MSÜ-SAY, MSÜ-SÖZ veya MSÜ-EA yaklaşık puanınızı hesaplayın.',
    href: '/hesaplama/msu-puan',
    isPopular: true,
    isReal: true
  },
  {
    id: 'obp-okul-puani',
    title: 'OBP Okul Puanı Hesaplama',
    category: 'Eğitim',
    desc: 'Diploma notunuzdan OBP (Ortaöğretim Başarı Puanı) ve YKS yerleştirme puanına katkısını hesaplayın.',
    href: '/hesaplama/obp-okul-puani',
    isPopular: true,
    isReal: true
  },
  {
    id: 'oyp-puan',
    title: 'ÖYP Puan Hesaplama',
    category: 'Eğitim',
    desc: 'Tarihi ÖYP (Öğretim Üyesi Yetiştirme Programı) formülüne göre ALES, yabancı dil ve lisans notu ile ÖYP puanınızı hesaplayın.',
    href: '/hesaplama/oyp-puan',
    isPopular: false,
    isReal: true
  },
  {
    id: 'ozel-guvenlik-sinavi-puani',
    title: 'Özel Güvenlik Sınavı Puanı Hesaplama',
    category: 'Eğitim',
    desc: 'EGM Özel Güvenlik Temel/Yenileme eğitimi sınavı başarı durumunuzu hesaplayın.',
    href: '/hesaplama/ozel-guvenlik-sinavi-puani',
    isPopular: true,
    isReal: true
  },
  {
    id: 'pmyo-puan',
    title: 'PMYO Puan Hesaplama',
    category: 'Eğitim',
    desc: 'Polis Meslek Yüksekokulu (PMYO) güncel başarı formülüne göre nihai puanınızı hesaplayın.',
    href: '/hesaplama/pmyo-puan',
    isPopular: true,
    isReal: true
  },
  {
    id: 'pomem-puan',
    title: 'POMEM Puan Hesaplama',
    category: 'Eğitim',
    desc: 'Polis Meslek Eğitim Merkezi (POMEM) nihai başarı sıralama puanınızı öğrenin.',
    href: '/hesaplama/pomem-puan',
    isPopular: true,
    isReal: true
  },
  {
    id: 'pybs-puan',
    title: 'PYBS (İOKBS) Puan Hesaplama',
    category: 'Eğitim',
    desc: 'MEB 2026 PYBS (İOKBS) Bursluluk sınavı netlerinizi ve yaklaşık puanınızı öğrenin.',
    href: '/hesaplama/pybs-puan',
    isPopular: true,
    isReal: true
  },
  {
    id: 'tus-puan',
    title: 'TUS Puan Hesaplama',
    category: 'Eğitim',
    desc: 'TUS (Tıpta Uzmanlık Eğitimi Giriş Sınavı) Temel ve Klinik netlerinize göre T ve K puanınızı yaklaşık hesaplayın.',
    href: '/hesaplama/tus-puan',
    isPopular: true,
    isReal: true
  },
  {
    id: 'tyt-puan',
    title: 'TYT Puan Hesaplama',
    category: 'Eğitim',
    desc: '2026 YKS Temel Yeterlilik Testi (TYT) netlerinizi ve yaklaşık sınav puanınızı hesaplayın.',
    href: '/hesaplama/tyt-puan',
    isPopular: true,
    isReal: true
  },
  {
    id: 'universite-yks-taban-puanlari',
    title: 'Üniversite / YKS Taban Puanları Hesaplama',
    category: 'Eğitim',
    desc: 'ÖSYM 2026-YKS yerleştirme sonuçlarına göre üniversite taban puanları ve başarı sıralamalarını sorgulayın.',
    href: '/hesaplama/universite-yks-taban-puanlari',
    isPopular: false,
    isReal: true
  },
  {
    id: 'yds-puan',
    title: 'YDS Puan Hesaplama',
    category: 'Eğitim',
    desc: 'YDS veya e-YDS doğru sayınıza göre 100 üzerinden yabancı dil puanınızı ve seviyenizi hesaplayın.',
    href: '/hesaplama/yds-puan',
    isPopular: true,
    isReal: true
  },
  {
    id: 'ydus-puan',
    title: 'YDUS Puan Hesaplama',
    category: 'Eğitim',
    desc: 'Yan Dal Uzmanlık Eğitimi Giriş Sınavı (YDUS) netlerinizi ve yaklaşık puanınızı hesaplayın.',
    href: '/hesaplama/ydus-puan',
    isPopular: false,
    isReal: true
  },
  {
    id: 'yks-puan',
    title: 'YKS Puan Hesaplama',
    category: 'Eğitim',
    desc: '2026 YKS sistemi için güncel katsayılar ve OBP ile TYT, SAY, EA, SÖZ ve DİL puanlarınızı hesaplayın.',
    href: '/hesaplama/yks-puan',
    isPopular: true,
    isReal: true
  },
  {
    id: 'ders-notu',
    title: 'Ders Notu Hesaplama',
    category: 'Eğitim',
    desc: 'Vize, final, proje notlarınızı kullanarak ders başarı ortalamanızı basit veya ağırlıklı hesaplayın.',
    href: '/hesaplama/ders-notu',
    isPopular: true,
    isReal: true
  },
  {
    id: 'e-okul-not',
    title: 'E-Okul Not Hesaplama',
    category: 'Eğitim',
    desc: 'MEB güncel yönetmeliğine göre e-okul dönem ortalamanızı, belge durumunuzu hesaplayın.',
    href: '/hesaplama/e-okul-not',
    isPopular: true,
    isReal: true
  },
  {
    id: 'lise-ders-puani',
    title: 'Lise Ders Puanı Hesaplama',
    category: 'Eğitim',
    desc: 'MEB 2026 lise yönetmeliğine göre sınav ve performans notlarınızla bir dersin başarı puanını hesaplayın.',
    href: '/hesaplama/lise-ders-puani',
    isPopular: true,
    isReal: true
  },
  {
    id: 'lise-mezuniyet-puani',
    title: 'Lise Mezuniyet Puanı Hesaplama',
    category: 'Eğitim',
    desc: '9, 10, 11 ve 12. sınıf yıl sonu başarı puanlarınızla lise mezuniyet (diploma) puanınızı hesaplayın.',
    href: '/hesaplama/lise-mezuniyet-puani',
    isPopular: false,
    isReal: true
  },
  {
    id: 'lise-ortalama',
    title: 'Lise Ortalama Hesaplama',
    category: 'Eğitim',
    desc: 'Lise derslerinizin puanı ve haftalık saatiyle dönem/yıl sonu ağırlıklı ortalamanızı hesaplayın.',
    href: '/hesaplama/lise-ortalama',
    isPopular: true,
    isReal: true
  },
  {
    id: 'lise-sinif-gecme',
    title: 'Lise Sınıf Geçme Hesaplama',
    category: 'Eğitim',
    desc: 'MEB güncel lise yönetmeliğine göre yıl sonu başarı puanınızı, sınıf geçme veya kalma durumunuzu hesaplayın.',
    href: '/hesaplama/lise-sinif-gecme',
    isPopular: true,
    isReal: true
  },
  {
    id: 'lise-ybp',
    title: 'Lise YBP Hesaplama',
    category: 'Eğitim',
    desc: 'MEB güncel lise yönetmeliğine göre ders puanlarınız ve haftalık ders saatlerinizle Yıl Sonu Başarı Puanınızı hesaplayın.',
    href: '/hesaplama/lise-ybp',
    isPopular: false,
    isReal: true
  },
  {
    id: 'okula-baslama-yasi',
    title: 'Okula Başlama Yaşı Hesaplama',
    category: 'Eğitim',
    desc: 'Çocuğunuzun doğum tarihine göre ilkokul 1. sınıf veya anaokuluna başlama yaşını ve kayıt durumunu öğrenin.',
    href: '/hesaplama/okula-baslama-yasi',
    isPopular: true,
    isReal: true
  },
  {
    id: 'takdir-tesekkur',
    title: 'Takdir Teşekkür Hesaplama',
    category: 'Eğitim',
    desc: 'Dönem ortalamanız, devamsızlık ve ders başarınıza göre MEB takdir veya teşekkür belgesi alma durumunuzu hesaplayın.',
    href: '/hesaplama/takdir-tesekkur',
    isPopular: true,
    isReal: true
  },
  {
    id: 'universite-not-ortalamasi',
    title: 'Üniversite Not Ortalaması Hesaplama',
    category: 'Eğitim',
    desc: 'Üniversite ders kredilerinizle 4\'lük, 100\'lük veya harf sistemi (AA, BA) üzerinden GPA/GANO hesaplayın.',
    href: '/hesaplama/universite-not-ortalamasi',
    isPopular: true,
    isReal: true
  },
  {
    id: 'adet-gunu',
    title: 'Adet Günü Hesaplama',
    category: 'Sağlık',
    desc: 'Son adet tarihinize ve döngü uzunluğunuza göre tahmini bir sonraki adet gününüzü hesaplayın.',
    href: '/hesaplama/adet-gunu',
    isPopular: true,
    isReal: true
  },
  {
    id: 'asi-takvimi',
    title: 'Aşı Takvimi Hesaplama',
    category: 'Sağlık',
    desc: 'T.C. Sağlık Bakanlığı güncel Ulusal Çocukluk Dönemi Aşılama Takvimi verilerine göre çocuğunuzun aşı takvimini hesaplayın.',
    href: '/hesaplama/asi-takvimi',
    isPopular: true,
    isReal: true
  },
  {
    id: 'bazal-metabolizma-hizi',
    title: 'Bazal Metabolizma Hızı Hesaplama',
    category: 'Sağlık',
    desc: 'Cinsiyet, yaş, boy ve kilonuza göre günlük dinlenik halde harcadığınız tahmini enerjiyi (BMR) hesaplayın.',
    href: '/hesaplama/bazal-metabolizma-hizi',
    isPopular: true,
    isReal: true
  },
  {
    id: 'bebek-boyu',
    title: 'Bebek Boyu Hesaplama',
    category: 'Sağlık',
    desc: 'Ebeveyn boylarına dayanarak (Mid-Parental Height) çocuğunuzun genetik potansiyel yetişkinlik boyunu (hedef boy) hesaplayın.',
    href: '/hesaplama/bebek-boyu',
    isPopular: true,
    isReal: true
  },
  {
    id: 'bebek-kilosu',
    title: 'Bebek Kilosu Hesaplama',
    category: 'Sağlık',
    desc: 'Dünya Sağlık Örgütü (WHO) büyüme standartlarına göre bebeğinizin kilosunu medyan değerlerle karşılaştırın.',
    href: '/hesaplama/bebek-kilosu',
    isPopular: true,
    isReal: true
  },
  {
    id: 'bel-kalca-orani',
    title: 'Bel / Kalça Oranı Hesaplama',
    category: 'Sağlık',
    desc: 'Bel ve kalça çevrenizi girerek abdominal obezite riskinizi WHO referanslarına göre hesaplayın.',
    href: '/hesaplama/bel-kalca-orani',
    isPopular: true,
    isReal: true
  },
  {
    id: 'dogum-tarihi',
    title: 'Doğum Tarihi / Yaş Hesaplama',
    category: 'Sağlık',
    desc: 'Doğum tarihinizden tam yaşınızı bulun veya yaş değerlerinizden geriye dönük doğum tarihinizi hesaplayın.',
    href: '/hesaplama/dogum-tarihi',
    isPopular: true,
    isReal: true
  },
  {
    id: 'gebelik',
    title: 'Gebelik Hesaplama',
    category: 'Sağlık',
    desc: 'Son adet tarihinize (LMP) göre kaç haftalık hamile olduğunuzu ve tahmini doğum tarihinizi hesaplayın.',
    href: '/hesaplama/gebelik',
    isPopular: true,
    isReal: true
  },
  {
    id: 'gunluk-kalori-ihtiyaci',
    title: 'Günlük Kalori İhtiyacı Hesaplama',
    category: 'Sağlık',
    desc: 'Mifflin-St Jeor formülü ve fiziksel aktivite seviyeniz ile tahmini günlük kalori ihtiyacınızı (TDEE) hesaplayın.',
    href: '/hesaplama/gunluk-kalori-ihtiyaci',
    isPopular: true,
    isReal: true
  },
  {
    id: 'gunluk-karbonhidrat-ihtiyaci',
    title: 'Günlük Karbonhidrat İhtiyacı Hesaplama',
    category: 'Sağlık',
    desc: 'Fiziksel aktivite seviyenize ve kilonuza göre almanız gereken tahmini günlük karbonhidrat miktarını hesaplayın.',
    href: '/hesaplama/gunluk-karbonhidrat-ihtiyaci',
    isPopular: true,
    isReal: true
  },
  {
    id: 'gunluk-kreatin-dozu',
    title: 'Günlük Kreatin Dozu Hesaplama',
    category: 'Sağlık',
    desc: 'ISSN standartlarına göre kilonuza ve kullanım protokolünüze (yükleme/koruma) uygun kreatin dozunu öğrenin.',
    href: '/hesaplama/gunluk-kreatin-dozu',
    isPopular: true,
    isReal: true
  },
  {
    id: 'gunluk-makro-besin-ihtiyaci',
    title: 'Günlük Makro Besin İhtiyacı Hesaplama',
    category: 'Sağlık',
    desc: 'Toplam kalori hedefinize ve yüzdelik dağılımınıza göre günlük protein, karbonhidrat ve yağ miktarını hesaplayın.',
    href: '/hesaplama/gunluk-makro-besin-ihtiyaci',
    isPopular: true,
    isReal: true
  },
  {
    id: 'gunluk-protein-ihtiyaci',
    title: 'Günlük Protein İhtiyacı Hesaplama',
    category: 'Sağlık',
    desc: 'Fiziksel aktivitenize ve vücut ağırlığınıza göre günlük protein ihtiyacınızı EFSA ve ISSN standartlarında hesaplayın.',
    href: '/hesaplama/gunluk-protein-ihtiyaci',
    isPopular: true,
    isReal: true
  },
  {
    id: 'gunluk-su-ihtiyaci',
    title: 'Günlük Su İhtiyacı Hesaplama',
    category: 'Sağlık',
    desc: 'Vücut ağırlığınıza göre gün içinde ortalama olarak tüketmeniz gereken sıvı/su miktarını (Litre ve ml) hesaplayın.',
    href: '/hesaplama/gunluk-su-ihtiyaci',
    isPopular: true,
    isReal: true
  },
  {
    id: 'gunluk-yag-ihtiyaci',
    title: 'Günlük Yağ İhtiyacı Hesaplama',
    category: 'Sağlık',
    desc: 'Günlük toplam kalori hedefinize ve belirlediğiniz yağ yüzdesine göre ihtiyacınız olan sağlıklı yağ miktarını (gram) hesaplayın.',
    href: '/hesaplama/gunluk-yag-ihtiyaci',
    isPopular: true,
    isReal: true
  },
  {
    id: 'ideal-kilo',
    title: 'İdeal Kilo Hesaplama',
    category: 'Sağlık',
    desc: 'Cinsiyetinize ve boyunuza göre tıbbi formüllerle (Devine Formülü) hesaplanmış yaklaşık ideal vücut ağırlığınızı öğrenin.',
    href: '/hesaplama/ideal-kilo',
    isPopular: true,
    isReal: true
  },
  {
    id: 'sigara-maliyeti',
    title: 'Sigara Maliyeti Hesaplama',
    category: 'Sağlık',
    desc: 'Günlük içtiğiniz sigara sayısına ve paket fiyatına göre aylık ve yıllık sigara maliyetinizi hesaplayın.',
    href: '/hesaplama/sigara-maliyeti',
    isPopular: true,
    isReal: true
  },
  {
    id: 'sutyen-bedeni',
    title: 'Sütyen Bedeni Hesaplama',
    category: 'Sağlık',
    desc: 'Göğüs ve göğüs altı ölçülerinizi kullanarak EN 13402 standartlarına göre tahmini sütyen ve kup bedeninizi bulun.',
    href: '/hesaplama/sutyen-bedeni',
    isPopular: true,
    isReal: true
  },
  {
    id: 'vucut-kitle-endeksi',
    title: 'Vücut Kitle Endeksi (VKİ) Hesaplama',
    category: 'Sağlık',
    desc: 'Boy ve kilo değerlerinizle Vücut Kitle Endeksinizi hesaplayın, WHO standartlarında kilonuzun durumunu öğrenin.',
    href: '/hesaplama/vucut-kitle-endeksi',
    isPopular: true,
    isReal: true
  },
  {
    id: 'vucut-yag-orani',
    title: 'Vücut Yağ Oranı Hesaplama',
    category: 'Sağlık',
    desc: 'Mezura ile çevre ölçümlerinizi (boyun, bel, kalça) kullanarak Amerikan Donanması (U.S. Navy) metoduyla yağ oranınızı hesaplayın.',
    href: '/hesaplama/vucut-yag-orani',
    isPopular: true,
    isReal: true
  },
  {
    id: 'yasam-suresi',
    title: 'Yaşam Süresi Hesaplama',
    category: 'Sağlık',
    desc: 'TÜİK verilerine göre mevcut yaşınıza ve cinsiyetinize göre istatistiksel kalan yaşam beklentinizi öğrenin.',
    href: '/hesaplama/yasam-suresi',
    isPopular: true,
    isReal: true
  },
  {
    id: 'yumurtlama-donemi',
    title: 'Yumurtlama Dönemi Hesaplama',
    category: 'Sağlık',
    desc: 'Son adet tarihinizi ve döngü sürenizi girerek tahmini yumurtlama (ovülasyon) gününüzü ve verimli döneminizi hesaplayın.',
    href: '/hesaplama/yumurtlama-donemi',
    isPopular: true,
    isReal: true
  },
  {
    id: 'alan',
    title: 'Alan Hesaplama',
    category: 'Matematik',
    desc: 'Kare, dikdörtgen, üçgen, daire, paralelkenar veya yamuk gibi geometrik şekillerin alanını formüllerle hesaplayın.',
    href: '/hesaplama/alan',
    isPopular: true,
    isReal: true
  },
  {
    id: 'altin-oran',
    title: 'Altın Oran Hesaplama',
    category: 'Matematik',
    desc: 'İki uzunluk değerinizin birbirine oranının matematiksel Altın Oran (1.618) sabitine ne kadar uygun olduğunu test edin.',
    href: '/hesaplama/altin-oran',
    isPopular: true,
    isReal: true
  },
  {
    id: 'asal-carpan',
    title: 'Asal Çarpanlara Ayırma',
    category: 'Matematik',
    desc: 'Bir pozitif tam sayının asal çarpanlarını ve üslü gösterimini hesaplayın.',
    href: '/hesaplama/asal-carpan',
    isPopular: true,
    isReal: true
  },
  {
    id: 'basit-faiz',
    title: 'Basit Faiz Hesaplama',
    category: 'Finans',
    desc: 'Anapara, faiz oranı ve vade süresini girerek basit faiz getirisini ve toplam tutarı hesaplayın.',
    href: '/hesaplama/basit-faiz',
    isPopular: true,
    isReal: true
  },
  {
    id: 'bilesik-faiz',
    title: 'Bileşik Faiz Hesaplama',
    category: 'Finans',
    desc: 'Bileşik faiz formülüyle (A = P(1+r/n)^nt) yıllık, aylık veya günlük bileşikleşme ile toplam tutarı hesaplayın.',
    href: '/hesaplama/bilesik-faiz',
    isPopular: true,
    isReal: true
  },
  {
    id: 'cevre',
    title: 'Çevre Hesaplama',
    category: 'Matematik',
    desc: 'Kare, dikdörtgen, üçgen, daire, paralelkenar veya yamuk şekillerinin çevre uzunluğunu hesaplayın.',
    href: '/hesaplama/cevre',
    isPopular: true,
    isReal: true
  },
  {
    id: 'ebob-ekok',
    title: 'EBOB EKOK Hesaplama',
    category: 'Matematik',
    desc: 'İki pozitif tam sayının En Büyük Ortak Bölenini (EBOB) ve En Küçük Ortak Katını (EKOK) Öklid algoritmasıyla hesaplayın.',
    href: '/hesaplama/ebob-ekok',
    isPopular: true,
    isReal: true
  },

  {
    id: 'faktoriyel',
    title: 'Faktöriyel Hesaplama',
    category: 'Matematik',
    desc: 'Bir tam sayının faktöriyelini (n!) BigInt hassasiyetiyle hesaplayın. 0! = 1, 20!, 50! ve daha büyük değerler desteklenir.',
    href: '/hesaplama/faktoriyel',
    isPopular: true,
    isReal: true
  },
  {
    id: 'hacim',
    title: 'Hacim Hesaplama',
    category: 'Matematik',
    desc: 'Küp, dikdörtgenler prizması, küre, silindir, koni ve üçgen prizma gibi geometrik cisimlerin hacmini hesaplayın.',
    href: '/hesaplama/hacim',
    isPopular: true,
    isReal: true
  },
  {
    id: 'inc',
    title: 'İnç Hesaplama',
    category: 'Matematik',
    desc: 'İnç (inch) ile santimetre (cm) arasında pratik uzunluk dönüşümü yapın. (1 inch = 2.54 cm)',
    href: '/hesaplama/inc',
    isPopular: true,
    isReal: true
  },
  {
    id: 'kombinasyon',
    title: 'Kombinasyon Hesaplama',
    category: 'Matematik',
    desc: 'n elemanlı bir kümeden r eleman seçmenin kaç farklı yolu olduğunu BigInt hassasiyetiyle hesaplayın. (C(n,r))',
    href: '/hesaplama/kombinasyon',
    isPopular: true,
    isReal: true
  },
  {
    id: 'koklu-sayi',
    title: 'Köklü Sayı Hesaplama',
    category: 'Matematik',
    desc: 'Bir sayının karekök, küpkök veya istenen n. dereceden kökünü hesaplayın.',
    href: '/hesaplama/koklu-sayi',
    isPopular: true,
    isReal: true
  },
  {
    id: 'metrekare',
    title: 'Metrekare Hesaplama',
    category: 'Matematik',
    desc: 'Uzunluk ve genişlik değerlerini girerek kolayca metrekare (m²) hesaplayın. Zemin, duvar ve oda ölçüleri için.',
    href: '/hesaplama/metrekare',
    isPopular: true,
    isReal: true
  },
  {
    id: 'mil',
    title: 'Mil Hesaplama',
    category: 'Matematik',
    desc: 'Mil ve kilometre (km) arasında uzunluk birimi dönüşümü yapın. (1 mil = 1.609344 km)',
    href: '/hesaplama/mil',
    isPopular: true,
    isReal: true
  },
  {
    id: 'moduler-aritmetik',
    title: 'Modüler Aritmetik Hesaplama',
    category: 'Matematik',
    desc: 'Sayıların belirtilen bir moda göre (mod m) değerlerini, toplama, çıkarma ve çarpma işlemlerini hesaplayın.',
    href: '/hesaplama/moduler-aritmetik',
    isPopular: true,
    isReal: true
  },
  {
    id: 'oran',
    title: 'Oran Hesaplama',
    category: 'Matematik',
    desc: 'İki sayı arasındaki oranı sadeleştirerek en basit formunda bulun.',
    href: '/hesaplama/oran',
    isPopular: true,
    isReal: true
  }
];
