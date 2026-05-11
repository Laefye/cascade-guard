import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

// ECDSA-SHA256
export const jwtAlgorithm = 'ES256';

function generateKeyPair() {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', {
        namedCurve: 'P-256',
    });
    return { publicKey, privateKey };
}

function saveKeyPair(publicKey: crypto.KeyObject, privateKey: crypto.KeyObject, dir: string) {
    const publicKeyPem = publicKey.export({ type: 'spki', format: 'pem' });
    const privateKeyPem = privateKey.export({ type: 'pkcs8', format: 'pem' });
    const publicKeyPath = path.join(dir, 'public_key.pem');
    const privateKeyPath = path.join(dir, 'private_key.pem');
    fs.writeFileSync(publicKeyPath, publicKeyPem);
    fs.writeFileSync(privateKeyPath, privateKeyPem);
}

export function loadKeyPair(dir: string) {
    const publicKeyPath = path.join(dir, 'public_key.pem');
    const privateKeyPath = path.join(dir, 'private_key.pem');
    if (!fs.existsSync(publicKeyPath) || !fs.existsSync(privateKeyPath)) {
        console.warn('Key pair not found, generating new one...');
        const { publicKey, privateKey } = generateKeyPair();
        saveKeyPair(publicKey, privateKey, dir);
        return { publicKey, privateKey };
    }
    const publicKeyPem = fs.readFileSync(publicKeyPath, 'utf-8');
    const privateKeyPem = fs.readFileSync(privateKeyPath, 'utf-8');
    const publicKey = crypto.createPublicKey(publicKeyPem);
    const privateKey = crypto.createPrivateKey(privateKeyPem);
    return { publicKey, privateKey };
}

export function loadPublicKeyFromBase64(base64Key: string): crypto.KeyObject {
    const publicKeyDer = Buffer.from(base64Key, 'base64');
    return crypto.createPublicKey({ key: publicKeyDer, format: 'der', type: 'spki' });
}

export function showPublicKey(publicKey: crypto.KeyObject): string {
    const publicKeyPem = publicKey.export({ format: 'der', type: 'spki' });
    return publicKeyPem.toString('base64');
}
