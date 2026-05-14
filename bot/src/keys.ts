import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';

export function loadPublicKey(format: 'file' | 'base64', pathOrBuffer: string): crypto.KeyObject {
    if (format === 'file') {
        const data = fs.readFileSync(pathOrBuffer);
        return crypto.createPublicKey(data);
    } else {
        const keyBuffer = Buffer.from(pathOrBuffer, 'base64');
        return crypto.createPublicKey({ key: keyBuffer, format: 'der', type: 'spki' });
    }
}

export function loadPrivateKey(path: string): crypto.KeyObject {
    const data = fs.readFileSync(path);
    return crypto.createPrivateKey(data);
}

export class TokenManager {
    sign(issuer: string, audience: string, privateKey: crypto.KeyObject): string {
        return jwt.sign({}, privateKey, { algorithm: "ES256", expiresIn: "5m", audience: audience, issuer: issuer });
    }

    verify(token: string, issuer: string, audience: string, publicKey: crypto.KeyObject): boolean {
        try {
            jwt.verify(token, publicKey, { algorithms: ["ES256"], audience: audience, issuer: issuer });
            return true;
        } catch (e) {
            console.error("Token verification failed:", e);
            return false;
        }
    }
}

export class KeyPair {
    constructor(public publicKey: crypto.KeyObject, public privateKey: crypto.KeyObject) {
    }

    static load(dir: string): KeyPair {
        const publicKeyPath = path.join(dir, 'public_key.pem');
        const privateKeyPath = path.join(dir, 'private_key.pem');
    
        if (!fs.existsSync(publicKeyPath) || !fs.existsSync(privateKeyPath)) {
            console.warn('Key pair not found, generating new one...');
            const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', { namedCurve: 'P-256' });
            fs.writeFileSync(publicKeyPath, publicKey.export({ type: 'spki', format: 'pem' }));
            fs.writeFileSync(privateKeyPath, privateKey.export({ type: 'pkcs8', format: 'pem' }));
            return new KeyPair(publicKey, privateKey);
        }
        
        const publicKey = loadPublicKey('file', publicKeyPath);
        const privateKey = loadPrivateKey(privateKeyPath);
        return new KeyPair(publicKey, privateKey);
    }

    get encodedPublicKey(): string {
        const publicKeyDer = this.publicKey.export({ format: 'der', type: 'spki' });
        return publicKeyDer.toString('base64');
    }
}
