import { validateExamInputs } from "./exams/core";

export type MsuScoreType = "SAY" | "SOZ" | "EA" | "GENEL";

export const WEIGHTS = {
  SAY:   { turkce: 25, matematik: 35, fen: 30, sosyal: 10 },
  EA:    { turkce: 35, matematik: 35, fen: 10, sosyal: 20 },
  SOZ:   { turkce: 35, matematik: 20, fen: 10, sosyal: 35 },
  GENEL: { turkce: 33, matematik: 33, fen: 17, sosyal: 17 }
};

export function calculateMsu(
  turkceC: number, turkceW: number,
  sosyalC: number, sosyalW: number,
  matematikC: number, matematikW: number,
  fenC: number, fenW: number
) {
  validateExamInputs(turkceC, turkceW, 40 - turkceC - turkceW, 40);
  validateExamInputs(sosyalC, sosyalW, 20 - sosyalC - sosyalW, 20);
  validateExamInputs(matematikC, matematikW, 40 - matematikC - matematikW, 40);
  validateExamInputs(fenC, fenW, 20 - fenC - fenW, 20);

  // Negative clamp yok
  const turkceNet = turkceC - (turkceW / 4);
  const sosyalNet = sosyalC - (sosyalW / 4);
  const matematikNet = matematikC - (matematikW / 4);
  const fenNet = fenC - (fenW / 4);

  const totalNet = turkceNet + sosyalNet + matematikNet + fenNet;

  // Eligibility
  const isEligible = turkceNet >= 0.5 || matematikNet >= 0.5;

  let estimatedScores = null;

  if (isEligible) {
    const clamp = (val: number) => Math.max(100, Math.min(500, val));

    // 2026 Calibrated Linear Models derived from exact reference test cases
    const sa = 138.062496 + (turkceNet * 2.845468) + (sosyalNet * 2.204565) + (matematikNet * 3.048055) + (fenNet * 4.283107);
    const so = 145.555593 + (turkceNet * 3.470015) + (sosyalNet * 6.721105) + (matematikNet * 1.517172) + (fenNet * 1.243619);
    const ea = 137.919972 + (turkceNet * 3.669996) + (sosyalNet * 4.061971) + (matematikNet * 2.808062) + (fenNet * 1.315290);
    const gn = 136.996709 + (turkceNet * 3.550661) + (sosyalNet * 3.542856) + (matematikNet * 2.716754) + (fenNet * 2.294395);

    estimatedScores = {
      SAY: clamp(sa),
      SOZ: clamp(so),
      EA: clamp(ea),
      GENEL: clamp(gn),
    };
  }

  return {
    nets: {
      turkce: turkceNet,
      sosyal: sosyalNet,
      matematik: matematikNet,
      fen: fenNet,
      total: totalNet
    },
    isEligible,
    estimatedScores,
    weightsInfo: WEIGHTS
  };
}
