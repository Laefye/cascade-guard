import { createProblem } from "@/lib/problem";
import z from "zod";
import { createVerificationId } from "@/lib/services/verifications";
import { getTokenManager, loadPublicKey } from "@/lib/keys";
import { config } from "@/lib/config";

const CreateVerificationRequestScheme = z.object({
    userId: z.string(),
    userDisplayName: z.string(),
    avatarUrl: z.url().nullable(),
});

type VerificationResponseId = {
    verificationId: string;
};

export async function POST(request: Request) {
    const authorizationHeader = request.headers.get("Authorization");

    if (!authorizationHeader) {
        return createProblem({ status: "MISSING_AUTHORIZATION_HEADER" });
    }

    const [scheme, token] = authorizationHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
        return createProblem({ status: "INVALID_AUTHORIZATION_HEADER" });
    }

    if (getTokenManager().verify(token, "cascade-guard-bot", "cascade-guard-web", loadPublicKey('base64', config.botPublicKey))) {
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
