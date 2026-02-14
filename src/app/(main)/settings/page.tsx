"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<{
    firstName: string;
    userId: number;
  } | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.isLoggedIn) {
          setUser({ firstName: data.firstName, userId: data.userId });
        }
      })
      .catch(() => {});
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch {
      setLoggingOut(false);
    }
  }

  return (
    <div>
      <div className="sticky top-0 z-10 border-b border-border bg-background/80 px-4 py-3 backdrop-blur-md">
        <h1 className="text-xl font-bold">Settings</h1>
      </div>

      <div className="p-4">
        {/* Account section */}
        <div className="rounded-2xl border border-border">
          <div className="px-4 pt-3 pb-2 text-sm font-bold text-secondary">
            Account
          </div>
          {user && (
            <div className="flex items-center gap-3 border-t border-border px-4 py-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-lg font-bold text-primary">
                {user.firstName.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="font-bold">{user.firstName}</div>
                <div className="text-sm text-secondary">
                  ID: {user.userId}
                </div>
              </div>
            </div>
          )}
          <div className="border-t border-border px-4 py-3">
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="w-full rounded-full border border-danger py-2.5 font-bold text-danger transition-colors hover:bg-danger/10 disabled:opacity-50"
            >
              {loggingOut ? "Logging out..." : "Log out"}
            </button>
          </div>
        </div>

        {/* About section */}
        <div className="mt-4 rounded-2xl border border-border">
          <div className="px-4 pt-3 pb-2 text-sm font-bold text-secondary">
            About
          </div>
          <div className="border-t border-border px-4 py-3 text-sm text-secondary">
            Memphis - Telegram channels in a Twitter-like feed
          </div>
        </div>
      </div>
    </div>
  );
}
