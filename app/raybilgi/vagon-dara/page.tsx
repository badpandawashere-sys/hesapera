import { Metadata } from 'next';
import { getSession } from '@/lib/raybilgi/auth/session';
import { redirect } from 'next/navigation';
import { SiteContainer } from '@/components/layout/site-container';
import { Button } from '@/components/ui/button';
import { Scale, LogOut, ArrowLeft, KeyRound } from 'lucide-react';
import Link from 'next/link';
import { logoutAction } from '@/lib/raybilgi/auth/actions';
import { get5600WagonLookup } from '@/lib/raybilgi/mod5600-reference';
import { VagonDaraDashboard } from '@/components/raybilgi/vagon-dara/vagon-dara-dashboard';

export const metadata: Metadata = {
  title: 'Vagon Dara Hesaplama • RayBilgi | Hesapera',
  description: 'Fotoğraf, kamera ve liste yapıştırma ile otomatik vagon darası ve tren parametreleri hesaplama.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function VagonDaraPage() {
  const session = await getSession();

  if (!session) {
    redirect('/raybilgi/giris?next=/raybilgi/vagon-dara');
  }

  const wagonLookup = get5600WagonLookup();

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
                <Scale className="w-6 h-6" strokeWidth={1.5} />
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
                Vagon Dara Hesaplama
              </h1>
            </div>
            <p className="text-sm md:text-base text-muted-foreground">
              {session.stationName} — Fotoğraf, kamera veya liste yapıştırma ile otomatik vagon darası ve toplam tonaj hesabı.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs bg-muted text-muted-foreground px-3 py-1.5 rounded-full font-semibold border border-border">
              {session.stationName}
            </span>
            <Link
              href="/raybilgi/sifre-degistir"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-medium px-3 py-1.5 rounded-lg border border-border hover:bg-muted/50 transition-colors"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Şifre</span>
            </Link>
            <form action={logoutAction}>
              <Button
                variant="ghost"
                size="sm"
                type="submit"
                className="text-muted-foreground hover:text-destructive flex items-center gap-1.5"
              >
                <LogOut className="w-4 h-4" />
                <span>Çıkış</span>
              </Button>
            </form>
          </div>
        </div>

        {/* Client Dashboard */}
        <VagonDaraDashboard wagonLookup={wagonLookup} />
      </SiteContainer>
    </main>
  );
}
