import { afterEach, describe, expect, it } from "vitest";
import { resolveMessengerAccount } from "./accounts.js";

describe("resolveMessengerAccount", () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("uses default account env credentials", () => {
    process.env.MESSENGER_PAGE_ID = "page-1";
    process.env.MESSENGER_PAGE_ACCESS_TOKEN = "token-1";
    process.env.MESSENGER_APP_SECRET = "secret-1";
    process.env.MESSENGER_VERIFY_TOKEN = "verify-1";

    const account = resolveMessengerAccount({ cfg: { channels: {} } as never });

    expect(account.accountId).toBe("default");
    expect(account.pageId).toBe("page-1");
    expect(account.pageAccessToken).toBe("token-1");
    expect(account.appSecret).toBe("secret-1");
    expect(account.verifyToken).toBe("verify-1");
    expect(account.tokenSource).toBe("env");
  });

  it("prefers named account config over defaults", () => {
    const account = resolveMessengerAccount({
      cfg: {
        channels: {
          messenger: {
            pageId: "base-page",
            pageAccessToken: "base-token",
            appSecret: "base-secret",
            verifyToken: "base-verify",
            accounts: {
              leaderbot: {
                pageId: "leader-page",
                pageAccessToken: "leader-token",
                appSecret: "leader-secret",
                verifyToken: "leader-verify",
              },
            },
          },
        },
      } as never,
      accountId: "leaderbot",
    });

    expect(account.pageId).toBe("leader-page");
    expect(account.pageAccessToken).toBe("leader-token");
    expect(account.appSecret).toBe("leader-secret");
    expect(account.verifyToken).toBe("leader-verify");
    expect(account.enabled).toBe(false);
  });
});
