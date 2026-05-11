import crypto from "crypto";
import z from "zod";

export interface VerificationAsk {
    userId: string;
}

export const VerificationAskScheme = z.object({
    userId: z.string(),
});

export interface Signed {
    p: string; // payload
    s: string; // signature
    m: string; // method
    e: number; // expiration timestamp
}

export const SignedScheme = z.object({
    p: z.string(),
    s: z.string(),
    m: z.string(),
    e: z.number(),
});

export interface VerifyAsk {
    userId: string;
}

export const VerifyAskScheme = z.object({
    userId: z.string(),
});

export interface SignatureOptions {
    cryptoAlgorithm: string;
    nameAlgorithm: string;
    expiresIn: number;
}

export function sign<T>(data: T, privateKey: crypto.KeyObject, options: SignatureOptions): string {
    const payload = JSON.stringify(data);
    const signature = crypto.createSign(options.cryptoAlgorithm).update(payload).sign(privateKey, "base64");
    return Buffer.from(
        JSON.stringify({
            p: payload,
            s: signature,
            m: options.nameAlgorithm,
            e: Math.floor(Date.now() / 1000) + options.expiresIn,
        })
    ).toString("base64url")
}

export const defaultSignatureOptions: SignatureOptions = {
    nameAlgorithm: 'ES256',
    cryptoAlgorithm: 'SHA256',
    expiresIn: 300, // 5 minutes
};

export function verify<T>(signed: string, publicKey: crypto.KeyObject, schema: z.ZodSchema<T>, options: SignatureOptions): T | null {
    try {
        const decoded = Buffer.from(signed, "base64url").toString("utf-8");
        const parsed = SignedScheme.parse(JSON.parse(decoded));
        if (parsed.e < Math.floor(Date.now() / 1000) && parsed.m === options.nameAlgorithm) {
            return null; // expired or algorithm mismatch
        }
        const isValid = crypto.createVerify(options.cryptoAlgorithm).update(parsed.p).verify(publicKey, parsed.s, "base64");
        if (!isValid) {
            return null; // invalid signature
        }
        return schema.parse(JSON.parse(parsed.p));
    } catch (error) {
        console.error("Verification error:", error);
        return null; // invalid format or other errors
    }
}
