import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, SessionData } from "@/lib/session";
import { checkPassword } from "@/lib/telegram/auth";

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  const session = await getIronSession<SessionData>(
    await cookies(),
    sessionOptions
  );

  if (!session.telegramSession) {
    return NextResponse.json({ error: "No pending auth" }, { status: 400 });
  }

  try {
    const result = await checkPassword(password, session.telegramSession);

    session.telegramSession = result.sessionString;
    session.userId = result.userId;
    session.firstName = result.firstName;
    session.isLoggedIn = true;
    await session.save();

    return NextResponse.json({
      success: true,
      user: { firstName: result.firstName },
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Password check failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
