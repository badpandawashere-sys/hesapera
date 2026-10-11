import { Metadata } from 'next';
import { getSession } from '@/lib/raybilgi/auth/session';
import { redirect } from 'next/navigation';
import { SiteContainer } from '@/components/layout/site-container';
import { Button } from '@/components/ui/button';
import { Calculator, LogOut, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { logoutAction } from '@/lib/raybilgi/auth/actions';
import { get5600WagonLookup, get5600StationNames } from '@/lib/raybilgi/mod5600-reference';
import { Mod5600Dashboard } from '@/components/raybilgi/5600/mod5600-dashboard';

export const metadata: Metadata = {
  title: '5600 • Tren Hareket Bildirimi | RayBilgi',
  description: 'Tren teşkil ve vagon dizisi hesaplama aracı.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function Mod5600Page() {
  const session = await getSession();

  if (!session) {
    redirect('/raybilgi/giris?next=/raybilgi/5600');
  }

  const wagonLookup = get5600WagonLookup();
  const stationNames = get5600StationNames();

  return (
    <main className="flex-1 py-8 md:py-12 bg-muted/10 min-h-screen">
      <SiteContainer>
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link
                href="/raybilgi"
                className="p-2 bg-muted hover:bg-muted/80 text-muted-foreground rounded-lg transition-colors"
                title="RayBilgi Menüsü"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="p-2 bg-violet-100 text-violet-700 rounded-lg">
                <Calculator className="w-6 h-6" strokeWidth={1.5} />
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
                5600 • Tren Hareket Bildirimi
              </h1>
            </div>
            <p className="text-sm md:text-base text-muted-foreground">
              {session.stationName} — Vagon dizisi teknik parametreleri ve fren hesaplamaları.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs bg-muted text-muted-foreground px-3 py-1.5 rounded-full font-semibold border border-border">
              {session.stationName}
            </span>
            <form action={logoutAction}>
              <Button variant="outline" size="sm" type="submit" className="gap-2 text-xs">
                <LogOut className="w-4 h-4" />
                Çıkış Yap
              </Button>
            </form>
          </div>
        </div>

        {/* 5600 Dashboard */}
        <Mod5600Dashboard
          wagonLookup={wagonLookup}
          stationNames={stationNames}
        />
      </SiteContainer>
    </main>
  );
}
