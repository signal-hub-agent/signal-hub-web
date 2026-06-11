// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      // 你可以在这里把 Google 的用户 ID 塞进 session 里，方便前端调用
      if (session.user) {
        (session.user as unknown).id = token.sub;
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };