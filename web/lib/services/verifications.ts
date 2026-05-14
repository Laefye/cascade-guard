import { getRedis } from "../redis";
import crypto from "crypto";

export type VerificationRequest = {
    userId: string,
    userDisplayName: string,
    avatarUrl: string | null,
    status: "pending" | "processing" | "completed",
}

export async function createVerificationId(userId: string, userDisplayName: string, avatarUrl: string | null): Promise<string> {
    let redis = await getRedis();
    let verificationId = crypto.randomBytes(16).toString("hex");
    while (await redis.exists(`verification:${verificationId}`)) {
        verificationId = crypto.randomBytes(16).toString("hex");
    }
    await redis.set(`verification:${verificationId}`, JSON.stringify({ userId, userDisplayName, avatarUrl, status: "pending" }), "EX", 60 * 5);
    return verificationId;
}

// export async function isVerificationPending(verificationId: string): Promise<boolean> {
//     let redis = await getRedis();
//     const verificationData = await redis.get(`verification:${verificationId}`);
//     if (!verificationData) {
//         return false;
//     }
//     const verification: VerificationRequest = JSON.parse(verificationData);
//     return verification.status === "pending";
// }

export async function takeVerificationForProcessing(verificationId: string): Promise<VerificationRequest | null> {
    let redis = await getRedis();
    let verificationData = await redis.get(`verification:${verificationId}`);
    if (!verificationData) {
        return null;
    }
    let verification: VerificationRequest = JSON.parse(verificationData);
    if (verification.status !== "pending") {
        return null;
    }
    verification.status = "processing";
    const result = await redis.set(`verification:${verificationId}:processing`, "processing", "EX", 60 * 5, "NX");
    if (result === "OK") {
        return verification;
    }
    await redis.set(`verification:${verificationId}`, JSON.stringify(verification), "EX", 60 * 5);
    return null;
}

export async function getVerificationRequest(verificationId: string): Promise<VerificationRequest | null> {
    let redis = await getRedis();
    const verificationData = await redis.get(`verification:${verificationId}`);
    if (!verificationData) {
        return null;
    }
    return JSON.parse(verificationData);
}

export async function markVerificationAsCompleted(verificationId: string) {
    let redis = await getRedis();
    await redis.set(`verification:${verificationId}`, JSON.stringify({ status: "completed" }), "EX", 60 * 60);
}
