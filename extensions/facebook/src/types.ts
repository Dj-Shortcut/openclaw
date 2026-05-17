import type { BaseProbeResult } from "openclaw/plugin-sdk/channel-contract";
import type { MessageReceipt } from "openclaw/plugin-sdk/channel-message";
import { z } from "zod";

export type MessengerTokenSource = "config" | "env" | "file" | "none";

interface MessengerAccountBaseConfig {
  enabled?: boolean;
  pageId?: string;
  pageAccessToken?: string;
  tokenFile?: string;
  appSecret?: string;
  appSecretFile?: string;
  verifyToken?: string;
  verifyTokenFile?: string;
  name?: string;
  allowFrom?: string[];
  dmPolicy?: "open" | "allowlist" | "pairing" | "disabled";
  responsePrefix?: string;
  webhookPath?: string;
  defaultTo?: string;
  graphApiVersion?: string;
}

export interface MessengerConfig extends MessengerAccountBaseConfig {
  accounts?: Record<string, MessengerAccountConfig>;
  defaultAccount?: string;
}

export interface MessengerAccountConfig extends MessengerAccountBaseConfig {}

export interface ResolvedMessengerAccount {
  accountId: string;
  name?: string;
  enabled: boolean;
  pageId: string;
  pageAccessToken: string;
  appSecret: string;
  verifyToken: string;
  tokenSource: MessengerTokenSource;
  config: MessengerConfig & MessengerAccountConfig;
}

export interface MessengerSendResult {
  messageId: string;
  recipientId: string;
  receipt: MessageReceipt;
}

export type MessengerProbeResult = BaseProbeResult<string> & {
  page?: {
    id?: string;
    name?: string;
  };
};

export const MessengerWebhookMessagingSchema = z.object({
  sender: z.object({ id: z.string().optional() }).optional(),
  recipient: z.object({ id: z.string().optional() }).optional(),
  timestamp: z.number().optional(),
  message: z
    .object({
      mid: z.string().optional(),
      text: z.string().optional(),
      is_echo: z.boolean().optional(),
    })
    .optional(),
});

export const MessengerWebhookBodySchema = z.object({
  object: z.string().optional(),
  entry: z
    .array(
      z.object({
        id: z.string().optional(),
        time: z.number().optional(),
        messaging: z.array(MessengerWebhookMessagingSchema).optional(),
      }),
    )
    .optional(),
});

export type MessengerWebhookMessaging = z.infer<typeof MessengerWebhookMessagingSchema>;
export type MessengerWebhookBody = z.infer<typeof MessengerWebhookBodySchema>;
