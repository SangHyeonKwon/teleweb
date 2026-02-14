import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, SessionData } from "@/lib/session";
import { sendCode } from "@/lib/telegram/auth";

export async function POST(req: NextRequest) {
  const { phone } = await req.json();

  if (!phone) {
    return NextResponse.json(
      { error: "Phone number required" },
      { status: 400 }
    );
  }

  try {
    const result = await sendCode(phone);

    const session = await getIronSession<SessionData>(
      await cookies(),
      sessionOptions
    );
    session.phoneCodeHash = result.phoneCodeHash;
    session.telegramSession = result.sessionString;
    session.phone = phone;
    await session.save();

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to send code";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
