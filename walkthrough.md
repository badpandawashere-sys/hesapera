# ID20 Altın & ID24 Döviz Canlı Piyasa Entegrasyonu

Bu adımda mevcut Altın Hesaplama (ID20) aracının fiyat giriş yöntemi revize edildi ve Master Excel'e göre sıradaki Döviz Hesaplama (ID24) aracı aynı canlı veri altyapısıyla sisteme dahil edildi.

## Yapılan Değişiklikler

1. **Market Data Altyapısı (lib/market-data)**:
   - `types.ts` ve `market-data-service.ts` oluşturuldu.
   - Harem Altın canlı fiyat sayfasında Cloudflare koruması bulunduğu için, doğrudan HTML scrape işlemi riskli ve sürdürülemezdi. Resmi ve açık bir JSON/API (örn. `/dashboard/ajax/doviz`) 403/404 döndürdü. Talimata uyarak bu durum mimaride raporlandı (`harem-altin-provider.ts` yorumlarında) ve Türkiye'de çok yaygın ve güvenilir olan **Finans Truncgil API** (döviz ve altın kurları için) `truncgil-provider.ts` üzerinden fallback olarak bağlandı. 
   - Gelecekte bir Harem Altın Premium API Key eklendiğinde mimari değiştirilmeden sadece `harem-altin-provider.ts` içindeki fetch mantığı güncellenebilecektir.

2. **ID20 Altın Hesaplama (Revizyon)**:
   - `unitPrice` alanı manuel giriş olmaktan çıkarılıp tamamen kaldırıldı.
   - `calculators/definitions/gold.ts` içine `async calculate` mantığı eklendi. Kullanıcı "Hesapla" butonuna bastığında formül `marketDataService.getGoldQuote` ile güncel fiyatı çeker.
   - İşlem Yönüne göre "Alış" veya "Satış" kuru kullanılması formüle `formulas/gold.ts` uyarlandı.
   - Çıkan sonuç tablosunda ve bilgi kartında fiyatın canlı piyasa verisi (`quote.source`) ile hesaplandığı gösterildi.

3. **ID24 Döviz Hesaplama (Yeni)**:
   - Döviz bozma (to_try) ve Döviz alma (to_currency) işlemleri modellendi.
   - `definitions/currency.ts` ve `formulas/currency.ts` kodlandı. Tıpkı Altın hesaplayıcıda olduğu gibi, "Alış" veya "Satış" kuru kullanılarak işlem yapılıyor.
   - Excel standartlarındaki popüler 15 döviz türü (USD, EUR, GBP, vb.) destekleniyor.
   
4. **Calculator Engine Refactoring**:
   - `calculators/core/calculator-engine.ts` içerisindeki `runBySlug` ve `execute` fonksiyonları `async` yapıldı. Bu sayede hesaplama tanımları dış API'lere asenkron çağrı yapabilir hale geldi (UI tarafında business logic barındırmama kuralı korundu).
   - Tüm core ve hesaplama testlerindeki asenkron `Promise` hataları düzeltilerek test suit'i geçirildi (Production build `PASS`).
