"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "code" | "password">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to send code");
        return;
      }

      setStep("code");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Verification failed");
        return;
      }

      if (data.needsPassword) {
        setStep("password");
        return;
      }

      router.push("/feed");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCheckPassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/check-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Wrong password");
        return;
      }

      router.push("/feed");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground">Memphis</h1>
          <p className="mt-2 text-secondary">
            Your Telegram channels, Twitter-style
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-background p-8">
          {step === "phone" && (
            <form onSubmit={handleSendCode}>
              <h2 className="mb-6 text-xl font-bold">Sign in to Memphis</h2>
              <p className="mb-4 text-sm text-secondary">
                Enter your phone number to receive a verification code on
                Telegram.
              </p>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 234 567 8900"
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground placeholder:text-secondary focus:border-primary focus:outline-none"
                autoFocus
                required
              />
              {error && (
                <p className="mt-2 text-sm text-danger">{error}</p>
              )}
              <button
                type="submit"
                disabled={loading || !phone}
                className="mt-4 w-full rounded-full bg-primary py-3 font-bold text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
              >
                {loading ? "Sending..." : "Next"}
              </button>
            </form>
          )}

          {step === "code" && (
            <form onSubmit={handleVerifyCode}>
              <h2 className="mb-6 text-xl font-bold">Enter your code</h2>
              <p className="mb-4 text-sm text-secondary">
                We sent a code to{" "}
                <span className="text-foreground">{phone}</span>
              </p>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="12345"
                maxLength={6}
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-center text-2xl tracking-widest text-foreground placeholder:text-secondary focus:border-primary focus:outline-none"
                autoFocus
                required
              />
              {error && (
                <p className="mt-2 text-sm text-danger">{error}</p>
              )}
              <button
                type="submit"
                disabled={loading || !code}
                className="mt-4 w-full rounded-full bg-primary py-3 font-bold text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
              >
                {loading ? "Verifying..." : "Verify"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep("phone");
                  setCode("");
                  setError("");
                }}
                className="mt-3 w-full rounded-full border border-border py-3 font-bold text-foreground transition-colors hover:bg-hover"
              >
                Back
              </button>
            </form>
          )}

          {step === "password" && (
            <form onSubmit={handleCheckPassword}>
              <h2 className="mb-6 text-xl font-bold">Two-factor authentication</h2>
              <p className="mb-4 text-sm text-secondary">
                Your account has 2FA enabled. Enter your Telegram password.
              </p>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground placeholder:text-secondary focus:border-primary focus:outline-none"
                autoFocus
                required
              />
              {error && (
                <p className="mt-2 text-sm text-danger">{error}</p>
              )}
              <button
                type="submit"
                disabled={loading || !password}
                className="mt-4 w-full rounded-full bg-primary py-3 font-bold text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
              >
                {loading ? "Checking..." : "Submit"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep("phone");
                  setPassword("");
                  setCode("");
                  setError("");
                }}
                className="mt-3 w-full rounded-full border border-border py-3 font-bold text-foreground transition-colors hover:bg-hover"
              >
                Start over
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
