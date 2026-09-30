import { z } from 'zod';

export const IyosSchema = z.object({
  system: z.enum(['current', 'legacy']),
  hp: z.number().int().min(0).max(120),
  x: z.number().min(0).max(120).optional(),
  s: z.number().min(0.0001).max(120).optional(),
  b: z.number().min(0).max(120).optional(),
  cancelled: z.number().int().min(0).max(119).optional()
}).superRefine((data, ctx) => {
  if (data.system === 'current') {
    const hasX = data.x !== undefined;
    const hasS = data.s !== undefined;
    const hasB = data.b !== undefined;
    const allStats = hasX && hasS && hasB;
    const anyStats = hasX || hasS || hasB;

    if (anyStats && !allStats) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Puan hesaplamak için Ortalama Ham Puan, Standart Sapma ve En Yüksek Ham Puan değerlerinin üçünü de giriniz.',
        path: ['x']
      });
      return;
    }

    if (allStats) {
      if (data.b! < data.hp) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'En yüksek ham puan (B), adayın ham puanından (HP) küçük olamaz.',
          path: ['b']
        });
      }
      if (data.b! <= data.x!) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'En yüksek ham puan (B), ortalama ham puandan (X) büyük olmalıdır.',
          path: ['b']
        });
      }
      const denom = 7 * (data.b! - data.x!) - data.s!;
      if (denom <= 0 || isNaN(denom) || !isFinite(denom)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Girilen istatistikler geçerli bir formül paydası oluşturmuyor. Değerleri kontrol edin.',
          path: ['b']
        });
      }
    }
  } else {
    const validQuestions = 120 - (data.cancelled || 0);
    if (data.hp > validQuestions) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Doğru sayısı geçerli soru sayısından (${validQuestions}) büyük olamaz.`,
        path: ['hp']
      });
    }
    if (validQuestions <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Geçerli soru sayısı 0 veya daha az olamaz.',
        path: ['cancelled']
      });
    }
  }
});

export type IyosInput = z.infer<typeof IyosSchema>;

export function calculateIyos(input: IyosInput) {
  const validated = IyosSchema.parse(input);

  if (validated.system === 'current') {
    const { hp, x, s, b } = validated;

    if (x !== undefined && s !== undefined && b !== undefined) {
      const numerator = 7 * (hp - x) - s;
      const denominator = 7 * (b - x) - s;
      const score = 70 + 30 * (numerator / denominator);

      const success = score >= 70;

      return {
        score,
        details: {
          hp,
          status: success ? 'Başarılı' : 'Başarısız'
        }
      };
    } else {
      return {
        score: null,
        details: {
          hp,
          note: '2026-İYÖS puanı; adayların ham puan ortalaması, standart sapması ve sınavdaki en yüksek ham puan kullanılarak hesaplanır. Bu istatistikler bilinmeden kesin İYÖS puanı hesaplanamaz.'
        }
      };
    }
  } else {
    const hp = validated.hp;
    const cancelled = validated.cancelled || 0;
    const validQuestions = 120 - cancelled;

    const score = (hp * 100) / validQuestions;
    const success = score >= 70;

    return {
      score,
      details: {
        hp,
        validQuestions,
        status: success ? 'Başarılı' : 'Başarısız'
      }
    };
  }
}
