// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs"; // SVARĪGI: neļauj palaist Edge

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };