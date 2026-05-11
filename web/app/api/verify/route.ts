import { signJwt, verifyJwt } from "@/lib/jwt";
import { KeyPair } from "@/lib/keypairs";
import { verifyCaptcha } from "@/lib/yandex";
import { NextResponse } from "next/server";
import z from "zod";

const RequestScheme = z.object({
    token: z.string(),
});

const botEndpoint = process.env.BOT_ENDPOINT || "";

export async function GET(request: Request) {
    const keyPair = KeyPair.getKeyPair();
    return NextResponse.json({ status: "OK" });
}

export async function POST(request: Request) {
    const bearerToken = request.headers.get("Authorization");
    if (!bearerToken || !bearerToken.startsWith("Bearer ")) {
        return NextResponse.json({ status: "INVALID_TOKEN" }, { status: 401 });
    }
    const verificationToken = bearerToken.split(" ")[1];

    const verified = await verifyJwt(verificationToken, KeyPair.getKeyPair().botPublicKey);
    if (!verified) {
        return NextResponse.json({ status: "INVALID_TOKEN" }, { status: 401 });
    }

    const body = await request.json();
    const parseResult = RequestScheme.safeParse(body);

    if (!parseResult.success) {
        return NextResponse.json({ status: "INVALID_REQUEST" }, { status: 400 });
    }

    const { token } = parseResult.data;

    const isCaptchaValid = await verifyCaptcha(token);
    if (!isCaptchaValid) {
        return NextResponse.json({ status: "INVALID_CAPTCHA" }, { status: 400 });
    }

    const sentVerification = await fetch(botEndpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${signJwt({ userId: verified.userId }, KeyPair.getKeyPair().webPrivateKey)}`,
        },
        body: JSON.stringify({ token: verificationToken }),
    });

    console.log("Sent verification to bot, response status:", sentVerification.status);

    return NextResponse.json({ status: "OK" });
}