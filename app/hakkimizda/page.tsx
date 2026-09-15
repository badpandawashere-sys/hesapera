import { Metadata } from 'next';
import Link from 'next/link';
import { SiteContainer } from '@/components/layout/site-container';
import { 
  Calculator, 
  ShieldCheck, 
  Zap, 
  HeartHandshake, 
  Layers, 
  Users, 
  ArrowRight,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Hakkımızda | Hesapera',
  description: 'Hesapera, finans, matematik, sağlık, vergi ve günlük yaşam alanlarında hızlı, doğru ve ücretsiz hesaplama araçları sunan yeni nesil platformdur.',
  alternates: {
    canonical: 'https://www.hesapera.com.tr/hakkimizda',
  },
  openGraph: {
    title: 'Hakkımızda | Hesapera',
    description: 'Hesapera, finans, matematik, sağlık, vergi ve günlük yaşam alanlarında hızlı, doğru ve ücretsiz hesaplama araçları sunan yeni nesil platformdur.',
    url: 'https://www.hesapera.com.tr/hakkimizda',
  },
};

export default function AboutPage() {
  const stats = [
    { value: '40+', label: 'Yayınlanmış Hesaplama Aracı' },
    { value: '14', label: 'Ana Kategori' },
    { value: '%100', label: 'Ücretsiz & Reklamsız Deneyim' },
    { value: '0 ms', label: 'Anlık İstemci Hesaplaması' },
  ];

  const values = [
    {
      icon: ShieldCheck,
      title: 'Hassasiyet ve Doğruluk',
      description: 'Finansal formüller, mevzuat katsayıları ve matematiksel denklemler güncel standartlar ve resmi kaynaklar baz alınarak titizlikle test edilir.',
    },
    {
      icon: Zap,
      title: 'Işık Hızında Sonuç',
      description: 'Karmaşık formüller doğrudan cihazınızda çalışır. Sayfa yenilemeye ihtiyaç duymadan parametrelerinizi anlık olarak değiştirip sonuçları görebilirsiniz.',
    },
    {
      icon: HeartHandshake,
      title: 'Gizlilik ve Veri Güvenliği',
      description: 'Girdiğiniz kredi tutarları, maaş bilgileri veya kişisel veriler sunucularımıza kaydedilmez. Hesaplamalarınız tamamen sizin tarayıcınızda kalır.',
    },
    {
      icon: Layers,
      title: 'Kullanıcı Odaklı Tasarım',
      description: 'Gereksiz karmaşıklıktan arındırılmış, modern ve sade arayüzlerle aradığınız hesaplamaya tek tıkla ulaşmanızı sağlıyoruz.',
    },
  ];

  return (
    <main className="flex-1 py-12 md:py-20 bg-muted/10">
      <SiteContainer>
        {/* Hero Section */}
        <div className="max-w-3xl mx-auto text-center mb-16 md:mb-24">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Yeni Nesil Hesaplama Platformu
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-6 leading-tight">
            Karmaşık Hesaplamaları <br className="hidden sm:inline" />
            <span className="text-primary">Herkes İçin Basitleştiriyoruz</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed">
            Hesapera, bireylerin ve işletmelerin finans, vergi, eğitim, sağlık ve günlük hayatla ilgili karar alma süreçlerinde ihtiyaç duydukları tüm hesaplama araçlarını tek bir çatı altında sunar.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-20 max-w-5xl mx-auto">
          {stats.map((stat, i) => (
            <div 
              key={i} 
              className="p-6 rounded-2xl bg-surface-container-lowest border border-border/60 text-center shadow-sm"
            >
              <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-primary mb-1">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm font-medium text-muted-foreground">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20 max-w-5xl mx-auto">
          <div className="p-8 rounded-2xl bg-surface-container-lowest border border-border/60 shadow-sm space-y-4">
            <div className="p-3 w-fit rounded-xl bg-primary/10 text-primary">
              <Calculator className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Misyonumuz</h2>
            <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
              Kredi faizlerinden kıdem tazminatına, sınav puanlarından gebelik takvimine kadar hayatın her alanındaki hesaplama ihtiyaçlarını anlaşılır kılmak; kullanıcılarımızın güvenilir verilere en hızlı şekilde ulaşmasını sağlamaktır.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-surface-container-lowest border border-border/60 shadow-sm space-y-4">
            <div className="p-3 w-fit rounded-xl bg-primary/10 text-primary">
              <Users className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Vizyonumuz</h2>
            <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
              Türkiye&apos;nin en kapsamlı, güvenilir ve modern dijital hesaplama ekosistemini inşa ederek; veri analitiği, anlaşılır rehber içerikler ve akıllı simülasyon araçlarıyla milyonlarca kullanıcının günlük rehberi olmak.
            </p>
          </div>
        </div>

        {/* Values */}
        <div className="mb-20 max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
              Neden Hesapera&apos;yı Tercih Etmelisiniz?
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              Platformumuzu geliştirirken kullanıcı deneyimini, veri güvenliğini ve formül doğruluğunu temel ilkemiz kabul ediyoruz.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {values.map((v, i) => (
              <div 
                key={i} 
                className="p-6 sm:p-8 rounded-2xl bg-surface-container-lowest border border-border/60 shadow-sm flex flex-col sm:flex-row items-start gap-5"
              >
                <div className="p-3 rounded-xl bg-primary/10 text-primary shrink-0">
                  <v.icon className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">{v.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {v.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Commitment Checklist */}
        <div className="max-w-4xl mx-auto p-8 sm:p-10 rounded-2xl bg-surface-container-lowest border border-border/60 shadow-sm mb-16">
          <h3 className="text-xl font-bold text-foreground mb-6">Hesapera Standartları</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              'Güncel mevzuat ve yasal katsayılar',
              'Mobil ve tablet cihazlarla tam uyum',
              'Sonuçları PDF veya resim olarak paylaşma',
              'Adım adım detaylı hesaplama dökümleri',
              'Kullanıcı verisi toplamayan şeffaf altyapı',
              'Kapsamlı rehber ve açıklama içerikleri',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                <span className="text-sm text-foreground font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Contact CTA */}
        <div className="max-w-3xl mx-auto text-center p-8 sm:p-12 rounded-2xl bg-gradient-to-br from-primary/10 via-surface-container-low to-primary/5 border border-primary/20">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
            Görüş ve Önerileriniz Bizim İçin Değerli
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base mb-8 max-w-xl mx-auto">
            Yeni bir hesaplama aracı talebiniz, soru veya geri bildiriminiz mi var? Ekibimizle dilediğiniz zaman iletişime geçebilirsiniz.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/iletisim"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium text-sm shadow hover:bg-primary/90 transition-colors"
            >
              Bizimle İletişime Geçin
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/hesaplama"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-surface-container-lowest text-foreground font-medium text-sm border border-border hover:bg-muted/50 transition-colors"
            >
              Tüm Araçları Keşfedin
            </Link>
          </div>
        </div>
      </SiteContainer>
    </main>
  );
}
