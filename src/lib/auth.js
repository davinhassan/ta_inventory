// src/lib/auth.js

import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions = {
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 1 Hari
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.pengguna.findUnique({
          where: { email: credentials.email },
        });

        // PERBAIKAN: Cek user DAN password dulu, baru lempar error umum
        // Ini mencegah hacker menebak email mana yang valid
        const passwordMatch = user 
          ? await bcrypt.compare(credentials.password, user.password) 
          : false;

        if (!user || !passwordMatch) {
          throw new Error("Email atau password salah");
        }

        return {
          id: user.id,
          name: user.nama,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};