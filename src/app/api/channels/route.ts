import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, SessionData } from "@/lib/session";
import { createClient, disconnectClient } from "@/lib/telegram/client";
import { SerializedChannel } from "@/lib/telegram/types";

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
    const dialogs = await client.getDialogs({});
    const channels: SerializedChannel[] = [];

    for (const dialog of dialogs) {
      // Only channels, not groups or chats
      if (dialog.isChannel && !dialog.isGroup) {
        const entity = dialog.entity as unknown as Record<string, unknown>;
        channels.push({
          id: dialog.id!.toString(),
          title: dialog.title || "",
          username: (entity?.username as string) || null,
          photo: null,
          participantsCount:
            (entity?.participantsCount as number) || 0,
          about: "",
          isChannel: true,
          isGroup: false,
        });
      }
    }

    return NextResponse.json({ channels });
  } finally {
    await disconnectClient(client);
  }
}
