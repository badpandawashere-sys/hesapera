---
name: hesapera-orchestration
description: Hesapera geliştirme işlerinde görev dağılımı, çalışma sırası, token optimizasyonu ve kalite kapılarını koordine eden orkestrasyon kuralları.
---

# Hesapera Orchestration Skill

Bu yetenek; Hesapera projesinde görevlerin doğru uzman agent'a dağıtılmasını, multi-agent iş akışını, token optimizasyonunu ve sıfır hata (zero-defect) prensibiyle kalite kapılarının işletilmesini tanımlar.

---

## 1. Görev Dağılımı ve Çalışma Sırası

Hesapera'da her iş, uzmanlığı tanımlanmış doğru role delege edilir:

### 1. GENEL ANALİZ & KEŞİF
→ **`hesapera-researcher`**
- Codebase araştırması, dosya bağımlılıklarının tespiti, route analizi ve mimari seçeneklerin karşılaştırılması.

### 2. YENİ HESAPLAMA ARACI GELİŞTİRME
→ **`hesapera-calculator`**
- Formula (`calculators/formulas/*.ts`), tanım (`calculators/definitions/*.ts`), Zod doğrulama şeması, birim test (`calculators/formulas/__tests__/*.test.ts`) ve registry kaydının oluşturulması.

### 3. UI / UX / RESPONSIVE TASARIM
→ **`hesapera-ui-designer`** + **`ui-ux-pro-max`** + **`ui-styling`**
- Mobil uyumluluk, form ergonomisi, dokunma hedefleri (min 44×44px), WCAG kontrastı (4.5:1), Core Web Vitals (CLS/INP/LCP) ve shadcn/Tailwind görsel tutarlılığı.

### 4. SEO / GOOGLE SEARCH / ADSENSE HAZIRLIĞI
→ **`hesapera-seo-specialist`** + **`hesapera-core`** + **`modern-web-guidance`**
- Teknik SEO (canonical, metadata, robots), JSON-LD (WebApplication, BreadcrumbList, FAQPage), dinamik sitemap bütünlüğü, içerik zenginliği ve AdSense politika hazırlığı.

### 5. FİNANS / RESMİ VERİ / MEVZUAT ARAŞTIRMASI
→ **`hesapera-finance-researcher`**
- TCMB, BDDK, KGM, EPDK, Gelir İdaresi gibi resmi kaynakların formülleri, mevzuat sınırları, spreadler ve kanıt odaklı veri araştırması.

### 6. SON KALİTE KONTROLÜ (QA / CODE REVIEW)
→ **`hesapera-reviewer`**
- Formül doğruluğu, edge case'ler, TypeScript tip denetimi, regresyon riski, number formatting koruması ve bağımsız PASS / CHANGES REQUIRED denetimi.

### 7. GENEL KOMPLEKS KOD / BÜYÜK REFACTOR
→ **`self`**
- Gerektiğinde `hesapera-researcher` ile mimari keşif, uygulama sonrasında ise mutlaka `hesapera-reviewer` onayı.

---

## 2. Zorunlu Geliştirme Döngüsü (Quality Gate)

Hesapera'da hiçbir özellik veya düzeltme aşağıdaki zorunlu sıra takip edilmeden tamamlanamaz:

```text
1. ARAŞTIR     → Mevcut mimariyi ve ilgili dosyaları incele (kod yazma)
2. PLANLA      → Değişiklik planını ve etkilenecek dosyaları çıkar
3. UYGULA      → Minimal, izole ve hedefe yönelik değişiklik yap
4. TEST ET     → npm run test ile tüm testlerin (600+) geçtiğini doğrula
5. DERLE (BUILD) → npm run build ile TypeScript ve Turbopack derlemesini doğrula
6. DENETLE (REVIEW) → hesapera-reviewer veya QA süzgecinden geçir
```

---

## 3. Katı Kurallar ve Kısıtlamalar

1. **Gereksiz Refactor Yasağı:** Çalışan koda, formüllere veya bileşenlere "daha iyi görünmesi" amacıyla gereksiz refactor yapılmaz.
2. **İlişkisiz Dosyalar Dokunulmazdır:** Görev kapsamı dışındaki hiçbir dosya değiştirilmez, silinmez veya taşınmaz.
3. **Number Formatting Dokunulmazlığı:** Hesapera'nın yerel sayı formatlama altyapısına kesinlikle müdahale edilmez.
4. **Draft / Published Ayrımı:** Yalnızca formülü, şeması, testleri ve içeriği tam olan araçlar `published` statüsüne geçebilir. Taslak araçlar arama motorlarına kapalı (`noindex`) tutulur.
5. **Sitemap 404 Koruması:** Boş kategoriler veya 404 üreten URL'ler sitemap'e dahil edilmez.
6. **İzinsiz Commit / Push Yasağı:** Kullanıcı açıkça talimat vermedikçe asla `git commit` veya `git push` yapılmaz.
7. **Hesapera-Core Önceliği:** `hesapera-core` kuralları her zaman önceliklidir ve istisnasız uygulanır.

---

## 4. Ek Referanslar

- **Token Optimizasyonu:** [references/token-rules.md](references/token-rules.md)
- **Görev Yönlendirme:** [references/routing.md](references/routing.md)
