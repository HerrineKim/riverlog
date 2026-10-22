import { createHmac, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/**
 * The blog has one admin, the owner. Credentials live only in environment variables:
 *   ADMIN_USERNAME, ADMIN_PASSWORD_HASH ("scrypt:<salt hex>:<hash hex>", see scripts/hash-password.mjs),
 *   ADMIN_SESSION_SECRET (32+ random characters).
 * The session is a signed, httpOnly cookie; nothing about it is stored server-side.
 */
const COOKIE = "riverlog_admin";
const MAX_AGE = 60 * 60 * 24 * 7; // a week

function sessionSecret(): string | undefined {
  const s = process.env.ADMIN_SESSION_SECRET;
  return s && s.length >= 32 ? s : undefined;
}

const sameString = (a: string, b: string) => {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

export function checkCredentials(username: string, password: string): boolean {
  const user = process.env.ADMIN_USERNAME;
  const [scheme, saltHex, hashHex] = (process.env.ADMIN_PASSWORD_HASH ?? "").split(":");
  if (!user || scheme !== "scrypt" || !saltHex || !hashHex || !sessionSecret()) return false;
  const expected = Buffer.from(hashHex, "hex");
  const actual = scryptSync(password, Buffer.from(saltHex, "hex"), expected.length);
  // Hash even when the username is wrong, so both failures take the same time
  return timingSafeEqual(actual, expected) && sameString(username, user);
}

const sign = (body: string, secret: string) => createHmac("sha256", secret).update(body).digest("base64url");

export async function startSession() {
  const secret = sessionSecret();
  if (!secret) throw new Error("ADMIN_SESSION_SECRET is not set");
  const body = Buffer.from(JSON.stringify({ exp: Date.now() + MAX_AGE * 1000 })).toString("base64url");
  (await cookies()).set(COOKIE, `${body}.${sign(body, secret)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function endSession() {
  (await cookies()).delete(COOKIE);
}

export async function isAdmin(): Promise<boolean> {
  const secret = sessionSecret();
  const value = (await cookies()).get(COOKIE)?.value;
  if (!secret || !value) return false;
  const [body, mac] = value.split(".");
  if (!body || !mac || !sameString(mac, sign(body, secret))) return false;
  try {
    return JSON.parse(Buffer.from(body, "base64url").toString()).exp > Date.now();
  } catch {
    return false;
  }
}

// Best effort: each server instance allows 5 failed logins per IP every 15 minutes
const failures = new Map<string, number[]>();
const WINDOW = 15 * 60 * 1000;

export function tooManyFailures(ip: string): boolean {
  const recent = (failures.get(ip) ?? []).filter((t) => Date.now() - t < WINDOW);
  failures.set(ip, recent);
  return recent.length >= 5;
}

export function recordFailure(ip: string) {
  failures.set(ip, [...(failures.get(ip) ?? []), Date.now()]);
}
