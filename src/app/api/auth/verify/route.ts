import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSessionCookie } from "@/lib/session";
import { isRole } from "@/lib/roles";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  const email = request.nextUrl.searchParams.get("email");

  if (!token || !email) {
    return NextResponse.redirect(new URL("/login?error=invalid_link", request.url));
  }

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const record = await prisma.verificationToken.findUnique({
    where: { tokenHash },
  });

  if (!record || record.email !== email || record.expires < new Date()) {
    return NextResponse.redirect(new URL("/login?error=expired_link", request.url));
  }

  // One-time use.
  await prisma.verificationToken.delete({ where: { id: record.id } });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.status !== "APPROVED") {
    return NextResponse.redirect(new URL("/login?error=not_approved", request.url));
  }

  await createSessionCookie({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: isRole(user.role) ? user.role : "STAKEHOLDER",
  });

  return NextResponse.redirect(new URL("/dashboard", request.url));
}
