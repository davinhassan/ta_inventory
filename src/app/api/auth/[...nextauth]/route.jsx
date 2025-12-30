import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

const handler = NextAuth({
  // 1. Konfigurasi Session (Pengganti 'jose' & manual cookie)
  session: {
    strategy: "jwt", // NextAuth akan otomatis bikin JWT & Cookie
    maxAge: 24 * 60 * 60, // 24 Jam (Sesuai kodemu sebelumnya)
  },

  // 2. Provider Login
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      // --- LOGIKA UTAMA (PINDAHAN DARI FILE LAMA KAMU) ---
      async authorize(credentials) {
        // A. Cek Input
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // B. Cari User di Database
        const user = await prisma.pengguna.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error("Email tidak ditemukan");
        }

        // C. Cek Password (Bcrypt)
        const passwordMatch = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!passwordMatch) {
          throw new Error("Password salah");
        }

        // D. Login Sukses -> Kembalikan data user ke NextAuth
        // (NextAuth otomatis bungkus ini jadi token)
        return {
          id: user.id,
          name: user.nama,
          email: user.email,
          role: user.role,
        };
      },
      // ---------------------------------------------------
    }),
  ],

  // 3. Callback (Agar Role & ID terbaca di Frontend/AuthGuard)
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
        session.user.role = token.role;
        session.user.id = token.id;
      }
      return session;
    },
  },

  // 4. Halaman Login Custom
  pages: {
    signIn: "/login", // Arahkan ke page login buatanmu
  },

  // 5. Secret Key (Ambil dari .env)
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
