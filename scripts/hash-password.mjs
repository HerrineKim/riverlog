// Prints an ADMIN_PASSWORD_HASH value for the admin login: node scripts/hash-password.mjs
// Reads the password from stdin so it never lands in shell history.
import { randomBytes, scryptSync } from "node:crypto";

let input = "";
process.stdin.setEncoding("utf8");
for await (const chunk of process.stdin) input += chunk;
const password = input.replace(/\r?\n$/, "");
if (!password) {
  console.error("usage: printf '%s' '<password>' | node scripts/hash-password.mjs");
  process.exit(1);
}
const salt = randomBytes(16);
console.log(`scrypt:${salt.toString("hex")}:${scryptSync(password, salt, 32).toString("hex")}`); // no "$": .env files expand it
