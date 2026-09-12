import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateOkulaBaslamaYasi } from '../formulas/okulaBaslamaYasi';

const currentYear = new Date().getFullYear();

const schema = z.object({
  dogumAy: z.number().min(1).max(12),
  dogumYil: z.number().min(2000),
  egitimYili: z.number().min(2020)
});

type Input = z.infer<typeof schema>;

export const okulaBaslamaYasiCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_okula_baslama_yasi_001',
  slug: 'okula-baslama-yasi',
  status: 'draft',
  name: 'Okula Başlama Yaşı Hesaplama',
  shortDescription: 'Çocuğunuzun doğum tarihine göre ilkokul 1. sınıf veya anaokuluna başlama yaşını ve kayıt durumunu öğrenin.',
  category: 'education',
  type: 'simple',
  metadata: {
    title: 'Okula Başlama Yaşı Hesaplama (MEB 2026 Kayıtları) | Hesapera',
    description: 'Güncel MEB yönetmeliğine göre çocuğunuzun ilkokula veya anaokuluna ne zaman başlayacağını ay hesabı yaparak öğrenin.',
    keywords: ['okula başlama yaşı', 'ilkokul kayıt yaşı', 'meb 1. sınıf kayıt', 'anaokulu yaş hesaplama', '72 ay hesaplama'],
    canonical: 'https://hesapera.com/okula-baslama-yasi',
    faq: [],
    relatedCalculators: ['yas']
  },
  fields: [
    {
      id: 'dogumAy',
      label: 'Çocuğun Doğum Ayı',
      type: 'select',
      required: true,
      options: [
        { label: 'Ocak (1)', value: '1' },
        { label: 'Şubat (2)', value: '2' },
        { label: 'Mart (3)', value: '3' },
        { label: 'Nisan (4)', value: '4' },
        { label: 'Mayıs (5)', value: '5' },
        { label: 'Haziran (6)', value: '6' },
        { label: 'Temmuz (7)', value: '7' },
        { label: 'Ağustos (8)', value: '8' },
        { label: 'Eylül (9)', value: '9' },
        { label: 'Ekim (10)', value: '10' },
        { label: 'Kasım (11)', value: '11' },
        { label: 'Aralık (12)', value: '12' }
      ]
    },
    { id: 'dogumYil', label: 'Çocuğun Doğum Yılı', type: 'number', required: true, min: 2000, defaultValue: 2020 },
    { id: 'egitimYili', label: 'Hedeflenen Eğitim Başlangıç Yılı (Eylül)', type: 'number', required: true, min: 2020, defaultValue: 2026 }
  ],
  schema,
  calculate: (input) => calculateOkulaBaslamaYasi(input)
};


