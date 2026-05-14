import z from "zod";

export class WebApiError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "WebApiError";
    }
}

export class WebApiInvalidResponseError extends WebApiError {
    constructor(message: string) {
        super(message);
        this.name = "WebApiInvalidResponseError";
    }
}

export class WebApiResponseError extends WebApiError {
    constructor(message: string, public status: string) {
        super(message);
        this.name = "WebApiResponseError";
    }
}

type VerificationRequest = {
    userId: string;
    userDisplayName: string;
    avatarUrl: string | null;
};

const ProblemResponseScheme = z.object({
    status: z.string(),
});

const VerificationResponseIdScheme = z.object({
    verificationId: z.string(),
});

type VerificationResponseId = z.infer<typeof VerificationResponseIdScheme>;

type AuthorizationToken = () => Promise<string>;

export class Web {
    constructor(private endpoint: string, private getAuthToken: AuthorizationToken) {
    }

    async createVerificationRequest(userId: string, userDisplayName: string, avatarUrl: string | null): Promise<VerificationResponseId> {
        return this.sendRequest("/api/verification/create", { userId, userDisplayName, avatarUrl }, VerificationResponseIdScheme);
    }

    private async sendRequest(path: string, body: any, scheme: z.ZodType): Promise<any> {
        const authToken = await this.getAuthToken();

        const response = await fetch(this.endpoint + path, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${authToken}`,
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            try {
                const problemData = await response.json();
                const parseResult = ProblemResponseScheme.safeParse(problemData);
                if (parseResult.success) {
                    throw new WebApiResponseError(`Web API responded with error: ${parseResult.data.status}`, parseResult.data.status);
                }
            } catch {
                throw new WebApiError(`Web API responded with status ${response.status} ${response.statusText}`);
            }
        }

        const responseData = await response.json();

        const parseResult = scheme.safeParse(responseData);
        if (!parseResult.success) {
            throw new WebApiInvalidResponseError("Invalid response from web API");
        }

        return parseResult.data;
    }

    getVerifyEndpoint(verificationId: string): string {
        return `${this.endpoint}/verify?id=${encodeURIComponent(verificationId)}`;
    }
}