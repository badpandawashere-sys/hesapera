import Link from 'next/link';
import { SiteContainer } from './site-container';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-surface-container-lowest mt-auto relative z-10">
      <SiteContainer className="py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1 space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold tracking-tight text-foreground">Hesapera</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Türkiye'nin en gelişmiş, ücretsiz ve modern hesaplama platformu. Yüzlerce hesaplama aracına tek tıkla ulaşın.
            </p>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-sm font-semibold tracking-wide uppercase text-foreground">Kategoriler</h4>
            <ul className="space-y-2.5">
              <li><Link href="/kategoriler/finans" className="text-sm text-muted-foreground hover:text-primary transition-colors">Finans</Link></li>
              <li><Link href="/kategoriler/matematik" className="text-sm text-muted-foreground hover:text-primary transition-colors">Matematik</Link></li>
              <li><Link href="/kategoriler/saglik" className="text-sm text-muted-foreground hover:text-primary transition-colors">Sağlık</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold tracking-wide uppercase text-foreground">Popüler</h4>
            <ul className="space-y-2.5">
              <li><Link href="/hesaplama/yuzde-hesaplama" className="text-sm text-muted-foreground hover:text-primary transition-colors">Yüzde Hesaplama</Link></li>
              <li><Link href="/hesaplama/kdv-hesaplama" className="text-sm text-muted-foreground hover:text-primary transition-colors">KDV Hesaplama</Link></li>
              <li><Link href="/hesaplama/kredi-hesaplama" className="text-sm text-muted-foreground hover:text-primary transition-colors">Kredi Hesaplama</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold tracking-wide uppercase text-foreground">Kurumsal</h4>
            <ul className="space-y-2.5">
              <li><Link href="/hakkimizda" className="text-sm text-muted-foreground hover:text-primary transition-colors">Hakkımızda</Link></li>
              <li><Link href="/iletisim" className="text-sm text-muted-foreground hover:text-primary transition-colors">İletişim</Link></li>
              <li><Link href="/gizlilik" className="text-sm text-muted-foreground hover:text-primary transition-colors">Gizlilik Politikası</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {currentYear} Hesapera. Tüm hakları saklıdır.
          </p>
          <div className="text-xs text-muted-foreground">
            Finansal kararlarınızda uzman onayı almayı unutmayınız.
          </div>
        </div>
      </SiteContainer>
    </footer>
  );
}
