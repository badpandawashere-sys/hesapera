type CertificateOption = 'workplacePhysician' | 'cClass' | 'bClass' | 'aClass' | 'otherHealthPersonnel';

export function calculateIsg(
  certificate: CertificateOption,
  correct: number,
  cancelled: number = 0
) {
  if (!['workplacePhysician', 'cClass', 'bClass', 'aClass', 'otherHealthPersonnel'].includes(certificate)) {
    return { success: false, errors: { certificate: ['Geçerli bir sertifika alanı seçiniz.'] } };
  }

  if (!Number.isInteger(correct) || correct < 0 || correct > 50) {
    return { success: false, errors: { correct: ['Doğru sayısı 0 ile 50 arasında bir tam sayı olmalıdır.'] } };
  }

  if (!Number.isInteger(cancelled) || cancelled < 0 || cancelled >= 50) {
    return { success: false, errors: { cancelled: ['İptal edilen soru sayısı 0 ile 49 arasında bir tam sayı olmalıdır.'] } };
  }

  const validQuestions = 50 - cancelled;

  if (correct > validQuestions) {
    return { success: false, errors: { correct: ['Doğru sayısı geçerli soru sayısından (' + validQuestions + ') büyük olamaz.'] } };
  }

  const threshold = certificate === 'otherHealthPersonnel' ? 60 : 70;
  const score = (correct * 100) / validQuestions;

  const formatScore = (val: number) => {
    return new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 5 }).format(val);
  };

  const isSuccessful = score >= threshold;

  const getCertificateLabel = (val: CertificateOption) => {
    switch (val) {
      case 'workplacePhysician': return 'İş Yeri Hekimliği';
      case 'aClass': return 'A Sınıfı İş Güvenliği Uzmanlığı';
      case 'bClass': return 'B Sınıfı İş Güvenliği Uzmanlığı';
      case 'cClass': return 'C Sınıfı İş Güvenliği Uzmanlığı';
      case 'otherHealthPersonnel': return 'Diğer Sağlık Personeli';
    }
  };

  return {
    success: true,
    primaryResult: formatScore(score),
    primaryLabel: 'İSG Puanı',
    secondaryResults: {
      'Sertifika Alanı': getCertificateLabel(certificate),
      'Doğru Sayısı': correct.toString(),
      'Geçerli Soru Sayısı': validQuestions.toString(),
      'İptal Edilen Soru Sayısı': cancelled.toString(),
      'Başarı İçin Gerekli Puan': threshold.toString(),
      'Başarı Durumu': isSuccessful ? 'Başarılı' : 'Başarısız'
    }
  };
}
