'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, AlertCircle, ExternalLink, Copy, Check } from 'lucide-react';

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    kvkkConsent: false,
  });

  const [status, setStatus] = useState<'idle' | 'mail_opened' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [copied, setCopied] = useState(false);

  const subjectOptions: Record<string, string> = {
    'arac-talebi': 'Yeni Hesaplama Aracı Talebi',
    'hata-bildirimi': 'Hatalı Hesaplama / Bug Bildirimi',
    'is-birligi': 'İş Birliği & Kurumsal',
    'oneri': 'Görüş & Öneri',
    'diger': 'Genel İletişim',
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setStatus('error');
      setErrorMessage('Lütfen tüm zorunlu alanları doldurunuz.');
      return;
    }

    if (!formData.kvkkConsent) {
      setStatus('error');
      setErrorMessage('Lütfen KVKK Aydınlatma Metni bilgilendirmesini onaylayınız.');
      return;
    }

    setErrorMessage('');

    const subjectText = subjectOptions[formData.subject] || formData.subject || 'Yeni Mesaj';
    const emailSubject = `[Hesapera İletişim] ${subjectText} - ${formData.name.trim()}`;
    const emailBody = `Ad Soyad: ${formData.name.trim()}
E-posta: ${formData.email.trim()}
Konu: ${subjectText}

Mesaj:
${formData.message.trim()}
`;

    const mailtoUrl = `mailto:info@hesapera.com.tr?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

    try {
      window.location.href = mailtoUrl;
      setStatus('mail_opened');
    } catch {
      setStatus('error');
      setErrorMessage('E-posta istemcisi açılamadı. Lütfen doğrudan info@hesapera.com.tr adresine yazınız.');
    }
  };

  const copyEmail = () => {
    navigator.clipboard.writeText('info@hesapera.com.tr');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (status === 'mail_opened') {
    return (
      <div className="p-8 rounded-2xl bg-surface-container-lowest border border-border/80 shadow-sm text-center space-y-5">
        <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
          <Mail className="w-6 h-6" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-foreground">E-posta Uygulamanız Açılıyor</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            Mesajınız hazırlandı. Gönderimi e-posta uygulamanızdan <strong className="text-foreground">Gönder</strong> butonuna basarak tamamlayabilirsiniz.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-muted/40 border border-border/60 max-w-md mx-auto text-left space-y-2">
          <div className="text-xs font-semibold uppercase text-muted-foreground">Alternatif Doğrudan Gönderim</div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            E-posta uygulamanız otomatik açılmadıysa mesajınızı doğrudan aşağıdaki resmi adrese iletebilirsiniz:
          </p>
          <div className="flex items-center justify-between gap-2 pt-1">
            <span className="text-sm font-bold text-primary">info@hesapera.com.tr</span>
            <button
              onClick={copyEmail}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-border bg-background text-xs font-medium hover:bg-muted transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  Kopyalandı
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Adresi Kopyala
                </>
              )}
            </button>
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={() => setStatus('idle')}
            className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Forma Geri Dön ve Düzenle
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-2xl bg-surface-container-lowest border border-border/80 shadow-sm space-y-5">
      <div className="space-y-1">
        <h3 className="text-xl font-bold text-foreground">Bize E-posta Gönderin</h3>
        <p className="text-sm text-muted-foreground">
          Aşağıdaki formu doldurarak doğrudan varsayılan e-posta istemciniz üzerinden mesajınızı iletebilirsiniz.
        </p>
      </div>

      {status === 'error' && (
        <div className="p-4 rounded-xl bg-red-50 text-red-700 text-sm flex items-start gap-3 border border-red-200">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="name" className="text-sm font-medium text-foreground">
            Adınız Soyadınız <span className="text-destructive">*</span>
          </label>
          <input
            id="name"
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Örn. Ahmet Yılmaz"
            className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium text-foreground">
            E-posta Adresiniz <span className="text-destructive">*</span>
          </label>
          <input
            id="email"
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="adiniz@alanadi.com"
            className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="subject" className="text-sm font-medium text-foreground">
          Konu
        </label>
        <select
          id="subject"
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
        >
          <option value="">Lütfen bir konu seçiniz</option>
          <option value="arac-talebi">Yeni Hesaplama Aracı Talebi</option>
          <option value="hata-bildirimi">Hatalı Hesaplama / Bug Bildirimi</option>
          <option value="is-birligi">İş Birliği & Kurumsal</option>
          <option value="oneri">Görüş & Öneri</option>
          <option value="diger">Diğer</option>
        </select>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="message" className="text-sm font-medium text-foreground">
          Mesajınız <span className="text-destructive">*</span>
        </label>
        <textarea
          id="message"
          rows={5}
          required
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          placeholder="Mesajınızı, hesaplama detayını veya iletmek istediğiniz hususu buraya yazabilirsiniz..."
          className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-y min-h-[120px]"
        />
      </div>

      <div className="flex items-start gap-2.5 pt-1">
        <input
          type="checkbox"
          id="kvkkConsent"
          checked={formData.kvkkConsent}
          onChange={(e) => setFormData({ ...formData, kvkkConsent: e.target.checked })}
          className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
        />
        <label htmlFor="kvkkConsent" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
          <Link href="/kvkk" target="_blank" className="text-primary hover:underline font-medium">
            KVKK Aydınlatma Metni
          </Link>
          &apos;ni ve{' '}
          <Link href="/gizlilik" target="_blank" className="text-primary hover:underline font-medium">
            Gizlilik Politikası
          </Link>
          &apos;nı okudum.
        </label>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
        <button
          type="submit"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium shadow hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all cursor-pointer"
        >
          <Mail className="w-4 h-4" />
          E-posta Uygulamasıyla Gönder
          <ExternalLink className="w-3.5 h-3.5 opacity-70" />
        </button>

        <span className="text-xs text-muted-foreground">
          Hedef: <strong className="text-foreground">info@hesapera.com.tr</strong>
        </span>
      </div>
    </form>
  );
}
