// src/app/api/auth/[...nextauth]/route.ts
import NextAuth, { Session } from "next-auth";
import { JWT } from "next-auth/jwt";
import GoogleProvider from "next-auth/providers/google";

// 🌟 1. 自定义扩展接口，明确声明 user 节点下可以包含 id
interface CustomSession extends Session {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    id?: string; // 允许注入 id
  };
}

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {
    // 🌟 2. 显式声明回调函数的参数类型，将 session 指定为我们的 CustomSession
    async session({ session, token }: { session: CustomSession; token: JWT }) {
      if (session.user && token.sub) {
        session.user.id = token.sub; // 🌟 此时可以直接赋值，再也不需要 as any 了
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };