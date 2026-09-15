# Görev Yönlendirme ve Rol Haritası

| Görev Türü | Birincil Agent | Destekleyici Skill'ler | Kalite Kapısı (Review) |
| :--- | :--- | :--- | :--- |
| **Genel Analiz & Keşif** | `hesapera-researcher` | `hesapera-core` | Gerekirse `self` |
| **Yeni Hesaplama Aracı** | `hesapera-calculator` | `hesapera-core` | `hesapera-reviewer` |
| **Arayüz, UI/UX, Mobil** | `hesapera-ui-designer` | `ui-ux-pro-max`, `ui-styling` | `hesapera-reviewer` |
| **SEO, Google, AdSense** | `hesapera-seo-specialist` | `hesapera-core`, `modern-web-guidance` | `hesapera-reviewer` |
| **Mevzuat & Finans Verisi** | `hesapera-finance-researcher` | `hesapera-core` | `hesapera-researcher` |
| **Kompleks Kod & Refactor** | `self` | `hesapera-core`, `modern-web-guidance` | `hesapera-reviewer` |
| **Son Kalite & QA** | `hesapera-reviewer` | `hesapera-core` | `npm test` & `npm run build` |
