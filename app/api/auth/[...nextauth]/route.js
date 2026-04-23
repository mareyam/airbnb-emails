import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
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
  ],

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

// import NextAuth from "next-auth";
// import GoogleProvider from "next-auth/providers/google";

// const handler = NextAuth({
//   providers: [
//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//       authorization: {
//         params: {
//           scope: "openid email profile",
//         },
//       },
//     })
//   ],

//   callbacks: {
//     async jwt({ token, profile }) {
//       if (profile) {
//         token.name = profile.name;
//         token.picture = profile.picture;
//         token.email = profile.email;
//       }
//       return token;
//     },

//     async session({ session, token }) {
//       session.user.name = token.name;
//       session.user.email = token.email;
//       session.user.image = token.picture;
//       return session;
//     },
//   }
// });

// export { handler as GET, handler as POST };
