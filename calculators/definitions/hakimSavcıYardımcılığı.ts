import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateHakimSavciYardimciligi } from '../formulas/hakimSavcıYardımcılığı';

const schema = z.object({
  gyCorrect: z.number().int().min(0).max(40),
  gyWrong: z.number().int().min(0).max(40),
  hukukCorrect: z.number().int().min(0).max(60),
  hukukWrong: z.number().int().min(0).max(60)
});

type Input = z.infer<typeof schema>;

export const hakimSavcıYardımcılığıCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_hakimSavcıYardımcılığı_001',
  slug: 'h-kim-ve-savci-yardimciligi-sinavi-puan',
  status: 'draft',
  name: 'HÃ¢kim ve Savcı Yardımcılığı Sınavı Puan Hesaplama',
  shortDescription: 'Adalet Bakanlığı HÃ¢kim ve Savcı Yardımcılığı Yazılı Sınavı Genel Yetenek (40 soru) ve Hukuk (60 soru) testleri doğru/yanlış sayılarınıza göre yaklaşık ham puanınızı hesaplayın.',
  category: 'education',
  type: 'complex',
  metadata: {
    title: 'HÃ¢kim ve Savcı Yardımcılığı Sınavı Puan Hesaplama Aracı | Hesapera',
    description: 'Adalet Bakanlığı HÃ¢kim ve Savcı Yardımcılığı Yazılı Sınavı Genel Yetenek ve Hukuk testleri doğru/yanlış sayılarınıza göre tahmini puanınızı hesaplayın.',
    keywords: ["hakim savcı yardımcılığı sınavı","hakim savcı puan hesaplama","adalet bakanlığı sınavı"],
    canonical: 'https://hesapera.com/h-kim-ve-savci-yardimciligi-sinavi-puan',
    faq: [],
    relatedCalculators: ["ales-puan","ekpss-puan"]
  },
  fields: [
  {
    "id": "gyCorrect",
    "label": "Genel Yetenek Doğru",
    "type": "number",
    "required": true,
    "min": 0,
    "max": 40
  },
  {
    "id": "gyWrong",
    "label": "Genel Yetenek Yanlış",
    "type": "number",
    "required": true,
    "min": 0,
    "max": 40
  },
  {
    "id": "hukukCorrect",
    "label": "Hukuk Doğru",
    "type": "number",
    "required": true,
    "min": 0,
    "max": 60
  },
  {
    "id": "hukukWrong",
    "label": "Hukuk Yanlış",
    "type": "number",
    "required": true,
    "min": 0,
    "max": 60
  }
],
  schema,
  calculate: (input) => {
    return calculateHakimSavciYardimciligi(input.gyCorrect, input.gyWrong, input.hukukCorrect, input.hukukWrong);
  }
};

