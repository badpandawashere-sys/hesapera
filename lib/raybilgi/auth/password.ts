import 'server-only';
import crypto from 'crypto';

const SCRYPT_COST = 16384;
const SCRYPT_BLOCK_SIZE = 8;
const SCRYPT_PARALLELIZATION = 1;
const KEY_LEN = 64;

export interface PasswordValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates new password according to RayBilgi security policy:
 * - Minimum 12 characters
 * - Maximum 128 characters
 * - Allows any characters including Turkish letters
 * - Mismatch check against confirmation
 */
export function validatePasswordPolicy(password: string, confirmation: string): PasswordValidationResult {
  if (!password || typeof password !== 'string') {
    return { valid: false, error: 'Şifre boş bırakılamaz.' };
  }
  if (password.length < 12) {
    return { valid: false, error: 'Şifre en az 12 karakter olmalıdır.' };
  }
  if (password.length > 128) {
    return { valid: false, error: 'Şifre en fazla 128 karakter olabilir.' };
  }
  if (password !== confirmation) {
    return { valid: false, error: 'Girilen şifreler birbiriyle eşleşmiyor.' };
  }
  return { valid: true };
}

/**
 * Hashes password using Node.js crypto.scrypt with a random 16-byte salt.
 * Formats output as: scrypt$cost=16384,r=8,p=1$hexSalt$hexHash
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16);
  return new Promise((resolve, reject) => {
    crypto.scrypt(
      password,
      salt,
      KEY_LEN,
      {
        cost: SCRYPT_COST,
        blockSize: SCRYPT_BLOCK_SIZE,
        parallelization: SCRYPT_PARALLELIZATION,
      },
      (err, derivedKey) => {
        if (err) return reject(err);
        const saltHex = salt.toString('hex');
        const hashHex = derivedKey.toString('hex');
        resolve(`scrypt$cost=${SCRYPT_COST},r=${SCRYPT_BLOCK_SIZE},p=${SCRYPT_PARALLELIZATION}$${saltHex}$${hashHex}`);
      }
    );
  });
}

/**
 * Verifies password against stored scrypt hash using timingSafeEqual to avoid timing attacks.
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  if (!storedHash || typeof storedHash !== 'string') return false;
  const parts = storedHash.split('$');
  if (parts.length !== 4 || parts[0] !== 'scrypt') {
    return false;
  }

  const paramPairs = parts[1].split(',');
  const params: Record<string, number> = {};
  for (const pair of paramPairs) {
    const [k, v] = pair.split('=');
    if (k && v) {
      params[k] = parseInt(v, 10);
    }
  }

  const cost = params.cost || SCRYPT_COST;
  const blockSize = params.r || SCRYPT_BLOCK_SIZE;
  const parallelization = params.p || SCRYPT_PARALLELIZATION;

  const salt = Buffer.from(parts[2], 'hex');
  const expectedHash = Buffer.from(parts[3], 'hex');

  return new Promise((resolve) => {
    crypto.scrypt(
      password,
      salt,
      expectedHash.length,
      {
        cost,
        blockSize,
        parallelization,
      },
      (err, derivedKey) => {
        if (err) return resolve(false);
        if (derivedKey.length !== expectedHash.length) return resolve(false);
        try {
          resolve(crypto.timingSafeEqual(derivedKey, expectedHash));
        } catch {
          resolve(false);
        }
      }
    );
  });
}
