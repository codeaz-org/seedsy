import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

// At-rest encryption for CMS credentials (AES-256-GCM).
// Key comes from CREDENTIALS_ENCRYPTION_KEY (any string; hashed to 32 bytes).
// Unset key = plaintext passthrough — acceptable for single-operator
// self-hosts, required to be SET on the cloud before taking customer creds.

function key(): Buffer | null {
  const k = process.env.CREDENTIALS_ENCRYPTION_KEY;
  return k ? createHash("sha256").update(k).digest() : null;
}

export function encryptJSON(obj: unknown): unknown {
  const k = key();
  if (!k) return obj;
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", k, iv);
  const ct = Buffer.concat([cipher.update(JSON.stringify(obj), "utf8"), cipher.final()]);
  return { __enc: Buffer.concat([iv, cipher.getAuthTag(), ct]).toString("base64") };
}

export function decryptJSON<T>(stored: unknown): T {
  const enc = (stored as { __enc?: string })?.__enc;
  if (!enc) return stored as T; // legacy / plaintext row
  const k = key();
  if (!k) throw new Error("Integration is encrypted but CREDENTIALS_ENCRYPTION_KEY is not set.");
  const buf = Buffer.from(enc, "base64");
  const decipher = createDecipheriv("aes-256-gcm", k, buf.subarray(0, 12));
  decipher.setAuthTag(buf.subarray(12, 28));
  const pt = Buffer.concat([decipher.update(buf.subarray(28)), decipher.final()]);
  return JSON.parse(pt.toString("utf8")) as T;
}

// Self-check: node -e 'process.env.CREDENTIALS_ENCRYPTION_KEY="t";const c=require("./lib/crypto");const o={a:1};const e=c.encryptJSON(o);console.assert(JSON.stringify(c.decryptJSON(e))===JSON.stringify(o));console.log("ok")'
