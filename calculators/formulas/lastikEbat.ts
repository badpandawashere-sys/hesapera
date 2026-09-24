export interface TireSpec {
  width: number;
  aspectRatio: number;
  rimInch: number;
}

export interface LastikEbatInputs {
  oldTire: TireSpec;
  newTire: TireSpec;
  indicatedSpeed: number;
}

export interface TireCalculation {
  sidewallHeight: number;
  rimDiameterMm: number;
  overallDiameter: number;
  circumference: number;
  revolutionsPerKm: number;
}

export interface LastikEbatResult {
  oldTireCalc: TireCalculation;
  newTireCalc: TireCalculation;
  diameterDifference: number;
  diameterDifferencePercent: number;
  rideHeightDifference: number;
  actualSpeed: number;
}

function calculateTire(spec: TireSpec): TireCalculation {
  const sidewallHeight = (spec.width * spec.aspectRatio) / 100;
  const rimDiameterMm = spec.rimInch * 25.4;
  const overallDiameter = rimDiameterMm + (2 * sidewallHeight);
  const circumference = overallDiameter * Math.PI;
  const revolutionsPerKm = 1000000 / circumference;

  return {
    sidewallHeight,
    rimDiameterMm,
    overallDiameter,
    circumference,
    revolutionsPerKm
  };
}

export function calculateLastikEbat(inputs: LastikEbatInputs): LastikEbatResult {
  // If invalid, fallback gently
  if (!inputs.oldTire.width || !inputs.oldTire.aspectRatio || !inputs.oldTire.rimInch || 
      !inputs.newTire.width || !inputs.newTire.aspectRatio || !inputs.newTire.rimInch) {
      return {
          oldTireCalc: { sidewallHeight: 0, rimDiameterMm: 0, overallDiameter: 0, circumference: 0, revolutionsPerKm: 0 },
          newTireCalc: { sidewallHeight: 0, rimDiameterMm: 0, overallDiameter: 0, circumference: 0, revolutionsPerKm: 0 },
          diameterDifference: 0,
          diameterDifferencePercent: 0,
          rideHeightDifference: 0,
          actualSpeed: inputs.indicatedSpeed || 100
      };
  }

  const oldTireCalc = calculateTire(inputs.oldTire);
  const newTireCalc = calculateTire(inputs.newTire);

  const diameterDifference = newTireCalc.overallDiameter - oldTireCalc.overallDiameter;
  const diameterDifferencePercent = oldTireCalc.overallDiameter > 0 ? (diameterDifference / oldTireCalc.overallDiameter) * 100 : 0;
  const rideHeightDifference = diameterDifference / 2;
  const actualSpeed = oldTireCalc.circumference > 0 ? (inputs.indicatedSpeed || 100) * (newTireCalc.circumference / oldTireCalc.circumference) : (inputs.indicatedSpeed || 100);

  return {
    oldTireCalc,
    newTireCalc,
    diameterDifference,
    diameterDifferencePercent,
    rideHeightDifference,
    actualSpeed: Number.isNaN(actualSpeed) || !Number.isFinite(actualSpeed) ? 0 : actualSpeed
  };
}
