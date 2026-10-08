'use server';

import { validateStationLogin } from './server-auth';
import { createSession, deleteSession } from './session';
import { redirect } from 'next/navigation';

export async function loginAction(formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;
  const remember = formData.get('remember') === 'on';
  const nextUrl = formData.get('next') as string;

  if (!username || !password) {
    return { error: 'Kullanıcı ID veya şifre hatalı.' }; // Generic
  }

  // Rate limiting stub: Add real implementation here if infrastructure allows
  // await checkRateLimit(username);

  const validStation = await validateStationLogin(username, password);

  if (!validStation) {
    return { error: 'Kullanıcı ID veya şifre hatalı.' };
  }

  await createSession(validStation.stationCode, validStation.stationName, remember);

  // Validate nextUrl securely to prevent open redirects
  let redirectUrl = '/raybilgi/gvd';
  if (nextUrl && nextUrl.startsWith('/raybilgi/')) {
    redirectUrl = nextUrl;
  }

  redirect(redirectUrl);
}

export async function logoutAction() {
  await deleteSession();
  redirect('/raybilgi/giris');
}
