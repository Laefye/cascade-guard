import { createProblem } from "@/lib/problem";
import z from "zod";
import { createVerificationId } from "@/lib/services/verifications";
import jwt from "jsonwebtoken";
import { KeyPair } from "@/lib/keypairs";

const CreateVerificationRequestScheme = z.object({
    userId: z.string(),
    userDisplayName: z.string(),
    avatarUrl: z.url().nullable(),
});

type VerificationResponseId = {
    verificationId: string;
};

async function verifyBotRequest(token: string): Promise<boolean> {
    const payload = jwt.verify(token, KeyPair.getKeyPair().botPublicKey, {
        algorithms: ["ES256"],
    });
    if (typeof payload !== "object") {
        return false;
    }
    return true;
}

export async function POST(request: Request) {
    const authorizationHeader = request.headers.get("Authorization");

    if (!authorizationHeader) {
        return createProblem({ status: "MISSING_AUTHORIZATION_HEADER" });
    }

    const [scheme, token] = authorizationHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
        return createProblem({ status: "INVALID_AUTHORIZATION_HEADER" });
    }

    if (!(await verifyBotRequest(token))) {
        return createProblem({ status: "INVALID_BOT_TOKEN" });
    }

    const body = await request.json();
    const parseResult = CreateVerificationRequestScheme.safeParse(body);

    if (!parseResult.success) {
        return createProblem({ status: "INVALID_REQUEST_BODY" });
    }

    const verificationResponse: VerificationResponseId = {
        verificationId: await createVerificationId(parseResult.data.userId, parseResult.data.userDisplayName, parseResult.data.avatarUrl),
    };

    return new Response(JSON.stringify(verificationResponse), {
        headers: { "Content-Type": "application/json" },
    });
}
