import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { getUniversityBaseScores } from '../formulas/universityBaseScores';

// This is a data-fetching "calculator"
const schema = z.object({
  scoreType: z.enum(['SAY', 'EA', 'SOZ', 'DIL', 'TYT', 'Hepsi']).optional(),
  university: z.string().optional()
});

type Input = z.infer<typeof schema>;

export const universiteYksTabanPuanlariDef: CalculatorDefinition<Input, any> = {
  id: 'calc_yks_base_001',
  slug: 'universite-yks-taban-puanlari',
  status: 'draft',
  name: 'Üniversite / YKS Taban Puanları Hesaplama',
  shortDescription: 'ÖSYM 2026-YKS yerleştirme sonuçlarına göre üniversite taban puanları, tavan puanlar, kontenjan ve sıralama bilgilerini sorgulayın (Demo).',
  category: 'education',
  type: 'simple',
  metadata: {
    title: 'Üniversite / YKS Taban Puanları 2026 | Hesapera',
    description: '2026 YKS üniversite bölümleri taban puanları ve başarı sıralamalarını sorgulayın. Sayısal, Eşit Ağırlık, Sözel ve TYT puan türlerine göre filtreleyin.',
    keywords: ['yks taban puanları', 'üniversite taban puanları', 'yks 2026 taban puanları', 'üniversite sıralamaları'],
    canonical: 'https://hesapera.com/universite-yks-taban-puanlari',
    faq: [],
    relatedCalculators: ['tyt-puan', 'obp-okul-puani']
  },
  fields: [
    {
      id: 'scoreType',
      label: 'Puan Türü',
      type: 'select',
      required: false,
      options: [
        { label: 'Tümü', value: 'Hepsi' },
        { label: 'SAY (Sayısal)', value: 'SAY' },
        { label: 'EA (Eşit Ağırlık)', value: 'EA' },
        { label: 'SÖZ (Sözel)', value: 'SOZ' },
        { label: 'DİL (Yabancı Dil)', value: 'DIL' },
        { label: 'TYT', value: 'TYT' }
      ]
    },
    {
      id: 'university',
      label: 'Üniversite Ara (örn: Hacettepe)',
      type: 'text',
      required: false
    }
  ],
  schema,
  calculate: (input) => {
    // The actual fetching happens async in the UI component, but engine needs sync calculate.
    // For this generic system, returning instructions or we can bypass standard result.
    // Given the architecture, data-provider calculators are usually a specialized UI or we just return a message.
    return {
      primaryResult: "Arama Sonuçları",
      secondaryResults: {
        "Durum": "Lütfen formu kullanarak sorgulama yapınız. (Sistem asenkron veriyi UI katmanında listeler)"
      },
      notes: [
        "Bu araç YKS üniversite programlarının resmi yerleştirme verilerini listelemek için tasarlanmıştır.",
        "ÖSYM 2026-YKS Yerleştirme Sonuçlarına İlişkin Sayısal Bilgiler kullanılarak güncellenmektedir.",
        "Görüntülenen veriler şu an için Demo / Mock Veri niteliğindedir."
      ]
    };
  }
};


