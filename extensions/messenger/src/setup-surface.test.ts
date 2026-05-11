import { describe, expect, it } from "vitest";
import { messengerSetupWizard } from "./setup-surface.js";

describe("messengerSetupWizard", () => {
  it("removes wildcard allowFrom when switching from open to allowlist", () => {
    const cfg = {
      channels: {
        messenger: {
          dmPolicy: "open",
          allowFrom: ["*", "1234567890"],
        },
      },
    };

    const dmPolicy = messengerSetupWizard.dmPolicy;
    if (!dmPolicy) {
      throw new Error("Messenger setup wizard must expose a DM policy controller.");
    }
    const next = dmPolicy.setPolicy(cfg as never, "allowlist");
    const messengerConfig = next.channels?.messenger as
      | { dmPolicy?: string; allowFrom?: string[] }
      | undefined;

    expect(messengerConfig?.dmPolicy).toBe("allowlist");
    expect(messengerConfig?.allowFrom).toEqual(["1234567890"]);
  });
});
