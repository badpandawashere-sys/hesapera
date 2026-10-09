import { Metadata } from 'next';
import { getSession } from '@/lib/raybilgi/auth/session';
import { redirect } from 'next/navigation';
import { SiteContainer } from '@/components/layout/site-container';
import { logoutAction } from '@/lib/raybilgi/auth/actions';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet, LogOut } from 'lucide-react';
import { getActiveGvdRecords, getGvdHistory } from '@/lib/raybilgi/gvd-actions';
import { getGvdReferenceData } from '@/lib/raybilgi/gvd-reference';
import { GvdDashboard } from '@/components/raybilgi/gvd/gvd-dashboard';

export const metadata: Metadata = {
  title: 'GVD | RayBilgi',
  description: 'Vagon durumları ve operasyon hareketleri.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function GvdPage() {
  const session = await getSession();

  if (!session) {
    redirect('/raybilgi/giris?next=/raybilgi/gvd');
  }

  const records = await getActiveGvdRecords();
  const history = await getGvdHistory();
  const referenceData = getGvdReferenceData();

  return (
    <main className="flex-1 py-12 bg-muted/10 min-h-screen">
      <SiteContainer>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-violet-100 text-violet-700 rounded-lg">
                <FileSpreadsheet className="w-6 h-6" strokeWidth={1.5} />
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
                GVD Sistemi
              </h1>
            </div>
            <p className="text-muted-foreground">
              Aktif İstasyon: <strong className="text-foreground">{session.stationName}</strong>
            </p>
          </div>
          
          <form action={logoutAction}>
            <Button type="submit" variant="outline" className="gap-2">
              <LogOut className="w-4 h-4" />
              Çıkış Yap
            </Button>
          </form>
        </div>

        <GvdDashboard initialRecords={records} initialHistory={history} referenceData={referenceData} />

      </SiteContainer>
    </main>
  );
}
