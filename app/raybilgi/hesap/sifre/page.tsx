import { Metadata } from 'next';
import { getSession } from '@/lib/raybilgi/auth/session';
import { redirect } from 'next/navigation';
import { SiteContainer } from '@/components/layout/site-container';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ChangePasswordForm } from '@/components/raybilgi/auth/change-password-form';

export const metadata: Metadata = {
  title: 'Şifre Belirle | RayBilgi',
  description: 'İstasyon hesap şifresi oluşturma ve güncelleme.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ChangePasswordPage() {
  const session = await getSession();

  if (!session || !session.stationCode) {
    redirect('/raybilgi/giris?next=/raybilgi/hesap/sifre');
  }

  return (
    <main className="flex-1 py-8 md:py-12 bg-muted/10 min-h-screen">
      <SiteContainer>
        <div className="max-w-md mx-auto mb-6">
          <Link
            href="/raybilgi"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            RayBilgi Menüsüne Dön
          </Link>
        </div>

        <ChangePasswordForm stationName={session.stationName} />
      </SiteContainer>
    </main>
  );
}
