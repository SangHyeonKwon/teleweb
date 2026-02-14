import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, SessionData } from "@/lib/session";
import { verifyCode } from "@/lib/telegram/auth";

export async function POST(req: NextRequest) {
  const { code } = await req.json();
  const session = await getIronSession<SessionData>(
    await cookies(),
    sessionOptions
  );

  if (!session.phone || !session.phoneCodeHash || !session.telegramSession) {
    return NextResponse.json({ error: "No pending auth" }, { status: 400 });
  }

  try {
    const result = await verifyCode(
      session.phone,
      code,
      session.phoneCodeHash,
      session.telegramSession
    );

    if (result.needsPassword) {
      // 2FA enabled - save intermediate session, prompt for password
      session.telegramSession = result.sessionString;
      session.phoneCodeHash = undefined;
      await session.save();

      return NextResponse.json({
        success: false,
        needsPassword: true,
      });
    }

    session.telegramSession = result.sessionString;
    session.userId = result.userId;
    session.firstName = result.firstName;
    session.isLoggedIn = true;
    session.phoneCodeHash = undefined;
    await session.save();

    return NextResponse.json({
      success: true,
      user: { firstName: result.firstName },
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Verification failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
