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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getIronSession<SessionData>(
    await cookies(),
    sessionOptions
  );
  if (!session.isLoggedIn || !session.telegramSession) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: channelId } = await params;
  const searchParams = req.nextUrl.searchParams;
  const limit = Math.min(Number(searchParams.get("limit") || "20"), 50);
  const offsetId = Number(searchParams.get("offsetId") || "0");

  const client = await createClient(session.telegramSession);

  try {
    // Get channel info
    const dialogs = await client.getDialogs({});
    const dialog = dialogs.find((d) => d.id?.toString() === channelId);
    const channelTitle = dialog?.title || "";
    const entity = dialog?.entity as unknown as Record<string, unknown> | undefined;
    const channelUsername = (entity?.username as string) || null;

    const messages: SerializedMessage[] = [];

    for await (const msg of client.iterMessages(channelId, {
      limit,
      offsetId: offsetId || undefined,
    })) {
      if (msg instanceof Api.Message) {
        messages.push(
          serializeMessage(msg, channelId, channelTitle, channelUsername)
        );
      }
    }

    return NextResponse.json({
      messages,
      nextOffsetId:
        messages.length > 0 ? messages[messages.length - 1].id : null,
    });
  } finally {
    await disconnectClient(client);
  }
}
