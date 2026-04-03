import { createECDH } from "node:crypto";

function toBase64Url(buffer) {
  return Buffer.from(buffer)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

const ecdh = createECDH("prime256v1");
ecdh.generateKeys();

const publicKey = toBase64Url(ecdh.getPublicKey());
const privateKey = toBase64Url(ecdh.getPrivateKey());

console.log("NEXT_PUBLIC_VAPID_PUBLIC_KEY=" + publicKey);
console.log("VAPID_PUBLIC_KEY=" + publicKey);
console.log("VAPID_PRIVATE_KEY=" + privateKey);
console.log("VAPID_SUBJECT=mailto:you@example.com");
