export function calculatePerimeter(input: any) {
  let perimeter = 0;
  let shapeName = input.sekil;
  const unit = input.birim;
  const measures: any = {};

  if (shapeName === 'Kare') {
    perimeter = 4 * input.kenarA;
    measures['Kenar (a)'] = input.kenarA + ' ' + unit;
  } else if (shapeName === 'Dikdörtgen' || shapeName === 'Paralelkenar') {
    perimeter = 2 * (input.kenarA + input.kenarB);
    measures['Kenar (a)'] = input.kenarA + ' ' + unit;
    measures['Kenar (b)'] = input.kenarB + ' ' + unit;
  } else if (shapeName === 'Üçgen') {
    perimeter = input.kenarA + input.kenarB + input.kenarC;
    measures['Kenarlar (a, b, c)'] = `${input.kenarA}, ${input.kenarB}, ${input.kenarC} ${unit}`;
  } else if (shapeName === 'Daire') {
    perimeter = 2 * Math.PI * input.yaricap;
    measures['Yarıçap (r)'] = input.yaricap + ' ' + unit;
  } else if (shapeName === 'Yamuk') {
    perimeter = input.kenarA + input.kenarB + input.kenarC + input.kenarD;
    measures['Kenarlar (a, b, c, d)'] = `${input.kenarA}, ${input.kenarB}, ${input.kenarC}, ${input.kenarD} ${unit}`;
  }

  // Format to reasonable decimal places, dropping unnecessary .0000
  const formattedPerimeter = Number.isInteger(perimeter) ? perimeter.toString() : perimeter.toFixed(4).replace(/\.?0+$/, '');

  return {
    primaryResult: `${formattedPerimeter} ${unit}`,
    secondaryResults: {
      'Şekil': shapeName,
      ...measures
    }
  };
}