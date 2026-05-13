import { type ChannelPlugin, type ResolvedMessengerAccount } from "./channel-api.js";
import { messengerChannelPluginCommon } from "./channel-shared.js";
import { messengerSetupAdapter } from "./setup-core.js";
import { messengerSetupWizard } from "./setup-surface.js";

export const messengerSetupPlugin: ChannelPlugin<ResolvedMessengerAccount> = {
  id: "messenger",
  ...messengerChannelPluginCommon,
  setupWizard: messengerSetupWizard,
  setup: messengerSetupAdapter,
};
