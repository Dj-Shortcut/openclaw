import { describe, expect, it } from "vitest";
import { resolveMessengerEventTarget } from "./monitor.js";

function messengerTarget(accountId: string, pageId: string) {
  return {
    account: {
      accountId,
      enabled: true,
      pageId,
      pageAccessToken: "token",
      appSecret: "secret",
      verifyToken: "verify",
      tokenSource: "config",
      config: {},
    },
    path: "/messenger/webhook",
    runtime: {},
  } as never;
}

describe("resolveMessengerEventTarget", () => {
  it("uses recipient page id to choose between same-path accounts", () => {
    const first = messengerTarget("first", "page-1");
    const second = messengerTarget("second", "page-2");

    expect(
      resolveMessengerEventTarget([first, second], {
        recipient: { id: "page-2" },
      }),
    ).toBe(second);
    expect(
      resolveMessengerEventTarget([first, second], {
        recipient: { id: "page-3" },
      }),
    ).toBeNull();
  });
});
