import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "super-secret-jwt-key-universitas-sarpras-2026"
);

export const COOKIE_NAME = "univ_sarpras_session";

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  role: "ADMIN" | "DOSEN";
  nidn?: string | null;
}

export async function signSessionToken(payload: SessionPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as SessionPayload;
  } catch (err) {
    return null;
  }
}

export async function getSessionUser(): Promise<SessionPayload | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return await verifySessionToken(token);
  } catch (error) {
    return null;
  }
}

export async function authenticateCredentials(email: string, passwordPlain: string) {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  });

  if (!user) {
    return { success: false, error: "Email tidak terdaftar" };
  }

  const isPasswordValid = await bcrypt.compare(passwordPlain, user.password);
  if (!isPasswordValid) {
    return { success: false, error: "Password yang Anda masukkan salah" };
  }

  const payload: SessionPayload = {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role as "ADMIN" | "DOSEN",
    nidn: user.nidn,
  };

  const token = await signSessionToken(payload);

  return {
    success: true,
    user: payload,
    token,
  };
}
