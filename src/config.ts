import type { ApiConfig } from "./shared";

export const API_CONFIG: ApiConfig = {
  name: "password-strength",
  slug: "password-strength",
  description: "Evaluate password strength with score 0-100, entropy bits, crack time estimate, and actionable improvement tips.",
  version: "1.0.0",
  routes: [
    {
      method: "POST",
      path: "/api/check",
      price: "$0.001",
      description: "Check password strength with entropy and crack time",
      toolName: "security_check_password",
      toolDescription: `Use this when you need to evaluate password strength or security before accepting user credentials. Returns a comprehensive strength analysis.

1. score -- strength score from 0 to 100
2. rating -- human-readable rating (weak, fair, strong, excellent)
3. crackTime -- estimated time to brute-force (e.g. "3 centuries", "2 hours")
4. entropy -- entropy in bits (higher = stronger)
5. isCommon -- boolean if password is in top 1000 common passwords list
6. suggestions -- array of actionable improvement tips

Example output: {"score":85,"rating":"strong","crackTime":"3 centuries","entropy":52.4,"isCommon":false,"suggestions":["Add a special character for maximum strength"]}

Use this BEFORE accepting passwords during user registration or password change flows. Essential FOR enforcing password policies in authentication systems.

Do NOT use for hash generation -- use crypto_generate_hash instead. Do NOT use for input validation -- use data_validate_json instead. Do NOT use for JWT inspection -- use security_decode_jwt instead.`,
      inputSchema: {
        type: "object",
        properties: {
          password: { type: "string", description: "The password to analyze" },
        },
        required: ["password"],
      },
    },
  ],
};
