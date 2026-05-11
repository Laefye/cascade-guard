import { KeyPair } from "@/lib/keypairs";
import { defaultSignatureOptions, sign, VerifyAsk as VerifyAsk, VerificationAsk, VerificationAskScheme, verify } from "@/lib/requests";
import { verifyCaptcha } from "@/lib/yandex";
import { NextResponse } from "next/server";
import z from "zod";

const RequestScheme = z.object({
    verificationToken: z.string(),
    captchaToken: z.string(),
});

const botEndpoint = process.env.BOT_ENDPOINT || "";

export async function GET(request: Request) {
    const keyPair = KeyPair.getKeyPair();
    return NextResponse.json({ status: "OK" });
}

export async function POST(request: Request) {
    
    const body = await request.json();
    const parseResult = RequestScheme.safeParse(body);
    
    if (!parseResult.success) {
        return NextResponse.json({ status: "INVALID_REQUEST_BODY" }, { status: 400 });
    }

    
    const { captchaToken: token } = parseResult.data;
    
    const isCaptchaValid = await verifyCaptcha(token);
    if (!isCaptchaValid) {
        return NextResponse.json({ status: "INVALID_CAPTCHA" }, { status: 400 });
    }
    
    const verifactionAsk = await verify(parseResult.data.verificationToken, KeyPair.getKeyPair().botPublicKey, VerificationAskScheme, defaultSignatureOptions);
    if (!verifactionAsk) {
        return NextResponse.json({ status: "INVALID_SIGNATURE_TOKEN" }, { status: 400 });
    }

    const verifyToken = sign<VerifyAsk>({
        userId: verifactionAsk.userId,
    }, KeyPair.getKeyPair().webPrivateKey, defaultSignatureOptions);

    const response = await fetch(botEndpoint + "/verify", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ verifyToken: verifyToken }),
    });

    if (!response.ok) {
        console.error("Failed to send verification result to bot:", await response.text());
        return NextResponse.json({ status: "FAILED_TO_NOTIFY_BOT" }, { status: 500 });
    }

    return NextResponse.json({ status: "OK" });
}