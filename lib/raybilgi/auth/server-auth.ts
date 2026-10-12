import 'server-only';
import prisma from '@/lib/db/prisma';
import { verifyPassword } from './password';

// Normalize Turkish to lowercase ascii roughly, just for matching
export function normalizeTurkish(text: string) {
  return text
    .trim()
    .replace(/I/g, 'ı')
    .replace(/İ/g, 'i')
    .replace(/Ş/g, 'ş')
    .replace(/Ğ/g, 'ğ')
    .replace(/Ü/g, 'ü')
    .replace(/Ö/g, 'ö')
    .replace(/Ç/g, 'ç')
    .toLowerCase();
}

/**
 * Validates station login credentials against the database password hash.
 * 
 * In Phase B, authentication requires a provisioned DB record in RayBilgiStationAccount
 * with a matching password hash. Station codes no longer function as password material,
 * and legacy derived passwords (e.g. code + code) are strictly rejected with zero fallback.
 * 
 * Returns null if account does not exist, is disabled, or password verification fails.
 * Plaintext passwords and expected hashes are never logged.
 */
export async function validateStationLogin(username: string, passwordString: string) {
  if (!username || !passwordString) return null;

  const canonicalUsername = normalizeTurkish(username);

  // Look up account by normalized username or station code
  const account = await prisma.rayBilgiStationAccount.findFirst({
    where: {
      OR: [
        { username: canonicalUsername },
        { stationCode: canonicalUsername },
      ],
    },
  });

  if (!account || !account.enabled) {
    return null;
  }

  const isMatch = await verifyPassword(passwordString, account.passwordHash);
  if (!isMatch) {
    return null;
  }

  return {
    stationCode: account.stationCode,
    stationName: account.stationName,
    username: account.username,
  };
}
