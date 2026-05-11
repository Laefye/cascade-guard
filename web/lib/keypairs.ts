import { loadKeyPair, loadPublicKeyFromBase64, showPublicKey } from "./keypair";

import crypto from "crypto";

export class KeyPair {
    botPublicKey: crypto.KeyObject;
    webPublicKey: crypto.KeyObject;
    webPrivateKey: crypto.KeyObject;

    constructor(botPublicKey: crypto.KeyObject, webPublicKey: crypto.KeyObject, webPrivateKey: crypto.KeyObject) {
        this.botPublicKey = botPublicKey;
        this.webPublicKey = webPublicKey;
        this.webPrivateKey = webPrivateKey;
    }

    static load(): KeyPair {
        const webKeyPair = loadKeyPair(process.env.KEYPAIR_DIR || ".");
        console.log("Loaded public key:", showPublicKey(webKeyPair.publicKey));
        const botPublicKey = loadPublicKeyFromBase64(process.env.BOT_PUBLIC_KEY || "");
        return new KeyPair(botPublicKey, webKeyPair.publicKey, webKeyPair.privateKey);
    }

    static keyPair: KeyPair | null = null;

    static getKeyPair(): KeyPair {
        if (!KeyPair.keyPair) {
            KeyPair.keyPair = KeyPair.load();
        }
        return KeyPair.keyPair;
    }
}

