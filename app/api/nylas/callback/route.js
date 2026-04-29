import Nylas from "nylas";
import { NextResponse } from "next/server";

const nylas = new Nylas({
  apiKey: process.env.NYLAS_API_KEY,
  apiUri: process.env.NYLAS_API_URI || "https://api.us.nylas.com",
});

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  if (!code) {
    return NextResponse.redirect(new URL("/signup?error=no_code", baseUrl));
  }

  try {
    const tokenData = await nylas.auth.exchangeCodeForToken({
      clientId: process.env.NYLAS_CLIENT_ID,
      clientSecret: process.env.NYLAS_API_KEY,
      code,
      redirectUri: `${baseUrl}/api/nylas/callback`,
    });

    const response = NextResponse.redirect(new URL("/messages", baseUrl));
    response.cookies.set("nylas_grant_id", tokenData.grantId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
    response.cookies.set("nylas_email", tokenData.email || "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("Nylas callback error:", err);
    return NextResponse.redirect(new URL("/signup?error=auth_failed", baseUrl));
  }
}
