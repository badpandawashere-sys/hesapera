import { Metadata } from 'next';
import { LoginForm } from '@/components/raybilgi/login-form';

export const metadata: Metadata = {
  title: 'Giriş Yap | RayBilgi',
  description: 'RayBilgi ve GVD modülüne istasyon hesabınızla giriş yapın.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams;
  const next = typeof params?.next === 'string' ? params.next : undefined;

  return (
    <main className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <LoginForm nextUrl={next} />
      </div>
    </main>
  );
}
