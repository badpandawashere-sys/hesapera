export function calculateAge(birthDateStr: string, targetDateStr?: string) {
  const parseDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
  };
  
  const birthDate = parseDate(birthDateStr);
  const targetDate = targetDateStr ? parseDate(targetDateStr) : new Date();
  
  // Strip time from targetDate if it's today
  targetDate.setHours(0, 0, 0, 0);

  let years = targetDate.getFullYear() - birthDate.getFullYear();
  let months = targetDate.getMonth() - birthDate.getMonth();
  let days = targetDate.getDate() - birthDate.getDate();

  if (days < 0) {
    months--;
    // Add days of the previous month
    const prevMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  const diffTime = targetDate.getTime() - birthDate.getTime();
  const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  return {
    primaryResult: years + ' Yaşında',
    secondaryResults: {
      'Yıl': years,
      'Ay': months,
      'Gün': days,
      'Toplam Geçen Gün': totalDays
    }
  };
}