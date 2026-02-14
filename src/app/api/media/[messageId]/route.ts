import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, SessionData } from "@/lib/session";
import { createClient, disconnectClient } from "@/lib/telegram/client";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ messageId: string }> }
) {
  const session = await getIronSession<SessionData>(
    await cookies(),
    sessionOptions
  );
  if (!session.isLoggedIn || !session.telegramSession) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { messageId } = await params;
  // messageId format: "channelId_msgId"
  const underscoreIdx = messageId.indexOf("_");
  if (underscoreIdx === -1) {
    return new NextResponse("Invalid media ID", { status: 400 });
  }

  const channelId = messageId.substring(0, underscoreIdx);
  const msgId = Number(messageId.substring(underscoreIdx + 1));

  const client = await createClient(session.telegramSession);

  try {
    const messages = await client.getMessages(channelId, {
      ids: [msgId],
    });
    const msg = messages[0];

    if (!msg || !msg.media) {
      return new NextResponse("Not found", { status: 404 });
    }

    const buffer = (await client.downloadMedia(msg.media, {})) as Buffer;

    let contentType = "application/octet-stream";
    if (msg.photo) contentType = "image/jpeg";
    else if (msg.video) contentType = "video/mp4";

    const uint8 = new Uint8Array(buffer);
    return new NextResponse(uint8, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } finally {
    await disconnectClient(client);
  }
}
