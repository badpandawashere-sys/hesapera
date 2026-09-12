import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateEhliyetSinavi } from '../formulas/ehliyetSinavi';

const schema = z.object({
  correct: z.number().int().min(0).max(50)
});

type Input = z.infer<typeof schema>;

export const ehliyetSinaviCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_ehliyetSinavi_001',
  slug: 'ehliyet-sinavi-puan',
  status: 'draft',
  name: 'Ehliyet Sınavı Puan Hesaplama',
  shortDescription: 'MEB motorlu taşıt sürücü kursu teorik sınavı doğru sayınıza göre puanınızı ve başarı durumunuzu hesaplayın.',
  category: 'education',
  type: 'complex',
  metadata: {
    title: 'Ehliyet Sınavı Puan Hesaplama Aracı | Hesapera',
    description: 'MEB motorlu taşıt sürücü kursu teorik sınavı doğru sayınıza göre puanınızı ve başarı durumunuzu hesaplayın.',
    keywords: ["ehliyet sınavı puan","sürücü kursu sınavı","ehliyet teorik puan","ehliyet sınav hesaplama"],
    canonical: 'https://hesapera.com/ehliyet-sinavi-puan',
    faq: [],
    relatedCalculators: ["aks-puan"]
  },
  fields: [
  {
    "id": "correct",
    "label": "Doğru Sayısı",
    "type": "number",
    "required": true,
    "min": 0,
    "max": 50
  }
],
  schema,
  calculate: (input) => {
    return calculateEhliyetSinavi(input.correct);
  }
};

