import type { Hono } from "hono";


// ATXP: requirePayment only fires inside an ATXP context (set by atxpHono middleware).
// For raw x402 requests, the existing @x402/hono middleware handles the gate.
// If neither protocol is active (ATXP_CONNECTION unset), tryRequirePayment is a no-op.
async function tryRequirePayment(price: number): Promise<void> {
  if (!process.env.ATXP_CONNECTION) return;
  try {
    const { requirePayment } = await import("@atxp/server");
    const BigNumber = (await import("bignumber.js")).default;
    await requirePayment({ price: BigNumber(price) });
  } catch (e: any) {
    if (e?.code === -30402) throw e;
  }
}

const COMMON_PASSWORDS = [
  "123456","password","12345678","qwerty","123456789","12345","1234","111111","1234567",
  "dragon","123123","baseball","abc123","football","monkey","letmein","shadow","master",
  "666666","qwertyuiop","123321","mustang","1234567890","michael","654321","superman",
  "1qaz2wsx","7777777","fuckyou","121212","000000","qazwsx","123qwe","killer","trustno1",
  "jordan","jennifer","zxcvbnm","asdfgh","hunter","buster","soccer","harley","batman",
  "andrew","tigger","sunshine","iloveyou","2000","charlie","robert","thomas","hockey",
  "ranger","daniel","starwars","klaster","112233","george","computer","michelle","jessica",
  "pepper","1111","zxcvbn","555555","11111111","131313","freedom","777777","pass","maggie",
  "159753","aaaaaa","ginger","princess","joshua","cheese","amanda","summer","love","ashley",
  "nicole","chelsea","biteme","matthew","access","yankees","987654321","dallas","austin",
  "thunder","taylor","matrix","mobilemail","whatthe","admin","password1","passw0rd",
  "p@ssword","p@ssw0rd","welcome","welcome1","qwerty123","letmein1","abc1234","password123",
  "1q2w3e4r","iloveu","login","starwars1","admin123","hello","monkey1","master1",
  "changeme","123abc","test","test123","testing","guest","root","toor","administrator",
];

function calculateEntropy(password: string): number {
  let charsetSize = 0;
  if (/[a-z]/.test(password)) charsetSize += 26;
  if (/[A-Z]/.test(password)) charsetSize += 26;
  if (/[0-9]/.test(password)) charsetSize += 10;
  if (/[^a-zA-Z0-9]/.test(password)) charsetSize += 33;
  if (charsetSize === 0) return 0;
  return password.length * Math.log2(charsetSize);
}

function estimateCrackTime(entropy: number): string {
  // Assume 10 billion guesses per second (modern GPU cluster)
  const guessesPerSecond = 10_000_000_000;
  const combinations = Math.pow(2, entropy);
  const seconds = combinations / guessesPerSecond / 2; // Average case

  if (seconds < 1) return "instant";
  if (seconds < 60) return `${Math.round(seconds)} seconds`;
  if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
  if (seconds < 86400 * 365) return `${Math.round(seconds / 86400)} days`;
  if (seconds < 86400 * 365 * 1000) return `${Math.round(seconds / (86400 * 365))} years`;
  if (seconds < 86400 * 365 * 1_000_000) return `${Math.round(seconds / (86400 * 365 * 1000))}k years`;
  return "millions of years";
}

export function registerRoutes(app: Hono) {
  app.post("/api/check", async (c) => {
    await tryRequirePayment(0.001);
    const body = await c.req.json().catch(() => null);
    if (!body?.password) {
      return c.json({ error: "Missing required field: password" }, 400);
    }

    const password: string = body.password;
    const suggestions: string[] = [];
    let score = 0;

    // Length checks
    const len = password.length;
    if (len >= 8) score += 15;
    if (len >= 12) score += 10;
    if (len >= 16) score += 10;
    if (len < 8) suggestions.push("Use at least 8 characters");

    // Character diversity
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasDigit = /[0-9]/.test(password);
    const hasSpecial = /[^a-zA-Z0-9]/.test(password);

    if (hasLower) score += 10;
    if (hasUpper) score += 10;
    if (hasDigit) score += 10;
    if (hasSpecial) score += 15;

    if (!hasUpper) suggestions.push("Add uppercase letters");
    if (!hasLower) suggestions.push("Add lowercase letters");
    if (!hasDigit) suggestions.push("Add numbers");
    if (!hasSpecial) suggestions.push("Add special characters (!@#$%...)");

    // Pattern penalties
    if (/(.)\1{2,}/.test(password)) { score -= 10; suggestions.push("Avoid repeated characters"); }
    if (/^[a-z]+$/.test(password) || /^[A-Z]+$/.test(password)) { score -= 10; suggestions.push("Mix character types"); }
    if (/^[0-9]+$/.test(password)) { score -= 15; suggestions.push("Don't use only numbers"); }
    if (/^(012|123|234|345|456|567|678|789|abc|bcd|cde|def)/i.test(password)) { score -= 10; suggestions.push("Avoid sequential patterns"); }

    // Common password check
    const isCommon = COMMON_PASSWORDS.includes(password.toLowerCase());
    if (isCommon) { score = 0; suggestions.unshift("This is a commonly used password — change it immediately"); }

    // Entropy bonus
    const entropy = calculateEntropy(password);
    if (entropy > 60) score += 10;
    if (entropy > 80) score += 10;

    // Clamp
    score = Math.max(0, Math.min(100, score));

    // Strength label
    let strength: string;
    if (score < 25) strength = "weak";
    else if (score < 50) strength = "fair";
    else if (score < 75) strength = "strong";
    else strength = "excellent";

    const crackTime = isCommon ? "instant (in common password list)" : estimateCrackTime(entropy);

    return c.json({
      score,
      strength,
      entropy: Math.round(entropy * 100) / 100,
      crackTime,
      isCommon,
      length: len,
      checks: { hasLower, hasUpper, hasDigit, hasSpecial },
      suggestions,
    });
  });
}
