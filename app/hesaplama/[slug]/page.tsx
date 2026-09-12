import { SiteContainer } from '@/components/layout/site-container';
import { CalculatorContentBlock } from '@/components/calculator/calculator-content-block';
import { ComingSoon } from '@/components/calculator/coming-soon';
import { CalculatorBreadcrumb } from '@/components/calculator/calculator-breadcrumb';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { CalculatorRegistry } from '@/calculators/core/calculator-registry';
import { calculatorToViewModel } from '@/calculators/core/calculator-types';
import '@/calculators/core/init'; // Ensure registry is initialized
import { CalculatorForm } from '@/components/calculator/calculator-form';
import { LoanCalculatorForm } from '@/components/calculator/loan-calculator-form';
import { ConsumerLoanForm } from '@/components/calculator/consumer-loan-form';
import { MortgageLoanForm } from '@/components/calculator/mortgage-loan-form';
import { AdBanner } from '@/components/ads/ad-banner';
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
    };
  }

  return {
    title: calculator.metadata.title,
    description: calculator.metadata.description,
    keywords: calculator.metadata.keywords?.join(', '),
    alternates: {
      canonical: calculator.metadata.canonical,
    }
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

  const categoryMap: Record<string, string> = {
    'finance': 'Finans',
    'math': 'Matematik',
    'health': 'Sağlık',
    'education': 'Eğitim',
    'conversion': 'Dönüştürücü',
    'other': 'Diğer'
  };

  const breadcrumbItems = [
    { label: 'Hesapera', href: '/' },
    { label: categoryMap[calculator.category] || 'Hesaplama', href: '/hesaplama' },
    { label: calculator.name }
  ];

  const calculatorViewModel = calculatorToViewModel(calculator);

  const CalcIcon = calculator.metadata.icon ? (LucideIcons as any)[calculator.metadata.icon] || LucideIcons.Calculator : LucideIcons.Calculator;

  return (
    <main className="flex-1 pb-16 bg-[#F8FAFC]">
      <SiteContainer className="pt-4 md:pt-6">
        <CalculatorBreadcrumb items={breadcrumbItems} />
        
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

        <AdBanner placement="calculator-after-content" />
      </SiteContainer>
    </main>
  );
}
