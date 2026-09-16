import { SiteContainer } from '@/components/layout/site-container';
import { JsonLd, getCalculatorJsonLd } from '@/components/seo/json-ld';
import { CalculatorContentBlock } from '@/components/calculator/calculator-content-block';
import { ComingSoon } from '@/components/calculator/coming-soon';
import { Breadcrumbs } from '@/components/seo/breadcrumbs';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { CalculatorRegistry } from '@/calculators/core/calculator-registry';
import { calculatorToViewModel } from '@/calculators/core/calculator-types';
import '@/calculators/core/init'; // Ensure registry is initialized
import { CalculatorForm } from '@/components/calculator/calculator-form';
import { LoanCalculatorForm } from '@/components/calculator/loan-calculator-form';
import { ConsumerLoanForm } from '@/components/calculator/consumer-loan-form';
import { MortgageLoanForm } from '@/components/calculator/mortgage-loan-form';
import { VehicleLoanForm } from '@/components/calculator/vehicle-loan-form';
import { CreditCardMinimumPaymentForm } from '@/components/calculator/credit-card-minimum-payment-form';
import { LoanRestructuringForm } from '@/components/calculator/loan-restructuring-form';
import { GoldForm } from '@/components/calculator/gold-form';
import { CurrencyForm } from '@/components/calculator/currency-form';
import { InflationForm } from '@/components/calculator/inflation-form';
import { InterestForm } from '@/components/calculator/interest-form';
import { RentIncreaseForm } from '@/components/calculator/rent-increase-form';
import { TimeDepositForm } from '@/components/calculator/time-deposit-form';
import { KpssForm } from '@/components/calculator/kpss-form';
import { TytForm } from '@/components/calculator/tyt-form';
import { YksForm } from '@/components/calculator/yks-form';
import { LgsForm } from '@/components/calculator/lgs-form';
import { DersNotuForm } from '@/components/calculator/ders-notu-form';
import { TakdirTesekkurForm } from '@/components/calculator/takdir-tesekkur-form';
import { SavingsForm } from '@/components/calculator/savings-form';
import { CompoundGrowthForm } from '@/components/calculator/compound-growth-form';
import { SimpleInterestForm } from '@/components/calculator/simple-interest-form';
import { AgeForm } from '@/components/calculator/age-form';
import { FactorialForm } from '@/components/calculator/factorial-form';
import { HistoricalGoldForm } from '@/components/calculator/historical-gold-form';
import { PerimeterForm } from '@/components/calculator/perimeter-form';
import { AlanForm } from '@/components/calculator/alan-form';
import { KokluSayiForm } from '@/components/calculator/koklu-sayi-form';
import { EbobEkokForm } from '@/components/calculator/ebob-ekok-form';
import { HistoricalCurrencyForm } from '@/components/calculator/historical-currency-form';
import { IbanValidationForm } from '@/components/calculator/iban-validation-form';
import { CreditCardLateFeeForm } from '@/components/calculator/credit-card-late-fee-form';
import { MaxLoanAmountForm } from '@/components/calculator/max-loan-amount-form';
import { LoanAnnualCostRateForm } from '@/components/calculator/loan-annual-cost-rate-form';
import { VolumeForm } from '@/components/calculator/volume-form';
import { YakitTuketimiForm } from '@/components/calculator/yakit-tuketimi-form';
import { MetrekareForm } from '@/components/calculator/metrekare-form';
import { OranForm } from '@/components/calculator/oran-form';
import { PercentageForm } from '@/components/calculator/percentage-form';
import { IdealKiloForm } from '@/components/calculator/ideal-kilo-form';
import { KaloriIhtiyaciForm } from '@/components/calculator/kalori-ihtiyaci-form';
import { VkiForm } from '@/components/calculator/vki-form';
import { AdBanner } from '@/components/ads/ad-banner';
import { RelatedCalculators } from '@/components/calculator/related-calculators';
import { generatedPremiumForms } from '@/components/calculator/generated-premium-forms';
import * as LucideIcons from 'lucide-react';

interface CalculatorPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata(props: CalculatorPageProps): Promise<Metadata> {
  const { slug } = await props.params;
  const calculator = CalculatorRegistry.getBySlug(slug);

  if (!calculator) {
    return {
      title: 'Sayfa Bulunamadı | Hesapera',
    };
  }

  if (calculator.status === 'draft') {
    return {
      title: `Yakında: ${calculator.name} | Hesapera`,
      description: calculator.shortDescription,
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return {
    title: calculator.metadata.title,
    description: calculator.metadata.description,
    keywords: calculator.metadata.keywords?.join(', '),
    alternates: {
      canonical: calculator.metadata.canonical,
    },
    openGraph: {
      title: calculator.metadata.title,
      description: calculator.metadata.description,
      url: calculator.metadata.canonical,
    },
    twitter: {
      title: calculator.metadata.title,
      description: calculator.metadata.description,
    },
  };
}

export default async function CalculatorPage(props: CalculatorPageProps) {
  const { slug } = await props.params;
  const calculator = CalculatorRegistry.getBySlug(slug);

  if (!calculator) {
    notFound();
  }

  if (calculator.status === 'draft') {
    return <ComingSoon name={calculator.name} description={calculator.shortDescription} category={calculator.category} />;
  }

  const calculatorViewModel = calculatorToViewModel(calculator);
  const GeneratedPremiumForm = generatedPremiumForms[slug];

  const CalcIcon = calculator.metadata.icon ? (LucideIcons as any)[calculator.metadata.icon] || LucideIcons.Calculator : LucideIcons.Calculator;

  return (
    <main className="flex-1 pb-16 bg-[#F8FAFC]">
      <JsonLd data={getCalculatorJsonLd(calculator)} />
      <SiteContainer className="pt-4 md:pt-6">
        <Breadcrumbs category={calculator.category} calculatorName={calculator.name} calculatorSlug={calculator.slug} />
        
        <div className="mt-7 md:mt-9 flex flex-col lg:flex-row lg:items-start justify-between gap-6 md:gap-8">
          
          {/* Left Side: Icon + Title + Desc */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6 text-center md:text-left flex-1">
            <div className="w-16 h-16 md:w-[80px] md:h-[80px] rounded-[24px] bg-[#F5F3FF] border border-[#EDE9FE] shadow-sm flex items-center justify-center shrink-0">
              <CalcIcon className="w-8 h-8 md:w-10 md:h-10 text-[#7C3AED]" />
            </div>
            <div className="max-w-2xl mt-1 md:mt-2">
              <h1 className="text-[30px] md:text-[40px] font-bold text-[#0F172A] leading-tight font-sans">
                {calculator.name}
              </h1>
              <p className="mt-3 md:mt-4 text-[16px] md:text-[18px] text-[#475569] leading-relaxed">
                {calculator.shortDescription}
              </p>
            </div>
          </div>

          {/* Right Side: Info Box */}
          {calculator.metadata.infoBox && (
            <div className="w-full lg:w-[340px] shrink-0 bg-[var(--color-glass-bg-strong)] backdrop-blur-[12px] border border-[var(--color-glass-border)] rounded-[20px] md:rounded-[24px] p-5 md:p-6 flex items-start gap-4 shadow-[var(--shadow-glass-subtle)]">
              <div className="mt-0.5 shrink-0 text-[#7C3AED]">
                {(() => {
                  const InfoIcon = calculator.metadata.infoBox.icon ? (LucideIcons as any)[calculator.metadata.infoBox.icon] || LucideIcons.Info : LucideIcons.Info;
                  return <InfoIcon className="w-6 h-6" />;
                })()}
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-semibold text-[15px] md:text-[16px] text-[#4C1D95] leading-snug">{calculator.metadata.infoBox.title}</h3>
                <p className="mt-1.5 text-[14px] text-[#64748B] leading-relaxed">{calculator.metadata.infoBox.text}</p>
              </div>
            </div>
          )}
        </div>

        {/* Features Chips */}
        {calculator.metadata.features && calculator.metadata.features.length > 0 && (
          <div className="mt-6 md:mt-5 flex flex-wrap justify-center md:justify-start gap-3 md:gap-4 md:ml-[104px]">
            {calculator.metadata.features.map((feature, idx) => {
              const FeatIcon = feature.icon ? (LucideIcons as any)[feature.icon] || LucideIcons.CheckCircle2 : LucideIcons.CheckCircle2;
              return (
                <div key={idx} className="flex items-center gap-2 h-[40px] md:h-[44px] px-4 md:px-5 rounded-full bg-[#F5F3FF] border border-[#EDE9FE] shadow-sm hover:shadow-md transition-shadow">
                  <FeatIcon className="w-4 h-4 md:w-5 md:h-5 text-[#7C3AED]" />
                  <span className="text-[13px] md:text-[14px] font-medium text-[#475569]">{feature.label}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Divider */}
        <div className="mt-8 md:mt-10 border-t border-[#E2E8F0] mb-8 md:mb-12"></div>
      </SiteContainer>

      <SiteContainer>
        {slug === 'kredi' ? (
          <LoanCalculatorForm calculator={calculatorViewModel} />
        ) : slug === 'ihtiyac-kredisi' ? (
          <ConsumerLoanForm calculator={calculatorViewModel} />
        ) : slug === 'konut-kredisi' ? (
          <MortgageLoanForm calculator={calculatorViewModel} />
        ) : slug === 'tasit-kredisi' ? (
          <VehicleLoanForm calculator={calculatorViewModel} />
        ) : slug === 'kredi-karti-asgari-odeme-tutari' ? (
          <CreditCardMinimumPaymentForm calculator={calculatorViewModel} />
        ) : slug === 'kredi-yapilandirma' ? (
          <LoanRestructuringForm calculator={calculatorViewModel} />
        ) : slug === 'altin' ? (
          <GoldForm calculator={calculatorViewModel} />
        ) : slug === 'doviz' ? (
          <CurrencyForm calculator={calculatorViewModel} />
        ) : slug === 'enflasyon' ? (
          <InflationForm calculator={calculatorViewModel} />
        ) : slug === 'faiz' ? (
          <InterestForm calculator={calculatorViewModel} />
        ) : slug === 'kira-artis-orani' ? (
          <RentIncreaseForm calculator={calculatorViewModel} />
        ) : slug === 'vadeli-mevduat-faizi' ? (
          <TimeDepositForm calculator={calculatorViewModel} />
        ) : slug === 'kpss-puan' ? (
          <KpssForm calculator={calculatorViewModel} />
        ) : slug === 'tyt-puan' ? (
          <TytForm calculator={calculatorViewModel} />
        ) : slug === 'yks-puan' ? (
          <YksForm calculator={calculatorViewModel} />
        ) : slug === 'lgs-puan' ? (
          <LgsForm calculator={calculatorViewModel} />
        ) : slug === 'ders-notu' ? (
          <DersNotuForm calculator={calculatorViewModel} />
        ) : slug === 'takdir-tesekkur' ? (
          <TakdirTesekkurForm calculator={calculatorViewModel} />
        ) : slug === 'birikim' ? (
          <SavingsForm calculator={calculatorViewModel} />
        ) : slug === 'bilesik-buyume' ? (
          <CompoundGrowthForm calculator={calculatorViewModel} />
        ) : slug === 'basit-faiz' ? (
          <SimpleInterestForm calculator={calculatorViewModel} />
        ) : slug === 'vucut-kitle-endeksi' ? (
          <VkiForm calculator={calculatorViewModel} />
        ) : slug === 'gunluk-kalori-ihtiyaci' ? (
          <KaloriIhtiyaciForm calculator={calculatorViewModel} />
        ) : slug === 'ideal-kilo' ? (
          <IdealKiloForm calculator={calculatorViewModel} />
        ) : slug === 'yas' ? (
          <AgeForm calculator={calculatorViewModel} />
        ) : slug === 'yuzde' ? (
          <PercentageForm calculator={calculatorViewModel} />
        ) : slug === 'oran' ? (
          <OranForm calculator={calculatorViewModel} />
        ) : slug === 'metrekare' ? (
          <MetrekareForm calculator={calculatorViewModel} />
        ) : slug === 'hacim' ? (
          <VolumeForm calculator={calculatorViewModel} />
        ) : slug === 'faktoriyel' ? (
          <FactorialForm calculator={calculatorViewModel} />
        ) : slug === 'kredi-yillik-maliyet-orani' ? (
          <LoanAnnualCostRateForm calculator={calculatorViewModel} />
        ) : slug === 'ne-kadar-kredi-alabilirim' ? (
          <MaxLoanAmountForm calculator={calculatorViewModel} />
        ) : slug === 'kredi-karti-gecikme-faizi' ? (
          <CreditCardLateFeeForm calculator={calculatorViewModel} />
        ) : slug === 'iban-dogrulama' ? (
          <IbanValidationForm calculator={calculatorViewModel} />
        ) : slug === 'gecmis-altin-fiyatlari' ? (
          <HistoricalGoldForm calculator={calculatorViewModel} />
        ) : slug === 'gecmis-doviz-kurlari' ? (
          <HistoricalCurrencyForm calculator={calculatorViewModel} />
        ) : slug === 'ebob-ekok' ? (
          <EbobEkokForm calculator={calculatorViewModel} />
        ) : slug === 'koklu-sayi' ? (
          <KokluSayiForm calculator={calculatorViewModel} />
        ) : slug === 'alan' ? (
          <AlanForm calculator={calculatorViewModel} />
        ) : slug === 'cevre' ? (
          <PerimeterForm calculator={calculatorViewModel} />
        ) : slug === 'yakit-tuketimi' ? (
          <YakitTuketimiForm calculator={calculatorViewModel} />
        ) : GeneratedPremiumForm ? (
          <GeneratedPremiumForm calculator={calculatorViewModel} />
        ) : (
          <CalculatorForm calculator={calculatorViewModel} />
        )}
        
        {calculator.metadata.faq && calculator.metadata.faq.length > 0 && (
          <section className="mt-16 max-w-4xl mx-auto">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight mb-6">Sıkça Sorulan Sorular</h2>
            <div className="grid gap-4">
              {calculator.metadata.faq.map((faq, index) => (
                <div key={index} className="bg-card border p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-base text-foreground">{faq.question}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <CalculatorContentBlock content={calculator.metadata.content} />

        <RelatedCalculators category={calculator.category} currentSlug={calculator.slug} />

        <AdBanner placement="calculator-after-content" />
      </SiteContainer>
    </main>
  );
}
