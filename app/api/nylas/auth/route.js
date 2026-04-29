import Nylas from "nylas";

const nylas = new Nylas({
  apiKey: process.env.NYLAS_API_KEY,
  apiUri: process.env.NYLAS_API_URI || "https://api.us.nylas.com",
});

// Nylas v3 only accepts: "google" | "microsoft" | "imap" | "ews"
// iCloud and Yahoo both authenticate via IMAP (email + app-specific password)
const NYLAS_PROVIDER_MAP = {
  google: "google",
  microsoft: "microsoft",
  apple: "imap",
  icloud: "imap",
  yahoo: "imap",
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const rawProvider = searchParams.get("provider");
  const hint = searchParams.get("hint");

  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const nylasProvider = NYLAS_PROVIDER_MAP[rawProvider] ?? rawProvider ?? undefined;

  const authConfig = {
    clientId: process.env.NYLAS_CLIENT_ID,
    redirectUri: `${baseUrl}/api/nylas/callback`,
    accessType: "offline",
  };

  if (nylasProvider) authConfig.provider = nylasProvider;
  if (hint) authConfig.loginHint = hint;

  const authUrl = nylas.auth.urlForOAuth2(authConfig);

  return Response.redirect(authUrl);
}
