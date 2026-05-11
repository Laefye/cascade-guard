import jsonwebtoken from "jsonwebtoken";
import crypto from "crypto";
import { jwtAlgorithm } from "./keypair.js";

export interface JwtPayload {
    userId: string;
}

export function signJwt(payload: JwtPayload, privateKey: crypto.KeyObject): string {
    const jwtOptions: jsonwebtoken.SignOptions = {
        algorithm: jwtAlgorithm,
        expiresIn: "1m",
        issuer: "cascade-guard-bot",
    };
    return jsonwebtoken.sign(payload, privateKey.export({ format: 'pem', type: 'pkcs8' }), jwtOptions);
}

export function verifyJwt(token: string, publicKey: crypto.KeyObject): JwtPayload | null {
    try {
        return jsonwebtoken.verify(
            token,
            publicKey.export({ format: 'pem', type: 'spki' }), { algorithms: [jwtAlgorithm] }
        ) as JwtPayload;
    } catch (error) {
        if (error instanceof jsonwebtoken.JsonWebTokenError) {
            return null;
        }
        throw error;
    }
}
