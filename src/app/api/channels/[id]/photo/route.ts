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
    return new NextResponse(null, { status: 401 });
  }

  const { id } = await params;
  const client = await createClient(session.telegramSession);

  try {
    const dialogs = await client.getDialogs({});
    const dialog = dialogs.find((d) => d.id?.toString() === id);

    if (!dialog || !dialog.entity) {
      return new NextResponse(null, { status: 404 });
    }

    const buffer = await client.downloadProfilePhoto(dialog.entity);

    if (!buffer || (buffer instanceof Buffer && buffer.length === 0)) {
      return new NextResponse(null, { status: 404 });
    }

    const uint8 = new Uint8Array(buffer as Buffer);
    return new NextResponse(uint8, {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } finally {
    await disconnectClient(client);
  }
}
