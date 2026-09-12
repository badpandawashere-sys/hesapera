import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateLiseSinifGecme } from '../formulas/liseSinifGecme';

const schema = z.object({
  ozursuzDevamsizlik: z.number().min(0),
  toplamDevamsizlik: z.number().min(0),
  altSinifBasarisizDersSayisi: z.number().min(0),
  dersler: z.array(z.object({
    dersAdi: z.string().optional(),
    puan: z.number().min(0).max(100),
    saat: z.number().min(1),
    isBaraj: z.boolean().optional()
  })).min(1, "En az bir ders girmelisiniz.")
});

type Input = z.infer<typeof schema>;

export const liseSinifGecmeCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_lise_sinif_gecme_001',
  slug: 'lise-sinif-gecme',
  name: 'Lise Sınıf Geçme Hesaplama',
  shortDescription: 'MEB güncel lise yönetmeliğine göre yıl sonu başarı puanınızı, doğrudan/sorumlu geçme ve sınıf tekrarı durumunuzu hesaplayın.',
  category: 'education',
  type: 'complex',
  metadata: {
    title: 'Lise Sınıf Geçme / Kalma Hesaplama 2026 | Hesapera',
    description: 'Devamsızlık ve ders yıl sonu puanlarınızı girerek lisede doğrudan geçme, sorumlu geçme veya sınıf tekrarı (kalma) durumunuzu öğrenin.',
    keywords: ['lise sınıf geçme', 'sınıf tekrarı hesaplama', 'sorumlu geçme hesaplama', 'baraj dersi', 'lise devamsızlık sınırı'],
    canonical: 'https://hesapera.com/lise-sinif-gecme',
    faq: [],
    relatedCalculators: ['lise-ortalama', 'lise-mezuniyet-puani']
  },
  fields: [
    { id: 'ozursuzDevamsizlik', label: 'Özürsüz Devamsızlık (Gün)', type: 'number', required: true, min: 0, defaultValue: 0 },
    { id: 'toplamDevamsizlik', label: 'Toplam Devamsızlık (Özürlü+Özürsüz)', type: 'number', required: true, min: 0, defaultValue: 0 },
    { id: 'altSinifBasarisizDersSayisi', label: 'Alt Sınıflardan Kalan (Sorumlu) Ders Sayısı', type: 'number', required: true, min: 0, defaultValue: 0 },
    {
      id: 'dersler',
      label: 'Dersleriniz (Yıl Sonu)',
      type: 'array',
      required: true,
      description: 'Lütfen yıl sonundaki tüm derslerinizin ortalamasını ve haftalık ders saatini (kredisini) girin.',
      subFields: [
        { id: 'dersAdi', label: 'Ders Adı', type: 'text', required: false },
        { id: 'puan', label: 'Yıl Sonu Puanı (0-100)', type: 'number', required: true, min: 0, max: 100 },
        { id: 'saat', label: 'Haftalık Ders Saati', type: 'number', required: true, min: 1 },
        { id: 'isBaraj', label: 'Baraj Dersi (örn: Edebiyat)', type: 'checkbox', required: false }
      ]
    }
  ],
  schema,
  calculate: (input) => calculateLiseSinifGecme({
    ozursuzDevamsizlik: input.ozursuzDevamsizlik,
    toplamDevamsizlik: input.toplamDevamsizlik,
    altSinifBasarisizDersSayisi: input.altSinifBasarisizDersSayisi,
    dersler: input.dersler.map(d => ({
      dersAdi: d.dersAdi,
      puan: d.puan,
      saat: d.saat,
      isBaraj: d.isBaraj || false
    }))
  })
};
