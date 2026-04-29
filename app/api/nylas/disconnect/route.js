import { NextResponse } from "next/server";

export async function GET(request) {
  console.log("🚪 /api/nylas/disconnect hit");

  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  console.log("🌐 baseUrl:", baseUrl);

  const response = NextResponse.redirect(new URL("/signup", baseUrl));

  console.log("🍪 deleting cookies...");
  response.cookies.delete("nylas_grant_id");
  response.cookies.delete("nylas_email");

  console.log("✅ cookies cleared, redirecting to /signup");

  return response;
}
// import { NextResponse } from "next/server";

// export async function GET(request) {
//   const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
//   const response = NextResponse.redirect(new URL("/signup", baseUrl));
//   response.cookies.delete("nylas_grant_id");
//   response.cookies.delete("nylas_email");
//   return response;
// }
