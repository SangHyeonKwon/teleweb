import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, SessionData } from "@/lib/session";
import { createClient, disconnectClient } from "@/lib/telegram/client";
import { Api } from "telegram";
import { SerializedMessage } from "@/lib/telegram/types";

function serializeMessage(
  msg: Api.Message,
  channelId: string,
  channelTitle: string,
  channelUsername: string | null
): SerializedMessage {
  let mediaType: "photo" | "video" | "document" | "none" = "none";
  if (msg.photo) mediaType = "photo";
  else if (msg.video) mediaType = "video";
  else if (msg.document) mediaType = "document";

  return {
    id: msg.id,
    channelId,
    channelTitle,
    channelUsername,
    channelPhoto: null,
    text: msg.message || "",
    date: msg.date,
    views: msg.views ?? null,
    forwards: msg.forwards ?? null,
    replies: msg.replies?.replies ?? null,
    hasMedia: mediaType !== "none",
    mediaType,
    mediaId: mediaType !== "none" ? `${channelId}_${msg.id}` : null,
    entities: (msg.entities || []).map((e) => ({
      type: e.className,
      offset: e.offset,
      length: e.length,
      url: (e as unknown as { url?: string }).url || undefined,
    })),
  };
}

export async function GET(req: NextRequest) {
  const session = await getIronSession<SessionData>(
    await cookies(),
    sessionOptions
  );
  if (!session.isLoggedIn || !session.telegramSession) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = req.nextUrl.searchParams;
  const limit = Math.min(Number(searchParams.get("limit") || "20"), 50);
  const beforeDate = Number(searchParams.get("before") || "0");
  // Optional: comma-separated channel IDs to filter by folder
  const channelIdsParam = searchParams.get("channelIds");
  const filterIds = channelIdsParam
    ? new Set(channelIdsParam.split(","))
    : null;

  const client = await createClient(session.telegramSession);

  try {
    const dialogs = await client.getDialogs({});
    // Only channels (not groups, not chats)
    let channelDialogs = dialogs.filter((d) => d.isChannel && !d.isGroup);

    // If filtering by folder, only include channels in the folder
    if (filterIds) {
      channelDialogs = channelDialogs.filter((d) =>
        filterIds.has(d.id!.toString())
      );
    }

    const topChannels = channelDialogs.slice(0, 15);
    const allMessages: SerializedMessage[] = [];

    const batchSize = 5;
    for (let i = 0; i < topChannels.length; i += batchSize) {
      const batch = topChannels.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(async (dialog) => {
          const channelId = dialog.id!.toString();
          const channelTitle = dialog.title || "";
          const entity = dialog.entity as unknown as Record<string, unknown>;
          const channelUsername = (entity?.username as string) || null;
          const messages: SerializedMessage[] = [];

          try {
            for await (const msg of client.iterMessages(channelId, {
              limit: 5,
              offsetDate: beforeDate || undefined,
            })) {
              if (msg instanceof Api.Message) {
                messages.push(
                  serializeMessage(
                    msg,
                    channelId,
                    channelTitle,
                    channelUsername
                  )
                );
              }
            }
          } catch {
            // Skip channels that fail
          }

          return messages;
        })
      );

      for (const msgs of batchResults) {
        allMessages.push(...msgs);
      }
    }

    allMessages.sort((a, b) => b.date - a.date);
    const result = allMessages.slice(0, limit);

    return NextResponse.json({
      messages: result,
      nextBefore:
        result.length > 0 ? result[result.length - 1].date : null,
    });
  } finally {
    await disconnectClient(client);
  }
}
