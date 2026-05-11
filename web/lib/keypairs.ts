import { loadKeyPair, loadPublicKeyFromBase64, showPublicKey } from "./keypair";

export const botPublicKey = loadPublicKeyFromBase64(process.env.BOT_PUBLIC_KEY || "");
export const webKeyPair = loadKeyPair(process.env.KEYPAIR_DIR || ".");

console.log("Loaded public key:", showPublicKey(webKeyPair.publicKey));
