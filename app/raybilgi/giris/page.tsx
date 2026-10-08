import { Metadata } from 'next';
import { LoginForm } from '@/components/raybilgi/login-form';

export const metadata: Metadata = {
  title: 'Giriş Yap | RayBilgi',
  description: 'RayBilgi ve GVD modülüne giriş yapın.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginPage() {
  return (
    <main className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <LoginForm />
      </div>
    </main>
  );
}
