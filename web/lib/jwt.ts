import jsonwebtoken from "jsonwebtoken";
import { jwtAlgorithm } from "./keypair";
import crypto from "crypto";

export interface JwtPayload {
    userId: string;
}

export function signJwt(payload: JwtPayload, privateKey: crypto.KeyObject): string {
    const jwtOptions: jsonwebtoken.SignOptions = {
        algorithm: jwtAlgorithm,
        expiresIn: "3m",
        issuer: "cascade-guard-web",
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
