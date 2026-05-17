import { describe, expect, it } from "vitest";
import { MessengerConfigSchema } from "./config-schema.js";

describe("MessengerConfigSchema", () => {
  it("requires allowFrom entries to be strings", () => {
    const parsed = MessengerConfigSchema.safeParse({
      dmPolicy: "allowlist",
      allowFrom: [1234567890123456],
    });

    expect(parsed.success).toBe(false);
  });
});
