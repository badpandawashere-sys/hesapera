import { Metadata } from 'next';
import Link from 'next/link';

const title = "Hesapera | Modern Hesaplama Platformu";
const description = "Türkiye'nin en gelişmiş, ücretsiz ve modern hesaplama platformu.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: 'https://www.hesapera.com.tr/',
  },
  openGraph: {
    title,
    description,
    url: 'https://www.hesapera.com.tr/',
  },
  twitter: {
    title,
    description,
  },
};
import { Search, ArrowRight, Shield, Building, Wallet, Receipt, Car, CreditCard, WalletCards, Percent, CalendarDays, HeartPulse, Banknote } from 'lucide-react';
import { SiteContainer } from '@/components/layout/site-container';
import { FeaturedCalculatorCard } from '@/components/cards/featured-calculator-card';
import { categories } from '@/lib/data/categories';
import { CalculatorRegistry } from '@/calculators/core/calculator-registry';
import '@/calculators/core/init';
import { CalculatorSearch } from '@/components/calculator/calculator-search';
import { AdBanner } from '@/components/ads/ad-banner';
import { JsonLd, getHomepageJsonLd } from '@/components/seo/json-ld';

export default function HomePage() {
  const popularConfig = [
    { slug: 'kredi', icon: CreditCard },
    { slug: 'ihtiyac-kredisi', icon: WalletCards },
    { slug: 'yuzde', icon: Percent },
    { slug: 'yas', icon: CalendarDays },
    { slug: 'vucut-kitle-endeksi', icon: HeartPulse },
  ];

  const popularCalculators = popularConfig.map(config => {
    const calc = CalculatorRegistry.getBySlug(config.slug);
    if (!calc || calc.status !== 'published') return null;
    return {
      id: calc.id,
      slug: calc.slug,
      title: calc.name,
      desc: calc.shortDescription,
      href: `/hesaplama/${calc.slug}`,
      icon: config.icon
    };
  }).filter((item): item is NonNullable<typeof item> => item !== null);

  const activeCategories = categories.map(cat => {
    const publishedCount = CalculatorRegistry.getPublishedByCategory(cat.id).length;
    return { ...cat, publishedCount, dynamicCountText: `${publishedCount} Araç` };
  }).filter(cat => cat.publishedCount > 0);

  return (
    <main className="w-full flex-grow relative overflow-hidden">
      <JsonLd data={getHomepageJsonLd()} />
      <div className="absolute inset-x-0 top-0 h-[1000px] pointer-events-none -z-10 overflow-hidden">
        {/* Top Center: Soft Violet (More prominent brand color) */}
        <div className="absolute top-[-10%] left-[15%] w-[60%] h-[500px] rounded-full bg-violet-600 opacity-[0.15] blur-[100px] animate-ambient-drift"></div>
        
        {/* Top Right: Soft Purple */}
        <div className="absolute top-[5%] right-[-10%] w-[50%] h-[600px] rounded-full bg-purple-600 opacity-[0.12] blur-[90px] animate-ambient-drift-reverse" style={{ animationDelay: '-7s' }}></div>
        
        {/* Bottom Left: Soft Blue (Calmer) */}
        <div className="absolute top-[40%] left-[-10%] w-[50%] h-[550px] rounded-full bg-blue-500 opacity-[0.08] blur-[110px] animate-ambient-drift" style={{ animationDelay: '-14s' }}></div>
      </div>

      {/* Top Trust & Status Ribbon */}
      <section className="w-full bg-surface-container-low/80 backdrop-blur-sm py-space-xs border-b border-border/50">
        <SiteContainer className="flex flex-wrap items-center justify-between gap-space-sm">
          <div className="flex items-center gap-space-md">
            <span className="inline-flex items-center gap-1.5 font-label-md text-label-md text-tertiary">
              <Shield className="w-4 h-4 fill-current" />
              Resmi mevzuat ve güncel katsayılarla hesaplama
            </span>
            <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-outline-variant"></span>
            <span className="hidden sm:inline font-body-sm text-body-sm text-on-surface-variant">
              Gelir İdaresi, TCMB ve SGK güncel verileri aktiftir.
            </span>
          </div>
        </SiteContainer>
      </section>

      {/* Hero Section */}
      <section className="relative w-full py-space-xl md:py-space-2xl">
        <SiteContainer className="relative flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-space-xs px-space-md py-1.5 rounded-full bg-secondary-container/70 shadow-sm mb-space-md">
            <span className="text-primary font-label-md text-label-md">Top 14 Kategori</span>
            <span className="text-on-secondary-container/50 text-[11px]">â€¢</span>
            <span className="text-on-secondary-container font-label-md text-label-md">120+ Doğrulanmış Hesaplama Aracı</span>
          </div>
          
          <h1 className="font-display-hero text-display-hero text-on-surface tracking-tight max-w-4xl mx-auto mb-space-sm">
            Aradığın hesabı saniyeler içinde yap.
          </h1>
          
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto mb-space-xl">
            Finans, kredi, maaş, vergi, otomotiv, eğitim ve günlük hayat için güncel mevzuat ve doğrulanmış formüllerle çalışan pratik hesaplama araçları.
          </p>
          
          <div className="w-full max-w-[720px] mb-space-md">
            <CalculatorSearch />
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-space-xs max-w-3xl">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mr-space-2xs">Sık Arananlar:</span>
              {[
                { label: 'Kredi hesaplama', slug: '/hesaplama/kredi' },
                { label: 'Kıdem tazminatı', isComingSoon: true },
                { label: 'MTV hesaplama', isComingSoon: true },
                { label: 'Yüzde hesaplama', slug: '/hesaplama/yuzde' },
                { label: 'Yakıt tüketimi', isComingSoon: true },
                { label: 'KDV hesaplama', isComingSoon: true },
                { label: 'Mevduat getirisi', slug: '/hesaplama/vadeli-mevduat-faizi' },
              ].map((item) => {
                if (item.slug) {
                  return (
                    <Link key={item.label} href={item.slug} className="px-space-sm py-1 rounded-full bg-surface-container-low hover:bg-surface-container text-on-surface font-label-sm text-label-sm shadow-sm transition-colors block text-center">
                      {item.label}
                    </Link>
                  );
                }
                return (
                  <button key={item.label} className="px-space-sm py-1 rounded-full bg-surface-container-low/50 text-on-surface/50 font-label-sm text-label-sm border border-transparent hover:border-surface-container-high cursor-not-allowed transition-colors block text-center" type="button" title="Çok Yakında">
                    {item.label} <span className="ml-1 text-[9px] font-bold text-orange-500 uppercase">Yakında</span>
                  </button>
                );
              })}
            </div>
        </SiteContainer>
      </section>

      {/* Popüler Hesaplayıcılar Section */}
      <section className="w-full py-space-3xl relative z-10">
        <SiteContainer>
          <div className="flex flex-col text-center items-center mb-space-2xl">
            <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">Popüler Hesaplayıcılar</h2>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">En çok ihtiyaç duyulan hesaplamalara hızlıca ulaşın.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {popularCalculators.map((item) => (
              <Link 
                key={item!.id} 
                href={item!.href} 
                className="group flex flex-col p-6 rounded-[24px] bg-[var(--color-glass-bg)] backdrop-blur-[18px] border border-[var(--color-glass-border)] shadow-[var(--shadow-glass-standard)] hover:shadow-[var(--shadow-glass-elevated)] hover:-translate-y-[2px] transition-all duration-200 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 blur-3xl rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="flex items-start gap-4 relative z-10">
                  <div className="w-12 h-12 rounded-[14px] bg-white/50 border border-white/70 shadow-sm text-[#7C3AED] flex items-center justify-center flex-shrink-0 group-hover:bg-gradient-to-br group-hover:from-[#7C3AED] group-hover:to-[#2563EB] group-hover:text-white group-hover:border-transparent transition-all duration-200">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-headline-sm text-headline-sm text-slate-900 mb-1 group-hover:text-[#7C3AED] transition-colors">
                      {item.title}
                    </h3>
                    <p className="font-body-sm text-body-sm text-slate-600 line-clamp-2 mb-4">
                      {item.desc}
                    </p>
                    <div className="inline-flex items-center gap-1 font-label-md text-label-md text-[#2563EB] font-semibold">
                      <span>Hesapla</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </SiteContainer>
      </section>

      <SiteContainer className="py-space-md">
        <AdBanner placement="homepage-after-popular" />
      </SiteContainer>

      {/* Categories Section */}
      <section className="w-full py-space-3xl relative z-10">
        <SiteContainer>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-space-2xl gap-space-md">
            <div>
              <div className="font-label-sm text-label-sm text-[#7C3AED] uppercase tracking-wider mb-space-2xs">Kapsamlı Araç Seti</div>
              <h2 className="font-headline-lg text-headline-lg text-on-surface">Ne hesaplamak istiyorsun?</h2>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">İhtiyacın olan alana göre kategorilere ayrılmış kapsamlı araç seti.</p>
            </div>
            <Link className="inline-flex items-center gap-1 font-label-lg text-label-lg text-[#7C3AED] hover:text-primary-container group transition-colors" href="/kategoriler">
              <span>Tüm 14 Kategoriyi İncele</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {activeCategories.map((cat) => (
              <Link key={cat.id} href={`/kategoriler/${cat.id}`} className="group flex flex-col p-4 rounded-[20px] bg-[var(--color-glass-bg)] backdrop-blur-[12px] border border-[var(--color-glass-border)] shadow-[var(--shadow-glass-subtle)] hover:shadow-[var(--shadow-glass-standard)] hover:-translate-y-[2px] transition-all duration-200">
                <div className={`w-11 h-11 rounded-[12px] bg-white/60 border border-white/70 shadow-sm ${cat.color} flex items-center justify-center mb-3 group-hover:scale-105 transition-transform`}>
                  <cat.icon className="w-[22px] h-[22px]" />
                </div>
                <span className="font-headline-sm text-headline-sm text-slate-900 text-[16px] leading-tight mb-1">{cat.name}</span>
                <span className="font-body-sm text-body-sm text-slate-500">{cat.dynamicCountText}</span>
              </Link>
            ))}
          </div>
        </SiteContainer>
      </section>

      {/* Featured Interactive Calculators Section */}
      <section className="w-full py-space-3xl md:py-space-4xl relative z-10">
        <SiteContainer>
          <div className="flex flex-col mb-space-2xl">
            <div className="flex items-center gap-space-xs mb-space-2xs">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
              <span className="font-label-sm text-label-sm text-primary uppercase tracking-wider">Hızlı Simülasyon</span>
            </div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface">Öne Çıkan Hesaplamalar</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              En sık kullanılan 4 temel hesaplama aracını doğrudan parametreleriyle inceleyin.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-space-lg">
            <FeaturedCalculatorCard 
              title="Konut Kredisi Hesaplama"
              desc="Banka komisyonları ve taksit planlaması."
              category="Kredi"
              icon={Building}
              badge="2025 Güncel Faiz Oranları"
              href="/hesaplama/konut-kredisi"
              colorClass="text-primary"
              bgClass="bg-primary-fixed/60"
              previewData={[
                { label: 'Kredi Tutarı', value: 'â‚º1.500.000' },
                { label: 'Vade Süresi', value: '120 Ay (10 Yıl)' },
                { label: 'Aylık Faiz', value: '%2.89', valueClass: 'text-primary' },
              ]}
              resultLabel="Aylık Taksit"
              resultValue="â‚º44.250"
              actionText="Detaylı Hesapla"
            />
            <FeaturedCalculatorCard 
              title="Netten Brüte Maaş"
              desc="SGK, gelir vergisi ve damga vergisi kesintileri."
              category="Maaş"
              icon={Wallet}
              badge="2025 Asgari Ücret & Dilimler"
              href="/hesaplama/maas-hesaplama"
              colorClass="text-tertiary"
              bgClass="bg-tertiary-fixed/60"
              previewData={[
                { label: 'Net Hedef Maaş', value: 'â‚º45.000' },
                { label: 'Vergilendirme Yılı', value: '2025 Mali Yılı' },
                { label: 'SGK Muafiyeti', value: 'Uygulanıyor', valueClass: 'text-tertiary' },
              ]}
              resultLabel="Gereken Brüt"
              resultValue="â‚º63.120"
              actionText="Maaş Cetvelini Gör"
            />
            <FeaturedCalculatorCard 
              title="Kıdem ve İhbar Tazminatı"
              desc="Kıdem tavanı ve damga vergisi dahil net tutar."
              category="Çalışma"
              icon={Receipt}
              badge="Tavan Ücret Güncellendi"
              href="/hesaplama/kidem-tazminati"
              colorClass="text-secondary"
              bgClass="bg-secondary-fixed"
              previewData={[
                { label: 'Giydirilmiş Brüt', value: 'â‚º35.000' },
                { label: 'Çalışma Süresi', value: '4 Yıl 3 Ay' },
                { label: 'İhbar Süresi', value: '8 Hafta' },
              ]}
              resultLabel="Tahmini Tazminat"
              resultValue="â‚º148.750"
              actionText="Tazminat Hesapla"
            />
            <FeaturedCalculatorCard 
              title="Motorlu Taşıtlar Vergisi"
              desc="Tescil yılı ve motor silindir hacmi tarifesi."
              category="Otomotiv"
              icon={Car}
              badge="2025 Yeniden Değerleme"
              href="/hesaplama/mtv-hesaplama"
              colorClass="text-primary"
              bgClass="bg-surface-container-high"
              previewData={[
                { label: 'Araç Yaşı', value: '1 - 3 Yaş' },
                { label: 'Motor Hacmi', value: '1301 - 1600 cc' },
                { label: 'İlk İktisap', value: '2018 Sonrası' },
              ]}
              resultLabel="Yıllık Toplam MTV"
              resultValue="â‚º7.026"
              actionText="MTV Hesapla"
            />
          </div>
        </SiteContainer>
      </section>

      <SiteContainer className="py-space-md">
        <AdBanner placement="homepage-after-categories" />
      </SiteContainer>
    </main>
  );
}

