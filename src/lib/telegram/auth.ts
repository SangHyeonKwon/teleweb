import { Api } from "telegram";
import { computeCheck } from "telegram/Password";
import { createClient, disconnectClient } from "./client";

export interface SendCodeResult {
  phoneCodeHash: string;
  sessionString: string;
}

export async function sendCode(phone: string): Promise<SendCodeResult> {
  const client = await createClient("");
  try {
    const result = await client.sendCode(
      {
        apiId: Number(process.env.TELEGRAM_API_ID!),
        apiHash: process.env.TELEGRAM_API_HASH!,
      },
      phone
    );
    const sessionString = client.session.save() as unknown as string;
    return {
      phoneCodeHash: result.phoneCodeHash,
      sessionString,
    };
  } finally {
    await disconnectClient(client);
  }
}

export interface VerifyCodeResult {
  sessionString: string;
  userId: number;
  firstName: string;
  needsPassword: boolean;
}

export async function verifyCode(
  phone: string,
  code: string,
  phoneCodeHash: string,
  sessionString: string
): Promise<VerifyCodeResult> {
  const client = await createClient(sessionString);
  try {
    const result = await client.invoke(
      new Api.auth.SignIn({
        phoneNumber: phone,
        phoneCodeHash,
        phoneCode: code,
      })
    );
    const user = (result as Api.auth.Authorization).user as Api.User;
    const finalSession = client.session.save() as unknown as string;
    return {
      sessionString: finalSession,
      userId: Number(user.id.valueOf()),
      firstName: user.firstName || "",
      needsPassword: false,
    };
  } catch (err: unknown) {
    // 2FA is enabled - save session and signal password needed
    if (
      err instanceof Error &&
      err.message.includes("SESSION_PASSWORD_NEEDED")
    ) {
      const intermediateSession = client.session.save() as unknown as string;
      return {
        sessionString: intermediateSession,
        userId: 0,
        firstName: "",
        needsPassword: true,
      };
    }
    throw err;
  } finally {
    await disconnectClient(client);
  }
}

export interface CheckPasswordResult {
  sessionString: string;
  userId: number;
  firstName: string;
}

export async function checkPassword(
  password: string,
  sessionString: string
): Promise<CheckPasswordResult> {
  const client = await createClient(sessionString);
  try {
    const passwordInfo = await client.invoke(new Api.account.GetPassword());
    const passwordCheck = await computeCheck(passwordInfo, password);
    const result = await client.invoke(
      new Api.auth.CheckPassword({ password: passwordCheck })
    );
    const user = (result as Api.auth.Authorization).user as Api.User;
    const finalSession = client.session.save() as unknown as string;
    return {
      sessionString: finalSession,
      userId: Number(user.id.valueOf()),
      firstName: user.firstName || "",
    };
  } finally {
    await disconnectClient(client);
  }
}
