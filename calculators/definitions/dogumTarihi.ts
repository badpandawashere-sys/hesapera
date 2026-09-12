import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateDogumTarihi } from '../formulas/dogumTarihi';

const schema = z.object({
  hesaplamaYonu: z.enum(['TarihtenYas', 'YastanTarih']),
  dogumTarihi: z.string().optional(),
  yil: z.number().min(0).max(150).optional(),
  ay: z.number().min(0).max(11).optional(),
  gun: z.number().min(0).max(31).optional()
}).superRefine((data, ctx) => {
  if (data.hesaplamaYonu === 'TarihtenYas' && !data.dogumTarihi) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Lütfen geçerli bir doğum tarihi giriniz.', path: ['dogumTarihi'] });
  }
});

type Input = z.infer<typeof schema>;

export const dogumTarihiCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_dogum_tarihi_001',
  slug: 'dogum-tarihi',
  status: 'draft',
  name: 'Doğum Tarihi / Yaş Hesaplama',
  shortDescription: 'Doğum tarihinizden tam yaşınızı bulun veya bilinen yaş değerlerinden (yıl, ay, gün) geriye dönük tahmini doğum tarihi hesaplayın.',
  category: 'health',
  type: 'simple',
  metadata: {
    title: 'Doğum Tarihi ve Yaş Hesaplama (Tam Yaş ve Gün) | Hesapera',
    description: 'Doğum tarihine göre tam yaşınızı (yıl, ay, gün olarak) hesaplayın. Veya yaşınızı girerek geriye dönük tahmini doğum tarihinizi bulun. Artık yıllar dahildir.',
    keywords: ['doğum tarihi hesaplama', 'yaş hesaplama', 'tam yaş hesaplama', 'kaç yaşındayım', 'geriye dönük tarih hesaplama'],
    canonical: 'https://hesapera.com/dogum-tarihi',
    faq: [],
    relatedCalculators: []
  },
  fields: [
    {
      id: 'hesaplamaYonu',
      label: 'Ne Hesaplamak İstiyorsunuz?',
      type: 'select',
      required: true,
      options: [
        { label: 'Doğum Tarihimden Yaşımı Hesapla', value: 'TarihtenYas' },
        { label: 'Yaşımdan Doğum Tarihimi Hesapla', value: 'YastanTarih' }
      ],
      defaultValue: 'TarihtenYas'
    },
    {
      id: 'dogumTarihi',
      label: 'Doğum Tarihiniz',
      type: 'date',
      required: false,
      conditions: [{ fieldId: 'hesaplamaYonu', operator: 'equals', value: 'TarihtenYas' }]
    },
    {
      id: 'yil',
      label: 'Yaş (Yıl)',
      type: 'number',
      required: false,
      defaultValue: 0,
      min: 0,
      max: 150,
      conditions: [{ fieldId: 'hesaplamaYonu', operator: 'equals', value: 'YastanTarih' }]
    },
    {
      id: 'ay',
      label: 'Yaş (Ay)',
      type: 'number',
      required: false,
      defaultValue: 0,
      min: 0,
      max: 11,
      conditions: [{ fieldId: 'hesaplamaYonu', operator: 'equals', value: 'YastanTarih' }]
    },
    {
      id: 'gun',
      label: 'Yaş (Gün)',
      type: 'number',
      required: false,
      defaultValue: 0,
      min: 0,
      max: 31,
      conditions: [{ fieldId: 'hesaplamaYonu', operator: 'equals', value: 'YastanTarih' }]
    }
  ],
  schema,
  calculate: (input) => calculateDogumTarihi({ ...input, referansTarihi: new Date().toISOString().split('T')[0] })
};


