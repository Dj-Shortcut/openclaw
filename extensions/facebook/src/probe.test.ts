import { describe, expect, it, vi } from "vitest";
import { probeMessengerPage } from "./probe.js";

describe("probeMessengerPage", () => {
  it("rejects successful Graph API responses without a page id", async () => {
    const fetchMock = vi.fn(
      async () =>
        new Response(JSON.stringify({ name: "Leaderbot" }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
    );

    const result = await probeMessengerPage({
      pageId: "page-1",
      pageAccessToken: "token-1",
      fetch: fetchMock as never,
    });

    expect(result.ok).toBe(false);
    expect(result.error).toContain("invalid response");
  });

  it("returns page metadata when the Graph API payload is valid", async () => {
    const fetchMock = vi.fn(
      async () =>
        new Response(JSON.stringify({ id: "page-1", name: "Leaderbot" }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
    );

    const result = await probeMessengerPage({
      pageId: "page-1",
      pageAccessToken: "token-1",
      fetch: fetchMock as never,
    });

    expect(result).toEqual({ ok: true, page: { id: "page-1", name: "Leaderbot" } });
  });
});
