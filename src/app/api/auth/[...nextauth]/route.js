import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth"; // <--- Import konfigurasi dari file terpisah

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };