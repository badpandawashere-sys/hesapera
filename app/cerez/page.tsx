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
  const lastUpdated = '31 Ekim 2026';

  const cookieTypes = [
    {
      title: 'Zorunlu Teknik Çerezler',
      badge: 'Gerekli',
      desc: 'Web sitesinin temel sayfa yönlendirmeleri, güvenli bağlantı yönetimi ve sunucu-istemci iletişimini sağlamak için kullanılan teknik çerezlerdir.',
    },
    {
      title: 'Performans ve Analitik Çerezleri',
      badge: 'İstatistik',
      desc: 'Ziyaretçilerin sayfaları nasıl kullandığını anlamamıza, hangi hesaplama araçlarının daha sık görüntülendiğini analiz etmemize ve olası teknik hataları tespit etmemize yardımcı olur.',
    },
    {
      title: 'Reklam ve Üçüncü Taraf Çerezleri (Google AdSense)',
      badge: 'Üçüncü Taraf / Reklam',
      desc: 'Google AdSense (`pagead2.googlesyndication.com`) ve iş ortakları tarafından reklam gösterimi, reklam sıklığının sınırlandırılması ve reklam performansının ölçülmesi amacıyla kullanılan çerezlerdir (DoubleClick çerezleri dahil).',
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
                Çerezler, bir web sitesini ziyaret ettiğinizde tarayıcınız aracılığıyla cihazınıza (bilgisayar, tablet veya telefon) kaydedilen küçük metin dosyalarıdır. Çerezler web sitesinin teknik olarak çalışmasını, ziyaret istatistiklerinin derlenmesini ve üçüncü taraf reklam ağlarının (Google AdSense) reklam sunmasını sağlar.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                <Sliders className="w-5 h-5 text-primary" />
                2. Kullandığımız Çerez Türleri ve Google AdSense
              </h2>
              <p className="text-muted-foreground">
                Platformumuzda kullanılan başlıca çerez kategorileri şunlardır:
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
              <p className="text-sm text-muted-foreground pt-2">
                Google dahil üçüncü taraf tedarikçiler, kullanıcıların bu web sitesine veya internetteki diğer web sitelerine yaptıkları önceki ziyaretlere dayalı olarak reklam yayınlamak için çerezleri kullanır. Kullanıcılar,{' '}
                <a
                  href="https://adssettings.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-medium"
                >
                  Google Reklam Ayarları (adssettings.google.com)
                </a>{' '}
                üzerinden kişiselleştirilmiş reklamcılık çerezlerini devre dışı bırakabilir veya{' '}
                <a
                  href="https://www.aboutads.info"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-medium"
                >
                  www.aboutads.info
                </a>{' '}
                adresini ziyaret ederek üçüncü taraf tedarikçilerin kişiselleştirilmiş reklamcılık için çerez kullanımını yönetebilir.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                3. Tarayıcı Ayarları Üzerinden Çerez Yönetimi
              </h2>
              <p className="text-muted-foreground">
                Sitemizde ayrı bir çerez tercih veritabanı tutulmamaktadır; çerez izinlerinizi doğrudan internet tarayıcınızın ayarları veya Google&apos;ın resmi reklam ayarları sayfası üzerinden yönetebilirsiniz. Dilediğiniz zaman tarayıcınızın ayarlar menüsünden çerezleri engelleyebilir veya silebilirsiniz:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-2">
                <li><strong className="text-foreground">Google Chrome:</strong> Ayarlar &gt; Gizlilik ve Güvenlik &gt; Üçüncü Taraf Çerezleri ve Site Verileri</li>
                <li><strong className="text-foreground">Mozilla Firefox:</strong> Ayarlar &gt; Gizlilik ve Güvenlik &gt; Çerezler ve Site Verileri</li>
                <li><strong className="text-foreground">Apple Safari:</strong> Ayarlar / Tercihler &gt; Gizlilik &gt; Çerezleri ve Web Sitesi Verilerini Yönet</li>
                <li><strong className="text-foreground">Microsoft Edge:</strong> Ayarlar &gt; Çerezler ve Site İzinleri</li>
              </ul>
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
