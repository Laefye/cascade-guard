import { KeyPair } from "@/lib/keypairs";
import { defaultSignatureOptions, sign, VerifyAsk as VerifyAsk, VerificationAsk, VerificationAskScheme, verify } from "@/lib/requests";
import { BotApi } from "@/lib/services/bot";
import { markVerificationAsCompleted, takeVerificationForProcessing } from "@/lib/services/verifications";
import { verifyCaptcha } from "@/lib/yandex";
import { NextResponse } from "next/server";
import z from "zod";
import jwt from "jsonwebtoken";

const RequestScheme = z.object({
    verificationId: z.string(),
    captchaToken: z.string(),
});

const botApi = new BotApi(process.env.BOT_ENDPOINT || "", async () => {
    const keyPair = KeyPair.getKeyPair();
    return jwt.sign({}, keyPair.webPrivateKey, { algorithm: "ES256", expiresIn: "5m" });
});

export async function GET(request: Request) {
    const keyPair = KeyPair.getKeyPair();
    return NextResponse.json({ status: "OK" });
}

export async function POST(request: Request) {
    
    const body = await request.json();
    const parsedBody = RequestScheme.safeParse(body);
    
    if (!parsedBody.success) {
        return NextResponse.json({ status: "INVALID_REQUEST_BODY" }, { status: 400 });
    }

    
    const { captchaToken: token } = parsedBody.data;
    
    const isCaptchaValid = await verifyCaptcha(token);
    if (!isCaptchaValid) {
        return NextResponse.json({ status: "INVALID_CAPTCHA" }, { status: 400 });
    }
    
    const taken = await takeVerificationForProcessing(parsedBody.data.verificationId);
    if (!taken) {
        return NextResponse.json({ status: "VERIFICATION_NOT_FOUND_OR_ALREADY_PROCESSED" }, { status: 404 });
    }

    try {
        await botApi.verify(taken.userId);
    } catch (error) {
        console.error("Failed to verify user with bot:", error);
        return NextResponse.json({ status: "FAILED_TO_VERIFY_WITH_BOT" }, { status: 500 });
    }

    await markVerificationAsCompleted(parsedBody.data.verificationId);

    return NextResponse.json({ status: "OK" });
}