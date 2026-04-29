import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import AppleProvider from "next-auth/providers/apple";
import AzureADProvider from "next-auth/providers/azure-ad";

const providers = [
  GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    authorization: {
      params: {
        scope:
          "openid email profile https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/spreadsheets.readonly",
      },
    },
  }),
];

if (process.env.APPLE_ID && process.env.APPLE_SECRET) {
  providers.push(
    AppleProvider({
      clientId: process.env.APPLE_ID,
      clientSecret: process.env.APPLE_SECRET,
    })
  );
}

if (process.env.AZURE_AD_CLIENT_ID && process.env.AZURE_AD_CLIENT_SECRET) {
  providers.push(
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
      tenantId: process.env.AZURE_AD_TENANT_ID || "common",
    })
  );
}

if (process.env.YAHOO_CLIENT_ID && process.env.YAHOO_CLIENT_SECRET) {
  providers.push({
    id: "yahoo",
    name: "Yahoo",
    type: "oauth",
    authorization: {
      url: "https://api.login.yahoo.com/oauth2/request_auth",
      params: { scope: "openid email profile" },
    },
    token: "https://api.login.yahoo.com/oauth2/get_token",
    userinfo: "https://api.login.yahoo.com/openid/v1/userinfo",
    clientId: process.env.YAHOO_CLIENT_ID,
    clientSecret: process.env.YAHOO_CLIENT_SECRET,
    profile(profile) {
      return {
        id: profile.sub,
        name: profile.name,
        email: profile.email,
        image: profile.picture,
      };
    },
  });
}

const handler = NextAuth({
  providers,

  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.idToken = account.id_token;
        token.provider = account.provider;
      }
      return token;
    },

    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.idToken = token.idToken;
      session.provider = token.provider;
      return session;
    },
  },
});

export { handler as GET, handler as POST };
