# Password Strength Analyzer API

[![MCP Server](https://img.shields.io/badge/MCP-server-blue)](https://password-strength.api.klymax402.com/mcp)
[![x402](https://img.shields.io/badge/payments-x402-6E56CF)](https://x402.org)
[![License: MIT](https://img.shields.io/badge/license-MIT-green)](LICENSE)

Password strength analyzer with entropy calculation and crack time estimation. Pay-per-call via [x402](https://x402.org) (USDC on Base L2) -- no API key, no signup, no rate-limit wall.

Part of the [klymax402](https://klymax402.com) marketplace -- 100 x402 micropayment APIs for AI agents, one wallet, USDC on Base.

## Quickstart -- MCP

Add to your MCP client config (Claude Desktop, Cursor, ElizaOS, etc.):

```json
{
  "mcpServers": {
    "password-strength": {
      "url": "https://password-strength.api.klymax402.com/mcp"
    }
  }
}
```

## Quickstart -- HTTP (x402)

```bash
curl -X POST "https://password-strength.api.klymax402.com/api/check" \
  -H "Content-Type: application/json" \
  -d '{"password":"..."}'
# -> 402 Payment Required, with an x402 payment challenge in the response body
```

Any x402-aware client ([`@x402/fetch`](https://www.npmjs.com/package/@x402/fetch), [`x402-agent-tools`](https://www.npmjs.com/package/x402-agent-tools), ATXP) handles the 402 -> sign -> retry cycle automatically.

## Tools

| Tool | Method | Path | Price | Description |
|---|---|---|---|---|
| `security_check_password` | POST | `/api/check` | $0.001 | Check password strength with entropy and crack time |

### `security_check_password`

Use this when you need to evaluate password strength or security. Returns a score 0-100, strength rating (weak/fair/strong/excellent), estimated crack time, entropy bits, and improvement suggestions. Checks against top 1000 common passwords. Do NOT use for hash generation — use crypto_generate_hash. Do NOT use for input validation — use data_validate_json.

**Parameters**

| Name | Type | Required | Description |
|---|---|---|---|
| `password` | string | yes | The password to analyze |

## Example agent prompts

- "Evaluate password strength or security"

## Payment

- Protocol: [x402](https://x402.org) -- HTTP-native pay-per-call, no signup, no API key
- Network: Base L2 (`eip155:8453`)
- Asset: USDC
- Facilitator: Coinbase CDP (primary), PayAI (fallback)

## Part of klymax402

100 x402 micropayment APIs for AI agents -- one wallet, USDC on Base, zero signup.

- Catalog: https://klymax402.com/llms.txt
- Full API reference: https://klymax402.com/llms-full.txt
- Live stats: https://klymax402.com/stats

## License

MIT
