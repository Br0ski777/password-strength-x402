import type { ApiConfig } from "./shared";

export const API_CONFIG: ApiConfig = {
  name: "password-strength",
  slug: "password-strength",
  description: "Password strength analyzer with entropy calculation and crack time estimation.",
  version: "1.0.0",
  routes: [
    {
      method: "POST",
      path: "/api/check",
      price: "$0.003",
      description: "Check password strength with entropy and crack time",
      toolName: "security_check_password",
      toolDescription: "Use this when you need to evaluate password strength or security. Returns a score 0-100, strength rating (weak/fair/strong/excellent), estimated crack time, entropy bits, and improvement suggestions. Checks against top 1000 common passwords. Do NOT use for hash generation — use crypto_generate_hash. Do NOT use for input validation — use data_validate_json.",
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
