import { SessionOptions } from "iron-session";

export interface SessionData {
  telegramSession?: string;
  userId?: number;
  firstName?: string;
  phone?: string;
  phoneCodeHash?: string;
  isLoggedIn: boolean;
}

export const defaultSession: SessionData = {
  isLoggedIn: false,
};

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_PASSWORD!,
  cookieName: "memphis-session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax" as const,
  },
};
