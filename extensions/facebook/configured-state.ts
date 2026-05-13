export function hasMessengerConfiguredState(env: Record<string, string | undefined>): boolean {
  return Boolean(
    env.MESSENGER_PAGE_ID?.trim() &&
      env.MESSENGER_PAGE_ACCESS_TOKEN?.trim() &&
      env.MESSENGER_APP_SECRET?.trim() &&
      env.MESSENGER_VERIFY_TOKEN?.trim(),
  );
}
