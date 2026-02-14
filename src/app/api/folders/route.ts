import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, SessionData } from "@/lib/session";
import { createClient, disconnectClient } from "@/lib/telegram/client";
import { Api } from "telegram";

export async function GET() {
  const session = await getIronSession<SessionData>(
    await cookies(),
    sessionOptions
  );
  if (!session.isLoggedIn || !session.telegramSession) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const client = await createClient(session.telegramSession);

  try {
    const result = await client.invoke(new Api.messages.GetDialogFilters());

    const filters = (
      result as unknown as { filters: Api.TypeDialogFilter[] }
    ).filters ?? (Array.isArray(result) ? result : []);

    // Get all dialogs to map channel IDs to dialog IDs
    // (folder peers use raw channel IDs, dialogs use -100 prefixed IDs)
    const dialogs = await client.getDialogs({});
    const channelDialogs = dialogs.filter((d) => d.isChannel && !d.isGroup);

    // Build a map: raw channelId -> dialog ID (as string)
    const channelIdToDialogId = new Map<string, string>();
    for (const d of channelDialogs) {
      const entity = d.entity as unknown as Record<string, unknown>;
      const rawId = entity?.id;
      if (rawId !== undefined) {
        channelIdToDialogId.set(String(rawId), d.id!.toString());
      }
    }

    const folders = filters
      .filter(
        (f): f is Api.DialogFilter => f.className === "DialogFilter"
      )
      .map((f) => {
        // Get channel IDs from this folder, mapped to dialog IDs
        const channelIds: string[] = [];
        for (const p of f.includePeers) {
          if (p instanceof Api.InputPeerChannel) {
            const rawId = p.channelId.toString();
            const dialogId = channelIdToDialogId.get(rawId);
            if (dialogId) {
              channelIds.push(dialogId);
            }
          }
        }

        // title can be a string or a TextWithEntities object
        const title =
          typeof f.title === "string"
            ? f.title
            : (f.title as unknown as { text: string })?.text || "";

        return {
          id: f.id,
          title,
          channelIds,
          emoticon: f.emoticon || null,
        };
      })
      // Only return folders that have at least one channel
      .filter((f) => f.channelIds.length > 0);

    return NextResponse.json({ folders });
  } finally {
    await disconnectClient(client);
  }
}
