import { Metadata } from 'next';
import { SiteContainer } from '@/components/layout/site-container';
import Link from 'next/link';
import { Cookie, CheckCircle2, Sliders, Info } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Çerez Politikası | Hesapera',
  description: 'Hesapera web sitesinde kullanılan çerez türleri, kullanım amaçları ve çerez tercihlerinizi nasıl yönetebileceğinize dair detaylı bilgilendirme.',
  alternates: {
    canonical: 'https://www.hesapera.com.tr/cerez',
  },
  openGraph: {
    title: 'Çerez Politikası | Hesapera',
    description: 'Hesapera çerez politikası ve çerez yönetimi hakkında bilgilendirme.',
    url: 'https://www.hesapera.com.tr/cerez',
  },
};

export default function CookiePolicyPage() {
  const lastUpdated = '15 Eylül 2026';

  const cookieTypes = [
    {
      title: 'Zorunlu Çerezler',
      badge: 'Gerekli',
      desc: 'Web sitesinin düzgün çalışması, sayfa gezinmesi ve güvenli alanlara erişim gibi temel işlevleri yerine getirmek için zorunludur. Bu çerezler devre dışı bırakılamaz.',
    },
    {
      title: 'Performans ve Analitik Çerezleri',
      badge: 'İstatistik',
      desc: 'Ziyaretçilerin web sitemizi nasıl kullandığını anlamamıza, hangi sayfaların daha çok ziyaret edildiğini tespit etmemize ve site performansını artırmamıza yardımcı olur. Bu veriler tamamen anonim tutulur.',
    },
    {
      title: 'İşlevsel Çerezler',
      badge: 'Kullanıcı Tercihi',
      desc: 'Tercih ettiğiniz hesaplama birimleri, tema modu gibi seçimlerinizi hatırlayarak daha kişiselleştirilmiş ve akıcı bir deneyim sunmayı hedefler.',
    },
  ];

  return (
    <main className="flex-1 py-12 md:py-16 bg-muted/10">
      <SiteContainer>
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-10 text-center sm:text-left border-b border-border/60 pb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
              <Cookie className="w-3.5 h-3.5" />
              Çerez Kullanım Rehberi
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mb-3">
              Çerez Politikası
            </h1>
            <p className="text-sm text-muted-foreground">
              Son Güncelleme Tarihi: <span className="text-foreground font-medium">{lastUpdated}</span>
            </p>
          </div>

          <div className="space-y-10 text-foreground text-sm sm:text-base leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                <Info className="w-5 h-5 text-primary" />
                1. Çerez (Cookie) Nedir?
              </h2>
              <p className="text-muted-foreground">
                Çerezler, bir web sitesini ziyaret ettiğinizde tarayıcınız aracılığıyla cihazınıza (bilgisayar, tablet veya telefon) kaydedilen küçük metin dosyalarıdır. Çerezler web sitesinin verimli çalışmasını, kullanıcı tercihlerinin hatırlanmasını ve ziyaret istatistiklerinin toplanmasını sağlar.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                <Sliders className="w-5 h-5 text-primary" />
                2. Kullandığımız Çerez Türleri
              </h2>
              <p className="text-muted-foreground">
                Platformumuzda kullanılan başlıca çerez türleri şunlardır:
              </p>
              <div className="grid grid-cols-1 gap-4 pt-2">
                {cookieTypes.map((item, idx) => (
                  <div 
                    key={idx} 
                    className="p-5 rounded-xl bg-surface-container-lowest border border-border/70 shadow-sm space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-foreground">{item.title}</h3>
                      <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
                        {item.badge}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                3. Çerezleri Nasıl Yönetebilir veya Kapatabilirsiniz?
              </h2>
              <p className="text-muted-foreground">
                Çoğu internet tarayıcısı çerezleri otomatik olarak kabul edecek şekilde ayarlanmıştır. Dilediğiniz zaman tarayıcınızın ayarlar menüsünden çerezleri engelleyebilir, silebilir veya çerez gönderildiğinde uyarı verilmesini sağlayabilirsiniz:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-2">
                <li><strong className="text-foreground">Google Chrome:</strong> Ayarlar &gt; Gizlilik ve Güvenlik &gt; Çerezler ve Diğer Site Verileri</li>
                <li><strong className="text-foreground">Mozilla Firefox:</strong> Seçenekler &gt; Gizlilik ve Güvenlik &gt; Çerezler ve Site Verileri</li>
                <li><strong className="text-foreground">Apple Safari:</strong> Tercihler &gt; Gizlilik &gt; Çerezleri ve Web Sitesi Verilerini Yönet</li>
                <li><strong className="text-foreground">Microsoft Edge:</strong> Ayarlar &gt; Çerezler ve Site İzinleri</li>
              </ul>
              <p className="text-xs text-muted-foreground italic pt-2">
                Not: Zorunlu çerezlerin devre dışı bırakılması durumunda sitemizin bazı fonksiyonları beklenen şekilde çalışmayabilir.
              </p>
            </section>

            <section className="space-y-3 border-t border-border/60 pt-8">
              <h2 className="text-xl font-bold">4. İletişim</h2>
              <p className="text-muted-foreground">
                Çerez politikamız ile ilgili soru veya görüşlerinizi iletmek için{' '}
                <a href="mailto:info@hesapera.com.tr" className="text-primary hover:underline font-semibold">
                  info@hesapera.com.tr
                </a>{' '}
                adresine yazabilirsiniz.
              </p>
            </section>
          </div>

          {/* Quick links */}
          <div className="mt-12 pt-8 border-t border-border/60 flex flex-wrap gap-4 text-sm">
            <Link href="/gizlilik" className="text-muted-foreground hover:text-primary transition-colors">
              Gizlilik Politikası →
            </Link>
            <Link href="/kvkk" className="text-muted-foreground hover:text-primary transition-colors">
              KVKK Aydınlatma Metni →
            </Link>
            <Link href="/kullanim-kosullari" className="text-muted-foreground hover:text-primary transition-colors">
              Kullanım Koşulları →
            </Link>
          </div>
        </div>
      </SiteContainer>
    </main>
  );
}
