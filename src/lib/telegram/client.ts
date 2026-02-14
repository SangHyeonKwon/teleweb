import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";

const apiId = Number(process.env.TELEGRAM_API_ID!);
const apiHash = process.env.TELEGRAM_API_HASH!;

export async function createClient(
  sessionString: string = ""
): Promise<TelegramClient> {
  const session = new StringSession(sessionString);
  const client = new TelegramClient(session, apiId, apiHash, {
    connectionRetries: 5,
  });
  await client.connect();
  return client;
}

export async function disconnectClient(
  client: TelegramClient
): Promise<void> {
  try {
    await client.disconnect();
  } catch {
    // Ignore disconnect errors
  }
}
