import { Metadata } from 'next';
import { SiteContainer } from '@/components/layout/site-container';
import Link from 'next/link';
import { ShieldCheck, FileCheck, UserCheck, HelpCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'KVKK Aydınlatma Metni | Hesapera',
  description: '6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) uyarınca kişisel verilerinizin işlenme amaçları, hukuki sebepleri ve haklarınız hakkında aydınlatma metni.',
  alternates: {
    canonical: 'https://www.hesapera.com.tr/kvkk',
  },
  openGraph: {
    title: 'KVKK Aydınlatma Metni | Hesapera',
    description: '6698 sayılı Kişisel Verilerin Korunması Kanunu uyarınca aydınlatma metni.',
    url: 'https://www.hesapera.com.tr/kvkk',
  },
};

export default function KvkkPage() {
  const lastUpdated = '15 Eylül 2026';

  return (
    <main className="flex-1 py-12 md:py-16 bg-muted/10">
      <SiteContainer>
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-10 text-center sm:text-left border-b border-border/60 pb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
              <ShieldCheck className="w-3.5 h-3.5" />
              6698 Sayılı Kanun Kapsamında
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mb-3">
              KVKK Aydınlatma Metni
            </h1>
            <p className="text-sm text-muted-foreground">
              Son Güncelleme Tarihi: <span className="text-foreground font-medium">{lastUpdated}</span>
            </p>
          </div>

          <div className="space-y-10 text-foreground text-sm sm:text-base leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-primary" />
                1. Veri Sorumlusu Sıfatı
              </h2>
              <p className="text-muted-foreground">
                6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;) uyarınca, Hesapera (&quot;hesapera.com.tr&quot;) olarak, veri sorumlusu sıfatıyla, kişisel verilerinizi aşağıda açıklanan amaçlar ve hukuki çerçevede işlemekte, muhafaza etmekte ve korumaktayız.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-primary" />
                2. İşlenen Kişisel Veriler ve İşleme Amaçları
              </h2>
              <p className="text-muted-foreground">
                Hesapera web platformu üzerinden hesaplama araçlarını kullanırken girdiğiniz parametrik değerler (tutar, faiz oranı, yaş, kilo vb.) <strong>sunucularımızda saklanmamakta ve işlenmemektedir</strong>.
              </p>
              <p className="text-muted-foreground">
                Sitemizdeki iletişim formu verilerinizi bir sunucu veritabanına kaydetmez; mesajınızı doğrudan e-posta uygulamanız aracılığıyla resmi adresimize (info@hesapera.com.tr) iletmeniz için köprü görevi görür. Tarafımıza doğrudan e-posta göndermeniz halinde;
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-2">
                <li><strong className="text-foreground">Kimlik ve İletişim Bilgileri:</strong> Ad, soyad ve e-posta adresi (tarafınıza geri dönüş sağlamak, sorularınızı yanıtlamak amacıyla),</li>
                <li><strong className="text-foreground">İşlem Güvenliği Bilgileri:</strong> IP adresi, tarayıcı bilgileri, log kayıtları (yasal yükümlülüklerimizi yerine getirmek ve platform güvenliğini sağlamak amacıyla),</li>
              </ul>
              <p className="text-muted-foreground">
                KVKK Madde 5 ve Madde 6 çerçevesinde belirtilen kişisel veri işleme şartlarına uygun olarak işlenmektedir.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold">3. Kişisel Verilerin Aktarılması</h2>
              <p className="text-muted-foreground">
                Toplanan kişisel verileriniz; kanunen yetkili kamu kurum ve kuruluşları ile adli makamların talepleri dışında kesinlikle üçüncü kişi veya kurumlara aktarılmamakta ve ticari amaçlarla kullanılmamaktadır.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold">4. Kişisel Veri Toplamanın Hukuki Sebebi</h2>
              <p className="text-muted-foreground">
                Kişisel verileriniz, KVKK&apos;nın 5. maddesinde yer alan &quot;Bir hakkın tesisi, kullanılması veya korunması için veri işlemenin zorunlu olması&quot;, &quot;Veri sorumlusunun hukuki yükümlülüğünü yerine getirebilmesi için zorunlu olması&quot; ve &quot;Temel hak ve özgürlüklerinize zarar vermemek kaydıyla meşru menfaatlerimiz için veri işlenmesinin zorunlu olması&quot; hukuki sebeplerine dayalı olarak elektronik ortamda toplanmaktadır.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-primary" />
                5. İlgili Kişinin Hakları (KVKK Madde 11)
              </h2>
              <p className="text-muted-foreground">
                KVKK&apos;nın 11. maddesi uyarınca veri sahipleri;
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-2">
                <li>Kişisel verilerinin işlenip işlenmediğini öğrenme,</li>
                <li>Kişisel verileri işlenmişse buna ilişkin bilgi talep etme,</li>
                <li>İşlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme,</li>
                <li>Yurt içinde veya yurt dışında kişisel verilerin aktarıldığı üçüncü kişileri bilme,</li>
                <li>Kişisel verilerin eksik veya yanlış işlenmiş olması hâlinde bunların düzeltilmesini isteme,</li>
                <li>KVKK&apos;nın 7. maddesinde öngörülen şartlar çerçevesinde verilerin silinmesini veya yok edilmesini isteme,</li>
                <li>İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhine bir sonucun ortaya çıkmasına itiraz etme haklarına sahiptir.</li>
              </ul>
            </section>

            <section className="space-y-3 border-t border-border/60 pt-8">
              <h2 className="text-xl font-bold">6. Başvuru ve Bilgi Edinme</h2>
              <p className="text-muted-foreground">
                KVKK kapsamındaki haklarınıza ilişkin taleplerinizi yazılı olarak veya kayıtlı e-posta adresiniz vasıtasıyla{' '}
                <a href="mailto:info@hesapera.com.tr" className="text-primary hover:underline font-semibold">
                  info@hesapera.com.tr
                </a>{' '}
                adresine iletebilirsiniz. Talepleriniz en geç 30 (otuz) gün içerisinde ücretsiz olarak sonuçlandırılacaktır.
              </p>
            </section>
          </div>

          {/* Quick links to other legal docs */}
          <div className="mt-12 pt-8 border-t border-border/60 flex flex-wrap gap-4 text-sm">
            <Link href="/gizlilik" className="text-muted-foreground hover:text-primary transition-colors">
              Gizlilik Politikası →
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
