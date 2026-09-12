export function calculateArea(length: number, width: number) {
  const area = length * width;
  
  return {
    primaryResult: area + ' m²',
    secondaryResults: {
      'Uzunluk': length + ' m',
      'Genişlik': width + ' m'
    }
  };
}