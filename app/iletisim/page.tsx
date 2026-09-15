import { Metadata } from 'next';
import { SiteContainer } from '@/components/layout/site-container';
import { ContactForm } from '@/components/contact/contact-form';
import { Mail, Clock, MessageSquare, HelpCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'İletişim | Hesapera',
  description: 'Hesapera ekibiyle iletişime geçin. Görüş, öneri, hesaplama aracı talepleri veya hata bildirimleri için bize dilediğiniz an ulaşabilirsiniz.',
  alternates: {
    canonical: 'https://www.hesapera.com.tr/iletisim',
  },
  openGraph: {
    title: 'İletişim | Hesapera',
    description: 'Hesapera ekibiyle iletişime geçin. Görüş, öneri, hesaplama aracı talepleri veya hata bildirimleri için bize dilediğiniz an ulaşabilirsiniz.',
    url: 'https://www.hesapera.com.tr/iletisim',
  },
};

export default function ContactPage() {
  const contactCards = [
    {
      icon: Mail,
      title: 'E-posta İle Ulaşın',
      desc: 'Her türlü soru ve kurumsal iş birlikleri için doğrudan e-posta gönderebilirsiniz.',
      info: 'info@hesapera.com.tr',
      href: 'mailto:info@hesapera.com.tr',
    },
    {
      icon: Clock,
      title: 'Yanıt Süremiz',
      desc: 'Mesajlarınız iş günlerinde genellikle 24 saat içinde yanıtlanmaktadır.',
      info: 'Pzt - Cuma / 09:00 - 18:00',
    },
    {
      icon: MessageSquare,
      title: 'Araç Talepleri',
      desc: 'Görmek istediğiniz yeni bir hesaplama aracını form üzerinden doğrudan iletebilirsiniz.',
      info: 'Topluluk Odaklı Geliştirme',
    },
  ];

  const faqs = [
    {
      q: 'Hesaplama sonuçları ne kadar güncel?',
      a: 'Tüm finansal oranlar, vergi dilimleri ve mevzuat katsayıları Resmi Gazete ve ilgili bakanlık tebliğleri doğrultusunda düzenli olarak güncellenir.',
    },
    {
      q: 'Hesapera kullanımı ücretli mi?',
      a: 'Hayır, platform üzerindeki tüm hesaplama araçları, formüller ve rehber içerikler tamamen ücretsizdir.',
    },
    {
      q: 'Hesaplamalarda girdiğim veriler saklanıyor mu?',
      a: 'Kesinlikle hayır. Hesaplama girdileriniz sunuculara iletilmez veya veri tabanlarında depolanmaz. Tüm matematiksel işlemler tarayıcınızda yerel olarak gerçekleşir.',
    },
  ];

  return (
    <main className="flex-1 py-12 md:py-20 bg-muted/10">
      <SiteContainer>
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-4">
            Bizimle İletişime Geçin
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            Hesapera hakkındaki görüşleriniz, yeni hesaplayıcı önerileriniz veya karşılaştığınız teknik konular için buradayız.
          </p>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 max-w-5xl mx-auto">
          {contactCards.map((card, idx) => (
            <div 
              key={idx}
              className="p-6 rounded-2xl bg-surface-container-lowest border border-border/60 shadow-sm flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="p-3 w-fit rounded-xl bg-primary/10 text-primary">
                  <card.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-foreground">{card.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {card.desc}
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-border/50">
                {card.href ? (
                  <a 
                    href={card.href} 
                    className="text-sm font-semibold text-primary hover:underline"
                  >
                    {card.info}
                  </a>
                ) : (
                  <span className="text-sm font-semibold text-foreground">
                    {card.info}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid: Form + FAQ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-5xl mx-auto mb-16">
          <div className="lg:col-span-7">
            <ContactForm />
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 sm:p-8 rounded-2xl bg-surface-container-lowest border border-border/60 shadow-sm space-y-4">
              <div className="flex items-center gap-3 text-primary">
                <HelpCircle className="w-6 h-6" />
                <h3 className="text-lg font-bold text-foreground">Sıkça Sorulan Sorular</h3>
              </div>
              <div className="space-y-4 pt-2">
                {faqs.map((faq, i) => (
                  <div key={i} className="space-y-1.5 border-b border-border/40 pb-3 last:border-0 last:pb-0">
                    <h4 className="text-sm font-semibold text-foreground">{faq.q}</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                ))}
              </div>
              <div className="pt-2">
                <Link
                  href="/rehber"
                  className="inline-flex items-center text-xs font-semibold text-primary hover:underline gap-1"
                >
                  Hesaplama rehberlerimize göz atın
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </SiteContainer>
    </main>
  );
}
