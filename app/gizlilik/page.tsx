import { Metadata } from 'next';
import { SiteContainer } from '@/components/layout/site-container';
import Link from 'next/link';
import { Shield, Lock, Eye, Database, Globe, Bell } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Gizlilik Politikası | Hesapera',
  description: 'Hesapera gizlilik politikası: Hesaplama verilerinizin güvenliği, çerezler, analitik araçlar ve kullanıcı haklarınız hakkında kapsamlı bilgilendirme.',
  alternates: {
    canonical: 'https://www.hesapera.com.tr/gizlilik',
  },
  openGraph: {
    title: 'Gizlilik Politikası | Hesapera',
    description: 'Hesapera gizlilik politikası: Hesaplama verilerinizin güvenliği ve gizliliği hakkında bilgilendirme.',
    url: 'https://www.hesapera.com.tr/gizlilik',
  },
};

export default function PrivacyPage() {
  const lastUpdated = '15 Eylül 2026';

  return (
    <main className="flex-1 py-12 md:py-16 bg-muted/10">
      <SiteContainer>
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-10 text-center sm:text-left border-b border-border/60 pb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
              <Shield className="w-3.5 h-3.5" />
              Veri Güvenliği ve Şeffaflık
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mb-3">
              Gizlilik Politikası
            </h1>
            <p className="text-sm text-muted-foreground">
              Son Güncelleme Tarihi: <span className="text-foreground font-medium">{lastUpdated}</span>
            </p>
          </div>

          {/* Key Highlight Banner */}
          <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 mb-10 flex items-start gap-4">
            <Lock className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h2 className="text-base font-bold text-emerald-900">Hesaplama Verileriniz Kaydedilmez</h2>
              <p className="text-sm text-emerald-800 leading-relaxed">
                Hesapera üzerindeki tüm hesaplama araçlarında girdiğiniz maaş, kredi, sağlık veya şahsi veriler <strong>sunucularımıza kaydedilmez</strong>. İşlemlerinizin tamamı tarayıcınızda (istemci tarafında) anlık olarak işlenir ve gizliliğiniz %100 korunur.
              </p>
            </div>
          </div>

          {/* Legal Content Prose */}
          <div className="space-y-10 text-foreground text-sm sm:text-base leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                <Eye className="w-5 h-5 text-primary" />
                1. Giriş ve Kapsam
              </h2>
              <p className="text-muted-foreground">
                Hesapera (&quot;hesapera.com.tr&quot;, &quot;Platform&quot;), kullanıcılarının gizlilik haklarına saygı duymayı ve kişisel verilerin güvenliğini sağlamayı temel ilke kabul etmiştir. Bu Gizlilik Politikası, web sitemizi ziyaret ettiğinizde elde edilen bilgilerin niteliğini, kullanım amaçlarını ve bu bilgilerin nasıl korunduğunu açıklamaktadır.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                <Database className="w-5 h-5 text-primary" />
                2. Toplanan Bilgiler ve Toplama Yöntemleri
              </h2>
              <p className="text-muted-foreground">
                Hesapera, minimum veri toplama prensibini benimser:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-2">
                <li>
                  <strong className="text-foreground">Hesaplama Verileri:</strong> Hesaplama araçlarına girdiğiniz hiçbir sayısal veya kişisel parametre sunucularımıza iletilmez ve kaydedilmez. Tüm hesaplamalar tarayıcınızda (istemci tarafında) anlık olarak gerçekleşir.
                </li>
                <li>
                  <strong className="text-foreground">İletişim Verileri:</strong> İletişim formu üzerinden gönderilen mesajlar sunucu veritabanımızda saklanmaz; form, verilerinizi e-posta uygulamanız aracılığıyla doğrudan resmi adresimize (info@hesapera.com.tr) iletmek üzere hazırlar. Tarafımıza iletilen e-postalar yalnızca sorunuzu yanıtlamak amacıyla kullanılır.
                </li>
                <li>
                  <strong className="text-foreground">Teknik ve Trafik Verileri:</strong> Platformun performansını ve güvenliğini sağlamak için IP adresi, tarayıcı türü, işletim sistemi, ziyaret saati gibi anonim teknik veriler sunucu günlüklerinde geçici olarak tutulabilir.
                </li>
                <li>
                  <strong className="text-foreground">Analitik Veriler:</strong> Ziyaretçilerimizin deneyimini iyileştirmek ve popüler araçları belirlemek amacıyla Google Analytics gibi standart analitik araçları anonimleştirilmiş verilerle kullanılmaktadır.
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                3. Çerezler (Cookies)
              </h2>
              <p className="text-muted-foreground">
                Sitemizde temel site fonksiyonlarını çalıştırmak ve kullanım istatistiklerini derlemek amacıyla çerezler kullanılmaktadır. Çerez kullanımına dair detaylı bilgiye ve çerez tercihlerinizi nasıl yönetebileceğinize{' '}
                <Link href="/cerez" className="text-primary hover:underline font-medium">
                  Çerez Politikası
                </Link>{' '}
                sayfamızdan ulaşabilirsiniz.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                4. Bilgi Güvenliği ve Üçüncü Taraflarla Paylaşım
              </h2>
              <p className="text-muted-foreground">
                Hesapera, kullanıcı bilgilerini ticari amaçlarla üçüncü kişilere satmaz, kiralamaz veya ticaretini yapmaz. İletişim formu aracılığıyla ilettiğiniz bilgiler, yasal zorunluluklar (mahkeme kararları, savcılık talepleri vb.) haricinde üçüncü şahıs ve kurumlarla paylaşılmaz.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                5. Dış Bağlantılar (Harici Linkler)
              </h2>
              <p className="text-muted-foreground">
                Platformumuz, bilgilendirme amaçlı olarak üçüncü taraf web sitelerine (örneğin resmi kurumlar, mevzuat kaynakları) bağlantılar içerebilir. Bu sitelerin gizlilik politikalarından veya içeriklerinden Hesapera sorumlu değildir.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold">6. Politikadaki Değişiklikler</h2>
              <p className="text-muted-foreground">
                Hesapera, yasal mevzuattaki değişiklikler veya platform işlevlerindeki yenilikler doğrultusunda bu Gizlilik Politikası&apos;nı dilediği zaman güncelleyebilir. Güncellenen metin bu sayfada yayımlandığı andan itibaren geçerlilik kazanır.
              </p>
            </section>

            <section className="space-y-3 border-t border-border/60 pt-8">
              <h2 className="text-xl font-bold">İletişim</h2>
              <p className="text-muted-foreground">
                Gizlilik Politikamız veya veri işleme süreçlerimizle ilgili sorularınız için bizimle{' '}
                <a href="mailto:info@hesapera.com.tr" className="text-primary hover:underline font-semibold">
                  info@hesapera.com.tr
                </a>{' '}
                adresi üzerinden iletişime geçebilirsiniz.
              </p>
            </section>
          </div>

          {/* Quick links to other legal docs */}
          <div className="mt-12 pt-8 border-t border-border/60 flex flex-wrap gap-4 text-sm">
            <Link href="/kvkk" className="text-muted-foreground hover:text-primary transition-colors">
              KVKK Aydınlatma Metni →
            </Link>
            <Link href="/cerez" className="text-muted-foreground hover:text-primary transition-colors">
              Çerez Politikası →
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
