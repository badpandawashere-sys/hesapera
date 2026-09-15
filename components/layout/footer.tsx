import Link from 'next/link';
import { SiteContainer } from './site-container';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-surface-container-lowest mt-auto relative z-10">
      <SiteContainer className="py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {/* Brand Info */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2 space-y-4">
            <Link href="/" className="inline-block">
              <div className="relative w-[130px] sm:w-[150px] h-[40px] flex items-center">
                <img 
                  src="/logo.png" 
                  alt="Hesapera Logo" 
                  className="object-contain w-full h-full"
                />
              </div>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              Türkiye&apos;nin en gelişmiş, ücretsiz ve modern hesaplama platformu. Finans, vergi, sağlık ve matematikte yüzlerce araca tek tıkla ulaşın.
            </p>
          </div>
          
          {/* Categories */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold tracking-wider uppercase text-foreground">Kategoriler</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/kategoriler/finans" className="text-muted-foreground hover:text-primary transition-colors">
                  Finans
                </Link>
              </li>
              <li>
                <Link href="/kategoriler/kredi" className="text-muted-foreground hover:text-primary transition-colors">
                  Kredi
                </Link>
              </li>
              <li>
                <Link href="/kategoriler/matematik" className="text-muted-foreground hover:text-primary transition-colors">
                  Matematik
                </Link>
              </li>
              <li>
                <Link href="/kategoriler/saglik" className="text-muted-foreground hover:text-primary transition-colors">
                  Sağlık
                </Link>
              </li>
              <li>
                <Link href="/kategoriler" className="text-primary hover:underline text-xs font-medium pt-1 inline-block">
                  Tüm Kategoriler →
                </Link>
              </li>
            </ul>
          </div>

          {/* Corporate */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold tracking-wider uppercase text-foreground">Kurumsal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/hakkimizda" className="text-muted-foreground hover:text-primary transition-colors">
                  Hakkımızda
                </Link>
              </li>
              <li>
                <Link href="/iletisim" className="text-muted-foreground hover:text-primary transition-colors">
                  İletişim
                </Link>
              </li>
              <li>
                <Link href="/rehber" className="text-muted-foreground hover:text-primary transition-colors">
                  Hesaplama Rehberleri
                </Link>
              </li>
              <li>
                <Link href="/hesaplama" className="text-muted-foreground hover:text-primary transition-colors">
                  Tüm Hesaplayıcılar
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold tracking-wider uppercase text-foreground">Yasal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/gizlilik" className="text-muted-foreground hover:text-primary transition-colors">
                  Gizlilik Politikası
                </Link>
              </li>
              <li>
                <Link href="/kvkk" className="text-muted-foreground hover:text-primary transition-colors">
                  KVKK Aydınlatma
                </Link>
              </li>
              <li>
                <Link href="/cerez" className="text-muted-foreground hover:text-primary transition-colors">
                  Çerez Politikası
                </Link>
              </li>
              <li>
                <Link href="/kullanim-kosullari" className="text-muted-foreground hover:text-primary transition-colors">
                  Kullanım Koşulları
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground text-center md:text-left">
            &copy; {currentYear} Hesapera. Tüm hakları saklıdır.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
            <Link href="/gizlilik" className="hover:text-primary transition-colors">
              Gizlilik
            </Link>
            <span>•</span>
            <Link href="/kvkk" className="hover:text-primary transition-colors">
              KVKK
            </Link>
            <span>•</span>
            <Link href="/cerez" className="hover:text-primary transition-colors">
              Çerezler
            </Link>
            <span>•</span>
            <Link href="/kullanim-kosullari" className="hover:text-primary transition-colors">
              Kullanım Şartları
            </Link>
          </div>

          <div className="text-xs text-muted-foreground text-center md:text-right">
            Bilgilendirme amaçlıdır; yatırım veya sağlık tavsiyesi içermez.
          </div>
        </div>
      </SiteContainer>
    </footer>
  );
}
