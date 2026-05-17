import {
  createAllowFromSection,
  createStandardChannelSetupStatus,
  mergeAllowFromEntries,
} from "openclaw/plugin-sdk/setup";
import {
  DEFAULT_ACCOUNT_ID,
  formatDocsLink,
  setSetupChannelEnabled,
  splitSetupEntries,
  type ChannelSetupDmPolicy,
  type ChannelSetupWizard,
} from "openclaw/plugin-sdk/setup";
import { resolveDefaultMessengerAccountId, resolveMessengerAccount } from "./accounts.js";
import {
  isMessengerConfigured,
  listMessengerAccountIds,
  parseMessengerAllowFromId,
  patchMessengerAccountConfig,
} from "./setup-core.js";

const channel = "messenger" as const;

const MESSENGER_SETUP_HELP_LINES = [
  "1) Create or pick a Meta app with Messenger enabled",
  "2) Connect a Facebook Page and copy the Page ID + Page access token",
  "3) Copy the app secret and choose a webhook verify token",
  "4) In the Meta Dashboard, set the callback URL to https://<gateway-host>/messenger/webhook",
  "5) Subscribe the Page webhook to the messages field",
  `Docs: ${formatDocsLink("/channels/facebook", "channels/facebook")}`,
];

const messengerDmPolicy: ChannelSetupDmPolicy = {
  label: "Messenger",
  channel,
  policyKey: "channels.messenger.dmPolicy",
  allowFromKey: "channels.messenger.allowFrom",
  resolveConfigKeys: (_cfg, accountId) =>
    accountId && accountId !== DEFAULT_ACCOUNT_ID
      ? {
          policyKey: `channels.messenger.accounts.${accountId}.dmPolicy`,
          allowFromKey: `channels.messenger.accounts.${accountId}.allowFrom`,
        }
      : {
          policyKey: "channels.messenger.dmPolicy",
          allowFromKey: "channels.messenger.allowFrom",
        },
  getCurrent: (cfg, accountId) =>
    resolveMessengerAccount({ cfg, accountId: accountId ?? resolveDefaultMessengerAccountId(cfg) })
      .config.dmPolicy ?? "pairing",
  setPolicy: (cfg, policy, accountId) =>
    patchMessengerAccountConfig({
      cfg,
      accountId: accountId ?? resolveDefaultMessengerAccountId(cfg),
      enabled: true,
      patch:
        policy === "open"
          ? {
              dmPolicy: "open",
              allowFrom: mergeAllowFromEntries(
                resolveMessengerAccount({
                  cfg,
                  accountId: accountId ?? resolveDefaultMessengerAccountId(cfg),
                }).config.allowFrom,
                ["*"],
              ),
            }
          : policy === "allowlist"
            ? {
                dmPolicy: "allowlist",
                allowFrom: (
                  resolveMessengerAccount({
                    cfg,
                    accountId: accountId ?? resolveDefaultMessengerAccountId(cfg),
                  }).config.allowFrom ?? []
                ).filter((entry) => String(entry).trim() !== "*"),
              }
            : { dmPolicy: policy },
      clearFields: policy === "pairing" || policy === "disabled" ? ["allowFrom"] : undefined,
    }),
};

export const messengerSetupWizard: ChannelSetupWizard = {
  channel,
  status: createStandardChannelSetupStatus({
    channelLabel: "Messenger",
    configuredLabel: "configured",
    unconfiguredLabel: "needs Page credentials",
    configuredHint: "configured",
    unconfiguredHint: "needs Page ID, token, app secret, verify token",
    configuredScore: 1,
    unconfiguredScore: 0,
    includeStatusLine: true,
    resolveConfigured: ({ cfg, accountId }) =>
      isMessengerConfigured(cfg, accountId ?? resolveDefaultMessengerAccountId(cfg)),
    resolveExtraStatusLines: ({ cfg }) => [
      `Accounts: ${listMessengerAccountIds(cfg).length || 0}`,
      "Webhook setup: configure manually in Meta Dashboard",
    ],
  }),
  introNote: {
    title: "Messenger Page DMs",
    lines: MESSENGER_SETUP_HELP_LINES,
    shouldShow: ({ cfg, accountId }) =>
      !isMessengerConfigured(cfg, accountId ?? resolveDefaultMessengerAccountId(cfg)),
  },
  credentials: [],
  allowFrom: createAllowFromSection({
    helpTitle: "Messenger allowlist",
    helpLines: [
      "Allowlist Messenger DMs by Page-scoped ID (PSID).",
      "Example: 1234567890123456",
      "Multiple entries: comma-separated.",
      `Docs: ${formatDocsLink("/channels/facebook", "channels/facebook")}`,
    ],
    message: "Messenger allowFrom (PSID)",
    placeholder: "1234567890123456",
    invalidWithoutCredentialNote: "Messenger allowFrom requires Page-scoped IDs.",
    parseInputs: splitSetupEntries,
    parseId: parseMessengerAllowFromId,
    apply: ({ cfg, accountId, allowFrom }) =>
      patchMessengerAccountConfig({
        cfg,
        accountId,
        enabled: true,
        patch: { dmPolicy: "allowlist", allowFrom },
      }),
  }),
  dmPolicy: messengerDmPolicy,
  completionNote: {
    title: "Messenger webhook",
    lines: [
      "Configure the webhook in the Meta Dashboard after saving credentials.",
      "Default webhook URL: https://<gateway-host>/messenger/webhook",
      "Subscribe to the messages field. OpenClaw does not call /subscribed_apps automatically.",
      `Docs: ${formatDocsLink("/channels/facebook", "channels/facebook")}`,
    ],
  },
  disable: (cfg) => setSetupChannelEnabled(cfg, channel, false),
};
