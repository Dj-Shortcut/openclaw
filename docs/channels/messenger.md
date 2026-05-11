---
summary: "Facebook Messenger Page DM setup, webhook configuration, and access controls"
read_when:
  - You want to connect OpenClaw to Facebook Messenger
  - You need Messenger webhook + Page credential setup
  - You are configuring Leaderbot as a Messenger Page assistant
title: "Messenger"
---

Messenger connects OpenClaw to Facebook Page direct messages through Meta's
Messenger Platform. The plugin runs as a Gateway webhook receiver and sends text
replies through the Graph API Send API.

Status: bundled plugin. V1 supports Page direct messages with text inbound and
text outbound replies. Attachments, message templates, comments/private replies,
Instagram Messaging, and handover protocol are not included in this channel yet.

## Setup

1. Create or open a Meta app with Messenger enabled.
2. Connect the Facebook Page that should host the assistant. For example, use a
   Page named `Leaderbot`.
3. Copy the Page ID, Page access token, app secret, and choose a webhook verify
   token.
4. Configure OpenClaw:

```json5
{
  channels: {
    messenger: {
      enabled: true,
      name: "Leaderbot",
      pageId: "<FACEBOOK_PAGE_ID>",
      pageAccessToken: "<PAGE_ACCESS_TOKEN>",
      appSecret: "<META_APP_SECRET>",
      verifyToken: "<WEBHOOK_VERIFY_TOKEN>",
      dmPolicy: "pairing",
    },
  },
}
```

Env vars for the default account:

- `MESSENGER_PAGE_ID`
- `MESSENGER_PAGE_ACCESS_TOKEN`
- `MESSENGER_APP_SECRET`
- `MESSENGER_VERIFY_TOKEN`

Token and secret files:

```json5
{
  channels: {
    messenger: {
      pageId: "<FACEBOOK_PAGE_ID>",
      tokenFile: "/path/to/page-token.txt",
      appSecretFile: "/path/to/app-secret.txt",
      verifyTokenFile: "/path/to/verify-token.txt",
    },
  },
}
```

## Configure the webhook in Meta

OpenClaw owns the local webhook route. You still configure the Meta Dashboard
manually.

Default callback URL:

```text
https://<gateway-host>/messenger/webhook
```

If you set `channels.messenger.webhookPath`, update the URL to match.

In the Meta Dashboard:

- Set the callback URL to your public HTTPS Gateway URL.
- Set the verify token to the same value as `channels.messenger.verifyToken`.
- Subscribe the Page webhook to the `messages` field.

OpenClaw validates the `GET` verification challenge and verifies
`X-Hub-Signature-256` on `POST` requests before parsing JSON.

## Access control

Direct messages default to pairing. Unknown Messenger users receive a pairing
code and their messages are ignored until approved.

```bash
openclaw pairing list messenger
openclaw pairing approve messenger <CODE>
```

Allowlists use Messenger Page-scoped IDs (PSIDs):

```json5
{
  channels: {
    messenger: {
      dmPolicy: "allowlist",
      allowFrom: ["1234567890123456"],
    },
  },
}
```

`dmPolicy: "open"` requires `allowFrom: ["*"]`. Use it only for intentionally
public Pages with restricted tools.

## Message behavior

- Inbound only accepts Page webhook text messages.
- Echoes and unsupported event types are acknowledged and skipped.
- Outbound replies use `messaging_type: "RESPONSE"`, so Meta's response-window
  rules apply.
- Text is chunked conservatively before delivery.

## Multiple Pages

Use named accounts for multiple Facebook Pages:

```json5
{
  channels: {
    messenger: {
      accounts: {
        leaderbot: {
          name: "Leaderbot",
          pageId: "<FACEBOOK_PAGE_ID>",
          pageAccessToken: "<PAGE_ACCESS_TOKEN>",
          appSecret: "<META_APP_SECRET>",
          verifyToken: "<WEBHOOK_VERIFY_TOKEN>",
          webhookPath: "/messenger/leaderbot",
        },
      },
    },
  },
}
```

## Troubleshooting

- Webhook verification fails: confirm the Meta Dashboard verify token exactly
  matches `channels.messenger.verifyToken`.
- POST requests fail with `Invalid signature`: confirm the app secret matches
  the Meta app sending the webhook.
- Replies fail with a token or permission error: regenerate the Page access
  token and confirm the app/Page has Messenger permissions and tasks.
- Replies fail outside the response window: the v1 plugin only sends response
  messages and does not send templates or follow-up notifications.

## Related

- [Channels overview](/channels)
- [Pairing](/channels/pairing)
- [Channel troubleshooting](/channels/troubleshooting)
- [Gateway security](/gateway/security)
