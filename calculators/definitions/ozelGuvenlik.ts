import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateOzelGuvenlik } from '../formulas/ozelGuvenlik';

const schema = z.object({
  isSilahli: z.enum(['silahsiz', 'silahli']),
  yaziliDogru: z.number().int().min(0).max(100),
  silahDogru: z.number().int().min(0).max(25).optional(),
  atisIsabet: z.number().int().min(0).max(5).optional()
});

type Input = z.infer<typeof schema>;

export const ozelGuvenlikCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_ozel_guvenlik_001',
  slug: 'ozel-guvenlik-sinavi-puani',
  name: 'Özel Güvenlik Sınavı Puanı Hesaplama',
  shortDescription: 'EGM Özel Güvenlik Temel/Yenileme eğitimi yazılı sınavı, silah bilgisi ve uygulamalı atış sonuçlarına göre sınav başarı durumunuzu hesaplayın.',
  category: 'education',
  type: 'complex',
  metadata: {
    title: 'Özel Güvenlik Sınavı Puanı Hesaplama | Hesapera',
    description: 'EGM mevzuatına uygun olarak Özel Güvenlik sınav puanınızı hesaplayın. Silahlı ve silahsız adaylar için yazılı, silah bilgisi ve atış puanı ile başarı durumunuzu öğrenin.',
    keywords: ['özel güvenlik puan hesaplama', 'ögg sınavı hesaplama', 'silahlı özel güvenlik', 'silahsız özel güvenlik puanı'],
    canonical: 'https://hesapera.com/ozel-guvenlik-sinavi-puani',
    faq: [],
    relatedCalculators: ['kpss-puan']
  },
  fields: [
    {
      id: 'isSilahli',
      label: 'Sınav Türü / Silah Durumu',
      type: 'select',
      required: true,
      options: [
        { label: 'Silahsız Aday', value: 'silahsiz' },
        { label: 'Silahlı Aday', value: 'silahli' }
      ]
    },
    { id: 'yaziliDogru', label: 'Yazılı Sınav Doğru Sayısı (Maks 100)', type: 'number', required: true, min: 0, max: 100 },
    {
      id: 'silahDogru',
      label: 'Silah Bilgisi Doğru Sayısı (Maks 25)',
      type: 'number',
      required: false,
      min: 0,
      max: 25,
      conditions: [{ fieldId: 'isSilahli', operator: 'equals', value: 'silahli' }]
    },
    {
      id: 'atisIsabet',
      label: 'Uygulamalı Atış İsabet Sayısı (Maks 5)',
      type: 'number',
      required: false,
      min: 0,
      max: 5,
      conditions: [{ fieldId: 'isSilahli', operator: 'equals', value: 'silahli' }]
    }
  ],
  schema,
  calculate: (input) => {
    const isSilahli = input.isSilahli === 'silahli';
    const result = calculateOzelGuvenlik(
      isSilahli,
      input.yaziliDogru,
      input.silahDogru || 0,
      input.atisIsabet || 0
    );

    const secondaryResults: Record<string, string> = {
      'Yazılı Sınav Puanı': result.yaziliPuani.toFixed(0) + ' / 100',
      'Başarı Durumu': result.statusMessage
    };

    if (isSilahli) {
      secondaryResults['Silah Bilgisi Puanı'] = result.silahBilgisiPuani.toFixed(0) + ' / 50';
      secondaryResults['Uygulamalı Atış Puanı'] = result.atisPuani.toFixed(0) + ' / 50';
      secondaryResults['Silah Sınavı Toplamı'] = result.silahSinaviToplami.toFixed(0) + ' / 100';
    }

    return {
      primaryResult: result.genelPuan.toFixed(1),
      secondaryResults,
      notes: [
        'EGM (Emniyet Genel Müdürlüğü) Özel Güvenlik Hizmetleri Genelgesi esas alınmıştır.',
        'Yazılı sınavda her soru 1 puandır. Yanlış cevaplar doğruları götürmez.',
        'Silahsız adayların başarılı olabilmesi için yazılı sınavdan en az 60 puan alması gerekir.',
        'Silahlı adayların başarılı sayılabilmesi için; yazılı sınav ile silah sınavı (bilgi+atış) puanı toplamının ortalaması en az 60 olmalıdır.'
      ]
    };
  }
};
