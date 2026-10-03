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

  return {
    nets: {
      turkce: turkceNet,
      sosyal: sosyalNet,
      matematik: matematikNet,
      fen: fenNet,
      total: totalNet
    },
    isEligible,
    weightsInfo: WEIGHTS
  };
}
