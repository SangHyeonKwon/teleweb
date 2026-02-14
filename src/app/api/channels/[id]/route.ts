import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, SessionData } from "@/lib/session";
import { createClient, disconnectClient } from "@/lib/telegram/client";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getIronSession<SessionData>(
    await cookies(),
    sessionOptions
  );
  if (!session.isLoggedIn || !session.telegramSession) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const client = await createClient(session.telegramSession);

  try {
    const dialogs = await client.getDialogs({});
    const dialog = dialogs.find((d) => d.id?.toString() === id);

    if (!dialog) {
      return NextResponse.json({ error: "Channel not found" }, { status: 404 });
    }

    const entity = dialog.entity as unknown as Record<string, unknown>;

    return NextResponse.json({
      channel: {
        id: dialog.id!.toString(),
        title: dialog.title || "",
        username: (entity?.username as string) || null,
        photo: null,
        participantsCount: (entity?.participantsCount as number) || 0,
        about: "",
        isChannel: dialog.isChannel,
        isGroup: dialog.isGroup,
      },
    });
  } finally {
    await disconnectClient(client);
  }
}
