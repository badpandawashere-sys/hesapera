import { TrendingUp, CreditCard, Wallet, Receipt, Car, Building, GraduationCap, Heart, Calculator, Clock, Scale, Shield, Plane, Coffee } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface CategoryData {
  id: string;
  name: string;
  count: string;
  icon: LucideIcon;
  color: string;
  bg: string;
}

export const categories: CategoryData[] = [
  { id: 'finans', name: 'Finans', count: '18 Araç', icon: TrendingUp, color: 'text-primary', bg: 'bg-primary/10' },
  { id: 'kredi', name: 'Kredi', count: '12 Araç', icon: CreditCard, color: 'text-primary', bg: 'bg-primary/10' },
  { id: 'maas-calisma', name: 'Maaş & Çalışma', count: '14 Araç', icon: Wallet, color: 'text-tertiary', bg: 'bg-tertiary/10' },
  { id: 'vergi', name: 'Vergi', count: '16 Araç', icon: Receipt, color: 'text-primary', bg: 'bg-primary/10' },
  { id: 'otomotiv', name: 'Otomotiv', count: '9 Araç', icon: Car, color: 'text-secondary', bg: 'bg-secondary/10' },
  { id: 'emlak', name: 'Emlak', count: '8 Araç', icon: Building, color: 'text-primary', bg: 'bg-primary/10' },
  { id: 'egitim-sinav', name: 'Eğitim & Sınav', count: '11 Araç', icon: GraduationCap, color: 'text-tertiary', bg: 'bg-tertiary/10' },
  { id: 'saglik', name: 'Sağlık', count: '10 Araç', icon: Heart, color: 'text-error', bg: 'bg-error/10' },
  { id: 'matematik', name: 'Matematik', count: '15 Araç', icon: Calculator, color: 'text-primary', bg: 'bg-primary/10' },
  { id: 'zaman', name: 'Zaman', count: '7 Araç', icon: Clock, color: 'text-secondary', bg: 'bg-secondary/10' },
  { id: 'hukuk', name: 'Hukuk', count: '8 Araç', icon: Scale, color: 'text-primary', bg: 'bg-primary/10' },
  { id: 'sigorta', name: 'Sigorta', count: '6 Araç', icon: Shield, color: 'text-tertiary', bg: 'bg-tertiary/10' },
  { id: 'seyahat', name: 'Seyahat', count: '5 Araç', icon: Plane, color: 'text-primary', bg: 'bg-primary/10' },
  { id: 'gunluk-yasam', name: 'Günlük Yaşam', count: '9 Araç', icon: Coffee, color: 'text-secondary', bg: 'bg-secondary/10' },
];
