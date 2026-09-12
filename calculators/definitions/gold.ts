import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateGold } from '../formulas/gold';
import { marketDataService } from '../../lib/market-data/market-data-service';

const schema = z.object({
  transactionType: z.string(),
  instrumentType: z.string(),
  quantity: z.number().min(0, 'Negatif miktar olamaz').optional().default(0),
  cashAmount: z.number().min(0, 'Negatif tutar olamaz').optional().default(0)
}).superRefine((data, ctx) => {
  if (data.transactionType === 'to_cash' && data.quantity <= 0) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Miktar 0 dan büyük olmalıdır', path: ['quantity'] });
  }
  if (data.transactionType === 'to_gold' && data.cashAmount <= 0) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Tutar 0 dan büyük olmalıdır', path: ['cashAmount'] });
  }
});

type Input = z.infer<typeof schema>;

export const goldCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_gold_001',
  slug: 'altin',
  name: 'Altın Hesaplama',
  shortDescription: 'Canlı altın fiyatları üzerinden elinizdeki altının değerini veya paranızla ne kadar altın alabileceğinizi hesaplayın.',
  category: 'finance',
  type: 'complex',
  metadata: {
    title: 'Canlı Altın Hesaplama | Hesapera',
    description: 'Güncel altın alış ve satış kurları üzerinden elinizdeki altının toplam değerini ya da paranızla ne kadar altın alabileceğinizi anında hesaplayın.',
    keywords: ["altın hesaplama", "çeyrek altın", "gram altın hesapla", "canlı altın"],
    canonical: 'https://hesapera.com.tr/hesaplama/altin',
    icon: 'Coins',
    faq: [],
    features: [
      { label: 'Canlı Piyasa Fiyatları', icon: 'LineChart' },
      { label: 'Alış/Satış Kuru Ayrımı', icon: 'ArrowRightLeft' },
      { label: 'Gerçek Zamanlı Çeviri', icon: 'Clock' }
    ],
    infoBox: {
      title: 'Canlı Piyasa Verileri',
      text: 'Hesaplama, canlı piyasa alış ve satış kurları kullanılarak yapılır. Kuyumcuya göre oluşabilecek ek komisyon veya farklı fiyatlar hesaba dahil değildir. Veriler Türkiye piyasalarında güvenilir bir kaynak olan Truncgil üzerinden sağlanmaktadır.',
      icon: 'Info'
    },
    relatedCalculators: ["doviz", "ihtiyac-kredisi"]
  },
  fields: [
    {
      id: "instrumentType",
      label: "Altın Türü",
      type: "select",
      required: true,
      options: [
        { label: "Gram Altın", value: "Gram Altın" },
        { label: "Çeyrek Altın", value: "Çeyrek Altın" },
        { label: "Yarım Altın", value: "Yarım Altın" },
        { label: "Tam / Ziynet Altın", value: "Tam Altın" },
        { label: "Ata Cumhuriyet Altını", value: "Ata Altın" },
        { label: "Gremse Altın", value: "Gremse Altın" },
        { label: "Gümüş", value: "Gümüş" }
      ]
    },
    {
      id: "transactionType",
      label: "İşlem Yönü",
      type: "select",
      required: true,
      options: [
        {
          label: "Altından Paraya (Satış Yapıyorum)",
          value: "to_cash"
        },
        {
          label: "Paradan Altına (Alış Yapıyorum)",
          value: "to_gold"
        }
      ]
    },
    {
      id: "quantity",
      label: "Miktar (Adet/Gram)",
      type: "number",
      required: true,
      min: 0,
      step: 0.01,
      conditions: [
        {
          fieldId: "transactionType",
          operator: "equals",
          value: "to_cash"
        }
      ]
    },
    {
      id: "cashAmount",
      label: "Para Tutarı (TL)",
      type: "currency",
      required: true,
      min: 0,
      conditions: [
        {
          fieldId: "transactionType",
          operator: "equals",
          value: "to_gold"
        }
      ]
    }
  ],
  schema,
  calculate: async (input) => {
    // 1. Canlı veriyi çek
    const quote = await marketDataService.getGoldQuote(input.instrumentType);
    
    // 2. İşlem yönüne göre uygun fiyatı (alış/satış) belirle ve formüle aktar
    return calculateGold(
      input.transactionType, 
      input.instrumentType, 
      input.quantity, 
      input.cashAmount,
      quote
    );
  }
};
