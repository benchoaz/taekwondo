import NextAuth, { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "dummy-client-id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "dummy-client-secret",
    }),
    EmailProvider({
      server: process.env.EMAIL_SERVER || "smtp://dummy",
      from: process.env.EMAIL_FROM || "no-reply@taekwondo.com",
      sendVerificationRequest: async ({ identifier, url, provider }) => {
        if (process.env.NODE_ENV === "development" || !process.env.EMAIL_SERVER) {
          console.log(`\n\n======================================================`);
          console.log(`📩 SIMULASI EMAIL TERKIRIM KE: ${identifier}`);
          console.log(`🔗 Klik tautan ini untuk login:`);
          console.log(url);
          console.log(`======================================================\n\n`);
        } else {
          // Implement Nodemailer logic here if real SMTP is provided
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/sso-portal",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
