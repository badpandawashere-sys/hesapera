import { test, expect } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '@/components/raybilgi/login-form';
import RayBilgiPage from '@/app/raybilgi/page';

test('LoginForm renders username and password fields', () => {
  render(<LoginForm />);
  expect(screen.getByLabelText(/Kullanıcı Adı \/ E-posta/i)).toBeDefined();
  expect(screen.getByLabelText(/^Şifre$/i)).toBeDefined();
  expect(screen.getByRole('button', { name: /Giriş Yap/i })).toBeDefined();
});

test('Show/Hide password works', async () => {
  render(<LoginForm />);
  const passInput = screen.getByLabelText(/^Şifre$/i) as HTMLInputElement;
  const toggleBtn = screen.getByLabelText(/Şifreyi göster/i);
  
  expect(passInput.type).toBe('password');
  
  await userEvent.click(toggleBtn);
  expect(passInput.type).toBe('text');
  
  await userEvent.click(screen.getByLabelText(/Şifreyi gizle/i));
  expect(passInput.type).toBe('password');
});

test('Giriş sistemi henüz aktif değil message appears on submit', async () => {
  render(<LoginForm />);
  
  const userIn = screen.getByLabelText(/Kullanıcı Adı/i);
  const passIn = screen.getByLabelText(/^Şifre$/i);
  
  await userEvent.type(userIn, 'testuser');
  await userEvent.type(passIn, 'testpass');
  
  const form = userIn.closest('form');
  fireEvent.submit(form!);
  
  expect(screen.getByText('Giriş Yapılıyor...')).toBeDefined();
  
  // Wait for 800ms
  await act(async () => {
    await new Promise(r => setTimeout(r, 850));
  });
  
  expect(screen.getByText('Giriş sistemi henüz aktif değil.')).toBeDefined();
});

test('Landing page GVD links to login', () => {
  render(<RayBilgiPage />);
  const gvdCard = screen.getByTestId('raybilgi-card-gvd');
  expect(gvdCard.getAttribute('href')).toBe('/raybilgi/giris?next=/raybilgi/gvd');
  
  const thbfCard = screen.getByTestId('raybilgi-card-thbf');
  expect(thbfCard.getAttribute('href')).toBe('/raybilgi/thbf');
  
  const cekerCard = screen.getByTestId('raybilgi-card-ceker');
  expect(cekerCard.getAttribute('href')).toBe('/raybilgi/ceker-bilgi');
});
