import 'server-only';
import stationCodes from '../station_codes.json';

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
 * Validates credentials against the authoritative station_codes.json.
 * Uses constant-time string comparison for the derived password.
 * Do NOT log the password or expected password.
 */
export async function validateStationLogin(username: string, passwordString: string) {
  if (!username || !passwordString) return null;
  
  const normalizedInputName = normalizeTurkish(username);

  // Find the station by name
  let matchedCode: string | null = null;
  let matchedName: string | null = null;

  for (const [code, name] of Object.entries(stationCodes)) {
    if (normalizeTurkish(name) === normalizedInputName) {
      matchedCode = code;
      matchedName = name;
      break;
    }
  }

  if (!matchedCode || !matchedName) {
    // Return null, but don't expose if station exists or not
    return null;
  }

  // Derive expected password deterministicly: String(code) + String(code)
  const expectedPassword = String(matchedCode) + String(matchedCode);

  // Timing safe comparison (basic equivalent since we're in Edge/Node runtime and lengths differ usually)
  // To avoid timing attacks somewhat, check lengths first
  if (passwordString.length !== expectedPassword.length) {
    return null;
  }

  let isMatch = true;
  for (let i = 0; i < expectedPassword.length; i++) {
    if (passwordString[i] !== expectedPassword[i]) {
      isMatch = false;
    }
  }

  if (isMatch) {
    return {
      stationCode: matchedCode,
      stationName: matchedName,
    };
  }

  return null;
}
