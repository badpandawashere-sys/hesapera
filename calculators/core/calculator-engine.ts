import { CalculatorRegistry } from './calculator-registry';
import { CalculatorResult } from './calculator-result';
import { CalculatorContext } from './calculator-types';

export class CalculatorEngine {
  static async runById(
    id: string,
    rawInput: unknown,
    ctx?: CalculatorContext
  ): Promise<CalculatorResult<any, any>> {
    const definition = CalculatorRegistry.get(id);
    if (!definition) {
      return {
        success: false,
        errors: [`Calculator with ID '${id}' not found.`],
      };
    }
    return this.execute(definition, rawInput, ctx);
  }

  static async runBySlug(
    slug: string,
    rawInput: unknown,
    ctx?: CalculatorContext
  ): Promise<CalculatorResult<any, any>> {
    const definition = CalculatorRegistry.getBySlug(slug);
    if (!definition) {
      return {
        success: false,
        errors: [`Calculator with slug '${slug}' not found.`],
      };
    }
    return this.execute(definition, rawInput, ctx);
  }

  private static async execute(
    definition: any,
    rawInput: unknown,
    ctx?: CalculatorContext
  ): Promise<CalculatorResult<any, any>> {
    try {
      const parsedInput = definition.schema.safeParse(rawInput);
      
      if (!parsedInput.success) {
        return {
          success: false,
          errors: parsedInput.error.issues.map((err: any) => `${err.path.join('.')}: ${err.message}`),
        };
      }

      const rawResult = await definition.calculate(parsedInput.data, ctx);

      if (rawResult && typeof rawResult === 'object') {
        // 1. Handle formulas returning { success: false, errors: ... } (e.g. hmgs, isg)
        if ('success' in rawResult && rawResult.success === false) {
          const formattedErrors: string[] = [];
          const errObj = rawResult.errors;
          if (Array.isArray(errObj)) {
            formattedErrors.push(...errObj.map(String));
          } else if (errObj && typeof errObj === 'object') {
            for (const [key, messages] of Object.entries(errObj)) {
              const msgList = Array.isArray(messages) ? messages : [messages];
              for (const msg of msgList) {
                formattedErrors.push(key === 'base' ? String(msg) : `${key}: ${String(msg)}`);
              }
            }
          }
          return {
            success: false,
            errors: formattedErrors.length > 0 ? formattedErrors : ['Hesaplama sırasında doğrulama hatası oluştu.'],
          };
        }

        // 2. Handle formulas returning { score, details } (e.g. iyos-puan)
        if ('score' in rawResult && 'details' in rawResult && !('primaryResult' in rawResult)) {
          const details = rawResult.details || {};
          const secondaryResults: Record<string, string | number> = {};
          if (details.hp !== undefined) {
            secondaryResults['Ham Puan (Doğru Sayısı)'] = details.hp;
          }
          if (details.validQuestions !== undefined) {
            secondaryResults['Geçerli Soru Sayısı'] = details.validQuestions;
          }
          if (details.status) {
            secondaryResults['Başarı Durumu'] = details.status;
          }

          const notes: string[] = [];
          if (details.note) {
            notes.push(String(details.note));
          }

          if (rawResult.score !== null && rawResult.score !== undefined) {
            const formattedScore =
              typeof rawResult.score === 'number'
                ? `${new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 5 }).format(rawResult.score)} Puan`
                : String(rawResult.score);
            return {
              success: true,
              data: {
                primaryResult: formattedScore,
                primaryLabel: 'İYÖS Başarı Puanı',
                secondaryResults,
              },
              notes: notes.length > 0 ? notes : undefined,
            };
          } else {
            return {
              success: true,
              data: {
                primaryResult: details.hp !== undefined ? String(details.hp) : 'Ham Puan Hesaplandı',
                primaryLabel: 'İYÖS Ham Puanı',
                secondaryResults,
              },
              notes: notes.length > 0 ? notes : undefined,
            };
          }
        }

        // 3. Standard { primaryResult, ... } shape (plus normalization for results array & notes)
        if ('primaryResult' in rawResult) {
          const normalizedData: any = { ...rawResult };

          // Normalize results: Array<{ label, value }> into secondaryResults (e.g. hakimSavcıYardımcılığı)
          if (
            Array.isArray(rawResult.results) &&
            rawResult.results.length > 0 &&
            (!rawResult.secondaryResults || Object.keys(rawResult.secondaryResults).length === 0)
          ) {
            const mappedSecondary: Record<string, string | number> = {};
            for (const item of rawResult.results) {
              if (item && item.label !== undefined && item.value !== undefined) {
                mappedSecondary[String(item.label)] =
                  typeof item.value === 'number'
                    ? `${new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 2 }).format(item.value)} Net`
                    : String(item.value);
              }
            }
            normalizedData.secondaryResults = mappedSecondary;

            // Promote first Toplam Net entry when primaryResult is generic placeholder
            if (rawResult.primaryResult === 'Hesaplama Tamamlandı') {
              const totalEntry =
                rawResult.results.find((r: any) => String(r.label).includes('Toplam Net')) ||
                rawResult.results[rawResult.results.length - 1];
              if (totalEntry) {
                normalizedData.primaryLabel = String(totalEntry.label);
                normalizedData.primaryResult =
                  typeof totalEntry.value === 'number'
                    ? `${new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 2 }).format(totalEntry.value)} Net`
                    : String(totalEntry.value);
              }
            }
          }

          return {
            success: true,
            data: normalizedData,
            notes: Array.isArray(rawResult.notes) ? rawResult.notes : undefined,
            warnings: Array.isArray(rawResult.warnings) ? rawResult.warnings : undefined,
          };
        }
      }

      return {
        success: true,
        data: {
          primaryResult:
            rawResult !== null && typeof rawResult === 'object'
              ? JSON.stringify(rawResult)
              : rawResult,
        },
      };

    } catch (error: any) {
      if (error && Array.isArray(error.issues)) {
        return {
          success: false,
          errors: error.issues.map((err: any) =>
            err.path && err.path.length > 0 ? `${err.path.join('.')}: ${err.message}` : String(err.message)
          ),
        };
      }
      return {
        success: false,
        errors: [error?.message || 'An unexpected error occurred during calculation.'],
      };
    }
  }
}
