'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Search, X, Calculator, Grid2X2, BookOpen, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { SiteContainer } from './site-container';
import { Button } from '@/components/ui/button';

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { label: 'Hesaplayıcılar', href: '/hesaplama', icon: Calculator },
    { label: 'Kategoriler', href: '/kategoriler', icon: Grid2X2, chevron: true },
    { label: 'Rehber', href: '/rehber', icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-surface-container-lowest/90 backdrop-blur-xl supports-[backdrop-filter]:bg-surface-container-lowest/80 shadow-sm">
      <SiteContainer>
        <div className="flex h-16 items-center justify-between gap-space-lg">
          <div className="flex items-center gap-space-md">
            <Link href="/" className="flex items-center space-x-2">
              <div className="relative w-[130px] sm:w-[160px] h-[43px] sm:h-[53px] flex items-center">
                <img 
                  src="/logo.png" 
                  alt="Hesapera Logo" 
                  className="object-contain w-full h-full"
                />
              </div>
            </Link>
            
            <nav className="hidden lg:flex items-center gap-1.5 px-4 ml-2">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || (pathname?.startsWith(`${link.href}/`) ?? false);
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[15px] font-medium transition-colors ${
                      isActive 
                        ? 'bg-violet-50 text-violet-600' 
                        : 'text-muted-foreground hover:bg-violet-50 hover:text-violet-600'
                    }`}
                  >
                    <Icon className="w-[17px] h-[17px]" strokeWidth={1.8} />
                    {link.label}
                    {link.chevron && <ChevronDown className="w-3.5 h-3.5 ml-0.5 opacity-70" strokeWidth={2} />}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Link href="/hesaplama" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2">
              Tüm Hesaplayıcılar
            </Link>
          </div>

          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Menüyü aç/kapat"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </SiteContainer>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-b bg-background shadow-inner">
          <SiteContainer className="py-4 space-y-4">
            <nav className="flex flex-col space-y-1.5">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || (pathname?.startsWith(`${link.href}/`) ?? false);
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium transition-colors ${
                      isActive
                        ? 'bg-violet-50 text-violet-600'
                        : 'text-muted-foreground hover:bg-violet-50 hover:text-violet-600'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="w-[18px] h-[18px]" strokeWidth={1.8} />
                    {link.label}
                    {link.chevron && <ChevronDown className="w-4 h-4 ml-auto opacity-50" strokeWidth={2} />}
                  </Link>
                );
              })}
            </nav>
          </SiteContainer>
        </div>
      )}
    </header>
  );
}
