'use client';

import React, { useState, useTransition } from 'react';
import { Eye, EyeOff, Train } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { loginAction } from '@/lib/raybilgi/auth/actions';

export function LoginForm({ nextUrl }: { nextUrl?: string }) {
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    const formData = new FormData(e.currentTarget);
    if (nextUrl) {
      formData.append('next', nextUrl);
    }

    startTransition(async () => {
      const result = await loginAction(formData);
      if (result && result.error) {
        setError(result.error);
      }
    });
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
          GVD ve kullanıcıya özel RayBilgi araçlarına erişmek için istasyon hesabınızla giriş yapın.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Kullanıcı ID</Label>
            <Input
              id="username"
              name="username"
              type="text"
              placeholder="Örn: arifiye"
              required
              autoComplete="username"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Şifre</Label>
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
            <Checkbox id="remember" name="remember" />
            <label
              htmlFor="remember"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Beni Hatırla
            </label>
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm font-medium text-center text-destructive">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full mt-2" disabled={isPending}>
            {isPending ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
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
