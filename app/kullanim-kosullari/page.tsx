import { Metadata } from 'next';
import { SiteContainer } from '@/components/layout/site-container';
import Link from 'next/link';
import { FileText, AlertTriangle, Scale, ShieldAlert, CheckCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Kullanım Koşulları | Hesapera',
  description: 'Hesapera web platformu kullanım şartları, yasal sorumluluk reddi beyanı, hizmet kuralları ve fikri mülkiyet hakları hakkında bilgilendirme.',
  alternates: {
    canonical: 'https://www.hesapera.com.tr/kullanim-kosullari',
  },
  openGraph: {
    title: 'Kullanım Koşulları | Hesapera',
    description: 'Hesapera kullanım koşulları ve sorumluluk reddi beyanı.',
    url: 'https://www.hesapera.com.tr/kullanim-kosullari',
  },
};

export default function TermsPage() {
  const lastUpdated = '15 Eylül 2026';

  return (
    <main className="flex-1 py-12 md:py-16 bg-muted/10">
      <SiteContainer>
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-10 text-center sm:text-left border-b border-border/60 pb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
              <FileText className="w-3.5 h-3.5" />
              Yasal Şartlar ve Beyanlar
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mb-3">
              Kullanım Koşulları
            </h1>
            <p className="text-sm text-muted-foreground">
              Son Güncelleme Tarihi: <span className="text-foreground font-medium">{lastUpdated}</span>
            </p>
          </div>

          {/* Critical Disclaimer Callout */}
          <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 mb-10 flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h2 className="text-base font-bold text-amber-900">Önemli Sorumluluk Reddi (Feragatname)</h2>
              <p className="text-sm text-amber-900/90 leading-relaxed">
                Hesapera üzerinde sunulan tüm hesaplama araçları, simülasyonlar ve rehber içerikler <strong>yalnızca bilgilendirme ve tahmin amaçlıdır</strong>. Sitedeki hiçbir hesaplama sonucu; resmi bir finansal danışmanlık, vergi tavsiyesi, hukuki mütalaa veya tıbbi teşhis/tedavi yerine geçmez. Karar almadan önce mutlaka yetkili uzman veya resmi kurumlardan teyit alınız.
              </p>
            </div>
          </div>

          <div className="space-y-10 text-foreground text-sm sm:text-base leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                <Scale className="w-5 h-5 text-primary" />
                1. Koşulların Kabulü
              </h2>
              <p className="text-muted-foreground">
                Hesapera web sitesini (&quot;hesapera.com.tr&quot;) ziyaret ederek veya sitedeki hesaplama araçlarını kullanarak, bu Kullanım Koşulları&apos;nda yer alan tüm maddeleri peşinen kabul etmiş sayılırsınız. Bu şartları kabul etmiyorsanız lütfen platformu kullanmayınız.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                2. Hizmetin Niteliği ve Kapsamı
              </h2>
              <p className="text-muted-foreground">
                Hesapera; kullanıcılarına finans, kredi, vergi, eğitim, sağlık, matematik ve günlük yaşam alanlarında formüllere dayalı çevrim içi hesaplama ve simülasyon hizmetleri sunar. Hizmetler genel olarak ücretsiz olup, platform dilediği zaman yeni araçlar ekleme, mevcut araçları güncelleme veya yayından kaldırma hakkını saklı tutar.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-primary" />
                3. Sorumluluk Sınırlandırması
              </h2>
              <p className="text-muted-foreground">
                Hesapera ekibi olarak formüllerin, katsayıların ve mevzuat verilerinin doğruluğu için azami özen göstermekteyiz. Ancak;
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-2">
                <li>Banka faiz oranları, vergi dilimleri, mevzuat ve kanun maddeleri zaman içinde değişiklik gösterebilir.</li>
                <li>Yuvarlama farkları, bankaların özel masraf/komisyon politikaları veya bireysel değişkenler nedeniyle gerçek sonuçlar ile hesaplama sonuçları arasında farklılıklar oluşabilir.</li>
                <li>Hesaplama sonuçlarına istinaden gerçekleştirilen işlemlerden, yatırımlardan, kredi başvurularından veya maruz kalınabilecek herhangi bir doğrudan ya da dolaylı zarardan Hesapera sorumlu tutulamaz.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold">4. Fikri ve Sınai Mülkiyet Hakları</h2>
              <p className="text-muted-foreground">
                Web sitemizde yer alan tüm yazılım kodları, tasarım ögeleri, logolar, metinler, grafikler ve içeriklerin mülkiyeti Hesapera&apos;ya aittir ve telif hakkı mevzuatıyla korunmaktadır. Hesapera&apos;nın önceden yazılı izni olmaksızın site içeriğinin kopyalanması, çoğaltılması veya ticari amaçla başka bir platforma aktarılması yasaktır.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold">5. Kullanıcı Yükümlülükleri</h2>
              <p className="text-muted-foreground">
                Kullanıcılar platformu yalnızca hukuka uygun amaçlarla kullanmayı, sitenin güvenliğini tehlikeye atacak veya sunucu performansını aksatacak otomatik sorgulama (bot/scraping/DDoS) faaliyetlerinde bulunmamayı kabul ve taahhüt eder.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold">6. Koşullarda Değişiklik</h2>
              <p className="text-muted-foreground">
                Hesapera, işbu Kullanım Koşulları&apos;nı dilediği zaman tek taraflı olarak güncelleme hakkına sahiptir. Değişiklikler sitede yayımlandığı tarihten itibaren bağlayıcı hale gelir.
              </p>
            </section>

            <section className="space-y-3 border-t border-border/60 pt-8">
              <h2 className="text-xl font-bold">7. İletişim ve Hukuki Uyuşmazlıklar</h2>
              <p className="text-muted-foreground">
                Kullanım koşullarıyla ilgili her türlü soru ve bildirimleriniz için{' '}
                <a href="mailto:info@hesapera.com.tr" className="text-primary hover:underline font-semibold">
                  info@hesapera.com.tr
                </a>{' '}
                veya{' '}
                <Link href="/iletisim" className="text-primary hover:underline font-semibold">
                  İletişim
                </Link>{' '}
                sayfamız aracılığıyla bize ulaşabilirsiniz.
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
            <Link href="/cerez" className="text-muted-foreground hover:text-primary transition-colors">
              Çerez Politikası →
            </Link>
          </div>
        </div>
      </SiteContainer>
    </main>
  );
}
