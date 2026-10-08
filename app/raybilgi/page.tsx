import { Metadata } from 'next';
import Link from 'next/link';
import { SiteContainer } from '@/components/layout/site-container';
import { TrainFront, FileSpreadsheet, Calculator, Ruler, Train, Wrench, Lock, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'RayBilgi – Demiryolu ve Vagon Araçları | Hesapera',
  description: 'Demiryolu operasyonları, vagon işlemleri, tren hazırlığı ve saha hesaplamaları için pratik RayBilgi araçları.',
  alternates: {
    canonical: 'https://www.hesapera.com.tr/raybilgi',
  },
};

const modules = [
  {
    id: 'gvd',
    name: 'GVD',
    description: 'Vagon durumlarını ve operasyon hareketlerini düzenlemeye yardımcı araçlar.',
    icon: FileSpreadsheet,
  },
  {
    id: 'thbf',
    name: 'THBF',
    description: 'Tren hazırlık ve belge işlemlerine yardımcı araçlar.',
    icon: TrainFront,
  },
  {
    id: '5600',
    name: '5600',
    description: 'Tren ve vagon operasyonlarında kullanılan hesaplama ve kayıt araçları.',
    icon: Calculator,
  },
  {
    id: 'dara',
    name: 'Dara / Metre',
    description: 'Vagon dara, uzunluk ve ilgili saha hesaplamaları.',
    icon: Ruler,
  },
  {
    id: 'ceker',
    name: 'Çeker Bilgi',
    description: 'Lokomotif ve çekiş bilgilerine hızlı erişim.',
    icon: Train,
  },
  {
    id: 'teknik',
    name: 'Teknik Bilgiler',
    description: 'Demiryolu ekipmanları ve operasyonlarda kullanılan teknik bilgiler.',
    icon: Wrench,
  },
];

export default function RayBilgiPage() {
  return (
    <main className="flex-1 py-12 bg-muted/10">
      <SiteContainer>
        <div className="mb-10 max-w-3xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-violet-100 text-violet-700 rounded-xl">
              <TrainFront className="w-8 h-8" strokeWidth={1.5} />
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground">
              RayBilgi
            </h1>
          </div>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed font-medium">
            Demiryolu operasyonlarını kolaylaştıran pratik araçlar
          </p>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed mt-4">
            Vagon takibi, tren hazırlığı, teknik bilgiler ve saha hesaplamaları için geliştirilen RayBilgi araçlarına tek noktadan ulaşın.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((item) => {
            const Icon = item.icon;
            
            if (item.id === 'gvd') {
              return (
                <Link
                  key={item.id}
                  href="/raybilgi/giris?next=/raybilgi/gvd"
                  data-testid="raybilgi-card-gvd"
                  className="group p-5 rounded-2xl bg-[var(--color-glass-bg)] backdrop-blur-[12px] border border-[var(--color-glass-border)] shadow-[var(--shadow-glass-subtle)] flex flex-col justify-between transition-colors hover:border-violet-300"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2.5 bg-violet-100 rounded-lg text-violet-700">
                        <Icon className="w-5 h-5" strokeWidth={1.8} />
                      </div>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-semibold uppercase tracking-wider">
                        Kullanıma açık
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface text-[18px] mb-2">
                      {item.name}
                    </h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-3 mb-4">
                      {item.description}
                    </p>
                  </div>
                </Link>
              );
            }
            if (item.id === 'thbf') {
              return (
                <Link
                  key={item.id}
                  href="/raybilgi/thbf"
                  data-testid="raybilgi-card-thbf"
                  className="group p-5 rounded-2xl bg-[var(--color-glass-bg)] backdrop-blur-[12px] border border-[var(--color-glass-border)] shadow-[var(--shadow-glass-subtle)] flex flex-col justify-between transition-colors hover:border-violet-300"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2.5 bg-violet-100 rounded-lg text-violet-700">
                        <Icon className="w-5 h-5" strokeWidth={1.8} />
                      </div>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-semibold uppercase tracking-wider">
                        Kullanıma açık
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface text-[18px] mb-2">
                      THBF Çözümleyici
                    </h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-3 mb-4">
                      THBF PDF dosyanızı tarayıcınızda çözümleyin, vagonları seçin ve saha vaziyetine uygun formatta kopyalayın.
                    </p>
                  </div>
                </Link>
              );
            }
              if (item.id === 'ceker') {
                return (
                  <Link
                    key={item.id}
                    href="/raybilgi/ceker-bilgi"
                    data-testid="raybilgi-card-ceker"
                    className="group p-5 rounded-2xl bg-[var(--color-glass-bg)] backdrop-blur-[12px] border border-[var(--color-glass-border)] shadow-[var(--shadow-glass-subtle)] flex flex-col justify-between transition-colors hover:border-violet-300"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-2.5 bg-violet-100 rounded-lg text-violet-700">
                          <Icon className="w-5 h-5" strokeWidth={1.8} />
                        </div>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-semibold uppercase tracking-wider">
                          Kullanıma açık
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                      <h3 className="font-headline-sm text-headline-sm text-on-surface text-[18px] mb-2">
                        {item.name}
                      </h3>
                      <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-3 mb-4">
                        {item.description}
                      </p>
                    </div>
                  </Link>
                );
              }
            return (
              <div key={item.id} className="group p-5 rounded-2xl bg-[var(--color-glass-bg)] backdrop-blur-[12px] border border-[var(--color-glass-border)] shadow-[var(--shadow-glass-subtle)] flex flex-col justify-between opacity-80 cursor-not-allowed">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2.5 bg-muted rounded-lg text-muted-foreground">
                      <Icon className="w-5 h-5" strokeWidth={1.8} />
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-secondary text-secondary-foreground text-xs font-semibold uppercase tracking-wider">
                      <Lock className="w-3 h-3" />
                      Yakında
                    </span>
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface text-[18px] mb-2">
                    {item.name}
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-3 mb-4">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </SiteContainer>
    </main>
  );
}
