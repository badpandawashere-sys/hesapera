import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateCompoundGrowth } from '../formulas/compoundGrowth';

const schema = z.object({
  initialValue: z.number().positive('Başlangıç değeri 0 dan büyük olmalıdır'),
  growthRate: z.number().min(-100, 'Büyüme oranı -100 den küçük olamaz'),
  periods: z.number().int().positive('Dönem pozitif tam sayı olmalıdır')
});

type Input = z.infer<typeof schema>;

export const compoundGrowthCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_compoundGrowth_001',
  slug: 'bilesik-buyume',
  status: 'published',
  name: 'Bileşik Büyüme Hesaplama',
  shortDescription: 'Bir değerin belirli dönemlerde ortalama büyüme oranıyla gelecekteki değerini (Compound Growth) hesaplayın.',
  category: 'finance',
  type: 'complex',
  metadata: {
    title: 'Bileşik Büyüme Hesaplama Aracı | Hesapera',
    description: 'Bir değerin belirli dönemlerde ortalama büyüme oranıyla gelecekteki değerini (Compound Growth) hesaplayın.',
    keywords: ["bileşik büyüme","büyüme hesaplama","compound growth","ortalama büyüme"],
    canonical: 'https://www.hesapera.com.tr/hesaplama/bilesik-buyume',
    faq: [
      {
        question: "Bileşik büyüme sadece finansal hesaplamalarda mı kullanılır?",
        answer: "Hayır. Nüfus artış hızı tahminleri, bakterilerin çoğalma hızı, web sitesi trafik artışı veya enflasyonun kümülatif etkisi gibi pek çok istatistiksel ve bilimsel alanda aynı matematiksel formül kullanılır."
      },
      {
        question: "Zaman dilimi (periyot) neden çok önemlidir?",
        answer: "Bileşik büyümede zaman üstel (kuvvet) olarak formüle girer. Bu nedenle küçük bir oran bile uzun zaman dilimlerinde (periyot) devasa farklar yaratır."
      }
    ],
    content: {
      intro: "Bileşik büyümenin matematiksel mantığı, başlangıç değeri ve uzun vadeli kar topu etkisi hakkında rehber",

      sections: [
        {
          title: "Bileşik Büyüme Nedir?",
          paragraphs: [
            "Bileşik büyüme, bir değerin (örneğin şirket karı, nüfus, yatırım veya enflasyon) her dönem elde ettiği büyümenin ana değere eklenerek bir sonraki dönemin büyümesinin bu yeni ve daha büyük toplam üzerinden hesaplanmasıdır.",
            "Halk arasında 'kar topu etkisi' olarak da bilinen bu kavram, zaman (dönem sayısı) uzadıkça büyüme eğrisinin dikleşmesini ve ivmelenmesini sağlar."
          ]
        },
        {
          title: "Basit ile Bileşik Büyüme Arasındaki Fark",
          paragraphs: [
            "Basit büyümede büyüme oranı daima ilk (başlangıç) değer üzerinden hesaplanır ve her dönem aynı miktar eklenir.",
            "Bileşik büyümede ise ikinci dönemdeki büyüme (İlk Değer + Birinci Dönem Büyümesi) üzerinden hesaplanır. Yani büyümenin kendisi de büyümeye başlar."
          ]
        },
        {
          title: "Negatif Büyüme Oranları",
          paragraphs: [
            "Bileşik hesaplama sadece artışlar için değil, azalışlar için de geçerlidir. Eğer büyüme oranı negatif (-%) girilirse, bu her dönemde mevcut değerin o oranda eriyeceği anlamına gelir (Örn: Amortisman hesaplamaları veya nüfus azalması)."
          ]
        },
      ],
      example: {
        title: "Kar Topu Etkisi Örneği",
        text: "Başlangıç değeri 10.000 olan bir varlığın her yıl %10 bileşik büyüme gösterdiğini düşünelim. 1. yılın sonunda 11.000 olur. 2. yılın %10'luk büyümesi 10.000 üzerinden değil, 11.000 üzerinden hesaplandığı için 1.100 birim artışla 12.100 olur. Bu şekilde oran hep aynı kalsa bile oranın uygulandığı taban büyüdüğü için matematiksel olarak sonuç katlanarak artar."
      }
    },

    relatedCalculators: ["birikim","bilesik-faiz-hesaplama"]
  },
  fields: [
  {
    "id": "initialValue",
    "label": "Başlangıç Değeri",
    "type": "number",
    "required": true,
    "min": 0
  },
  {
    "id": "growthRate",
    "label": "Büyüme Oranı (Dönemsel %)",
    "type": "percentage",
    "required": true,
    "min": -100,
    "step": 0.01
  },
  {
    "id": "periods",
    "label": "Dönem Sayısı",
    "type": "number",
    "required": true,
    "min": 1
  }
],
  schema,
  calculate: (input) => {
    return calculateCompoundGrowth(input.initialValue, input.growthRate, input.periods);
  }
};

