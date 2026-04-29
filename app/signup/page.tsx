"use client";

import { useEffect, useState } from "react";

const EMAIL_DOMAIN_PROVIDER: Record<string, string> = {
  "gmail.com": "google",
  "googlemail.com": "google",
  "icloud.com": "apple",
  "me.com": "apple",
  "mac.com": "apple",
  "outlook.com": "microsoft",
  "hotmail.com": "microsoft",
  "hotmail.co.uk": "microsoft",
  "live.com": "microsoft",
  "live.co.uk": "microsoft",
  "msn.com": "microsoft",
  "yahoo.com": "yahoo",
  "yahoo.co.uk": "yahoo",
  "yahoo.com.au": "yahoo",
  "ymail.com": "yahoo",
  "rocketmail.com": "yahoo",
};

// ── Icons ──────────────────────────────────────────────────────────────────

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" style={{ flexShrink: 0 }}>
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="currentColor"
      style={{ flexShrink: 0 }}
    >
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" style={{ flexShrink: 0 }}>
      <path d="M11.4 24H0V12.6h11.4V24z" fill="#F1511B" />
      <path d="M24 24H12.6V12.6H24V24z" fill="#80CC28" />
      <path d="M11.4 11.4H0V0h11.4v11.4z" fill="#00ADEF" />
      <path d="M24 11.4H12.6V0H24v11.4z" fill="#FBBC09" />
    </svg>
  );
}

function YahooIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="#6001D2"
      style={{ flexShrink: 0 }}
    >
      <path d="M0 0h8.027L12 9.627 15.999 0H24l-9.237 20.285H8.697L11.13 15.05 0 0z" />
    </svg>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────

function providerBtn(
  bg: string,
  color: string,
  border: string
): React.CSSProperties {
  return {
    display: "flex",
    alignItems: "center",
    gap: 10,
    width: "100%",
    background: bg,
    color,
    border: `1px solid ${border}`,
    borderRadius: 8,
    padding: "12px 16px",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "system-ui",
  };
}

function goToNylasAuth(provider: string, hint?: string) {
  const params = new URLSearchParams({
    provider,
  });

  if (hint) params.set("hint", hint);

  window.location.href = `/api/nylas/auth?${params.toString()}`;
}

// ── Sign-in screen ─────────────────────────────────────────────────────────

function SignInScreen({ onConnect }: { onConnect: () => void }) {
  const [emailInput, setEmailInput] = useState("");
  const [emailError, setEmailError] = useState("");

  function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();

    const domain = emailInput.split("@")[1]?.toLowerCase().trim();
    const provider = domain ? EMAIL_DOMAIN_PROVIDER[domain] : undefined;

    if (!provider) {
      setEmailError("We support Gmail, iCloud, Outlook, and Yahoo addresses.");
      return;
    }

    goToNylasAuth(provider, emailInput);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0f0f0f",
        fontFamily: "system-ui",
        padding: "24px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 360 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h1
            style={{
              color: "#fff",
              fontSize: 26,
              fontWeight: 700,
              marginBottom: 8,
            }}
          >
            AirCierge
          </h1>
          <p style={{ color: "#666", fontSize: 14 }}>
            Connect your email to get started
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button
            // onClick={() => goToNylasAuth("google", onConnect)}
            onClick={() => goToNylasAuth("google")}
            style={providerBtn("#fff", "#0f0f0f", "#e5e5e5")}
          >
            <GoogleIcon />
            Continue with Google
          </button>
          <button
            // onClick={() => goToNylasAuth("apple", onConnect)}
            onClick={() => goToNylasAuth("apple")}
            style={providerBtn("#1c1c1e", "#fff", "#333")}
          >
            <AppleIcon />
            Continue with iCloud
          </button>
          <button
            // onClick={() => goToNylasAuth("microsoft", onConnect)}
            onClick={() => goToNylasAuth("microsoft")}
            style={providerBtn("#1a1a1a", "#fff", "#2a2a2a")}
          >
            <MicrosoftIcon />
            Continue with Outlook
          </button>
          <button
            // onClick={() => goToNylasAuth("yahoo", onConnect)}
            onClick={() => goToNylasAuth("yahoo")}
            style={providerBtn("#1a1a1a", "#fff", "#2a2a2a")}
          >
            <YahooIcon />
            Continue with Yahoo
          </button>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            margin: "20px 0",
          }}
        >
          <div style={{ flex: 1, height: 1, background: "#222" }} />
          <span style={{ color: "#444", fontSize: 12 }}>or use your email</span>
          <div style={{ flex: 1, height: 1, background: "#222" }} />
        </div>

        <form onSubmit={handleEmailSubmit}>
          <input
            type="email"
            placeholder="you@example.com"
            value={emailInput}
            onChange={(e) => {
              setEmailInput(e.target.value);
              setEmailError("");
            }}
            style={{
              width: "100%",
              background: "#1a1a1a",
              border: "1px solid #2a2a2a",
              borderRadius: 8,
              padding: "12px 14px",
              fontSize: 14,
              color: "#fff",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
          {emailError && (
            <p style={{ color: "#f87171", fontSize: 12, marginTop: 6 }}>
              {emailError}
            </p>
          )}
          <button
            type="submit"
            style={{
              ...providerBtn("#fff", "#0f0f0f", "#e5e5e5"),
              marginTop: 10,
              justifyContent: "center",
            }}
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Email list screen ──────────────────────────────────────────────────────

// ── Main page ──────────────────────────────────────────────────────────────

export default function SignupPage() {
  const [state, setState] = useState<"signin" | "loading">("signin");
  const [authError, setAuthError] = useState("");

  async function loadEmails() {
    setState("loading");
    try {
      const r = await fetch("/api/nylas/messages");
      if (r.ok) {
        window.location.href = "/messages";
        return;
      }
      setAuthError("Could not connect. Check your Nylas credentials.");
      setState("signin");
    } catch {
      setAuthError("Network error. Please try again.");
      setState("signin");
    }
  }

  // Handle redirect back from Nylas OAuth (has ?code= in URL after callback)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");
    if (error) {
      setAuthError(
        error === "auth_failed"
          ? "Authentication failed. Please try again."
          : "Something went wrong."
      );
    }
    // If OAuth callback redirected here with a grant cookie, auto-load
    if (params.has("connected")) {
      loadEmails();
    }
  }, []);

  if (state === "loading")
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0f0f0f",
        }}
      >
        <p style={{ color: "#666", fontFamily: "system-ui" }}>Connecting...</p>
      </div>
    );

  return (
    <div>
      {authError && (
        <div
          style={{
            background: "#7f1d1d",
            color: "#fca5a5",
            textAlign: "center",
            padding: "10px",
            fontSize: 13,
            fontFamily: "system-ui",
          }}
        >
          {authError}
        </div>
      )}
      <SignInScreen onConnect={loadEmails} />
    </div>
  );
}
