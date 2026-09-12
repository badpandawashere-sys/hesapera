export function calculateAreaGeometry(input: any) {
  let area = 0;
  let shapeName = '';
  const measures: any = {};

  if (input.shape === 'square') {
    area = input.side * input.side;
    shapeName = 'Kare';
    measures['Kenar'] = input.side + ' m';
  } else if (input.shape === 'rectangle') {
    area = input.length * input.width;
    shapeName = 'Dikdörtgen';
    measures['Uzunluk'] = input.length + ' m';
    measures['Genişlik'] = input.width + ' m';
  } else if (input.shape === 'triangle') {
    area = (input.base * input.height) / 2;
    shapeName = 'Üçgen';
    measures['Taban'] = input.base + ' m';
    measures['Yükseklik'] = input.height + ' m';
  } else if (input.shape === 'circle') {
    area = Math.PI * input.radius * input.radius;
    shapeName = 'Daire';
    measures['Yarıçap'] = input.radius + ' m';
  }

  return {
    primaryResult: area.toFixed(4) + ' m²',
    secondaryResults: {
      'Şekil': shapeName,
      ...measures
    }
  };
}