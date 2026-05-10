import { describe, expect, it, vi } from "vitest";
import { sendMessengerText } from "./send.js";

describe("sendMessengerText", () => {
  it("sends RESPONSE messages to the Page messages endpoint", async () => {
    const fetchMock = vi.fn(async () =>
      new Response(JSON.stringify({ message_id: "mid-1", recipient_id: "psid-1" }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );

    const result = await sendMessengerText("psid-1", "hello", {
      cfg: {
        channels: {
          messenger: {
            pageId: "page-1",
            pageAccessToken: "token-1",
            appSecret: "secret-1",
            verifyToken: "verify-1",
          },
        },
      } as never,
      fetch: fetchMock as never,
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://graph.facebook.com/v20.0/page-1/messages",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer token-1",
          "Content-Type": "application/json",
        }),
      }),
    );
    const body = JSON.parse(fetchMock.mock.calls[0]?.[1]?.body as string);
    expect(body).toEqual({
      recipient: { id: "psid-1" },
      messaging_type: "RESPONSE",
      message: { text: "hello" },
    });
    expect(result.messageId).toBe("mid-1");
    expect(result.receipt.platformMessageIds).toEqual(["mid-1"]);
  });

  it("maps 24-hour window errors", async () => {
    const fetchMock = vi.fn(async () =>
      new Response(
        JSON.stringify({
          error: {
            message: "outside allowed window",
            code: 10,
            error_subcode: 2534022,
          },
        }),
        { status: 400, headers: { "content-type": "application/json" } },
      ),
    );

    await expect(
      sendMessengerText("psid-1", "hello", {
        cfg: {
          channels: {
            messenger: {
              pageId: "page-1",
              pageAccessToken: "token-1",
              appSecret: "secret-1",
              verifyToken: "verify-1",
            },
          },
        } as never,
        fetch: fetchMock as never,
      }),
    ).rejects.toThrow("24-hour response window");
  });
});
