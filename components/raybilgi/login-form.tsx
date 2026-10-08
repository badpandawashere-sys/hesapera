'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, Train } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    // Simulate network request
    setTimeout(() => {
      setIsSubmitting(false);
      setMessage('Giriş sistemi henüz aktif değil.');
    }, 800);
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-sm border-border/50">
      <CardHeader className="space-y-2 text-center pb-6">
        <div className="flex justify-center mb-2">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <Train className="w-6 h-6 text-primary" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">Giriş Yap</CardTitle>
        <CardDescription className="text-sm">
          GVD ve kullanıcıya özel RayBilgi araçlarına erişmek için hesabınızla giriş yapın.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Kullanıcı Adı / E-posta</Label>
            <Input
              id="username"
              name="username"
              type="text"
              placeholder="E-posta adresiniz veya kullanıcı adınız"
              required
              autoComplete="username"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Şifre</Label>
              <button 
                type="button" 
                className="text-xs font-medium text-primary hover:underline"
                onClick={() => alert('Şifre sıfırlama sistemi henüz aktif değil.')}
              >
                Şifremi Unuttum
              </button>
            </div>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-1">
            <Checkbox id="remember" />
            <label
              htmlFor="remember"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Beni Hatırla
            </label>
          </div>

          {message && (
            <div className="p-3 bg-muted/50 border border-border rounded-lg text-sm font-medium text-center text-foreground">
              {message}
            </div>
          )}

          <Button type="submit" className="w-full mt-2" disabled={isSubmitting}>
            {isSubmitting ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center border-t border-border/40 pt-4 pb-6">
        <div className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
          <span>Hesapera</span>
          <span className="w-1 h-1 rounded-full bg-muted-foreground/30"></span>
          <span>RayBilgi</span>
        </div>
      </CardFooter>
    </Card>
  );
}
