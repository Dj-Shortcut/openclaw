import { describeWebhookAccountSnapshot } from "openclaw/plugin-sdk/account-helpers";
import { type ChannelPlugin, type ResolvedMessengerAccount } from "./channel-api.js";
import { messengerConfigAdapter } from "./config-adapter.js";
import { MessengerChannelConfigSchema } from "./config-schema.js";

export function hasMessengerCredentials(account: ResolvedMessengerAccount): boolean {
  return Boolean(
    account.pageId.trim() &&
    account.pageAccessToken.trim() &&
    account.appSecret.trim() &&
    account.verifyToken.trim(),
  );
}

export const messengerChannelPluginCommon = {
  meta: {
    id: "messenger",
    label: "Messenger",
    selectionLabel: "Messenger (Facebook Page)",
    detailLabel: "Messenger Page",
    docsPath: "/channels/facebook",
    docsLabel: "messenger",
    blurb: "Facebook Page Messenger DMs via Meta webhooks.",
    systemImage: "message.fill",
    quickstartAllowFrom: true,
  },
  capabilities: {
    chatTypes: ["direct"],
    reactions: false,
    threads: false,
    media: false,
    nativeCommands: false,
    blockStreaming: true,
  },
  reload: { configPrefixes: ["channels.messenger"] },
  configSchema: MessengerChannelConfigSchema,
  config: {
    ...messengerConfigAdapter,
    hasConfiguredState: ({ env }: { env?: Record<string, string | undefined> }) =>
      Boolean(
        env?.MESSENGER_PAGE_ID?.trim() &&
        env.MESSENGER_PAGE_ACCESS_TOKEN?.trim() &&
        env.MESSENGER_APP_SECRET?.trim() &&
        env.MESSENGER_VERIFY_TOKEN?.trim(),
      ),
    isConfigured: (account: ResolvedMessengerAccount) => hasMessengerCredentials(account),
    unconfiguredReason: (account: ResolvedMessengerAccount) => {
      const missing = [];
      if (!account.pageId.trim()) {
        missing.push("pageId");
      }
      if (!account.pageAccessToken.trim()) {
        missing.push("pageAccessToken");
      }
      if (!account.appSecret.trim()) {
        missing.push("appSecret");
      }
      if (!account.verifyToken.trim()) {
        missing.push("verifyToken");
      }
      return missing.length ? `not configured: missing ${missing.join(", ")}` : "not configured";
    },
    describeAccount: (account: ResolvedMessengerAccount) =>
      describeWebhookAccountSnapshot({
        account,
        configured: hasMessengerCredentials(account),
        extra: {
          pageId: account.pageId || undefined,
          tokenSource: account.tokenSource === "none" ? undefined : account.tokenSource,
        },
      }),
  },
} satisfies Pick<
  ChannelPlugin<ResolvedMessengerAccount>,
  "meta" | "capabilities" | "reload" | "configSchema" | "config"
>;
