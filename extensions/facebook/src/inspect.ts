import type { OpenClawConfig } from "openclaw/plugin-sdk/account-resolution";
import { resolveMessengerAccount } from "./accounts.js";

export function inspectMessengerAccount(params: { cfg: OpenClawConfig; accountId?: string | null }) {
  const account = resolveMessengerAccount(params);
  return {
    accountId: account.accountId,
    name: account.name,
    enabled: account.enabled,
    configured: Boolean(
      account.pageId.trim() &&
        account.pageAccessToken.trim() &&
        account.appSecret.trim() &&
        account.verifyToken.trim(),
    ),
    tokenStatus: account.tokenSource === "none" ? ("missing" as const) : ("available" as const),
    tokenSource: account.tokenSource,
  };
}
