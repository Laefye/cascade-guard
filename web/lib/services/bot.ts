import z from "zod";

export class BotError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "BotError";
    }
}

export class BotApiError extends BotError {
    constructor(message: string, public status: string) {
        super(message);
        this.name = "BotApiError";
    }
}

export class BotApiInvalidResponseError extends BotApiError {
    constructor(message: string) {
        super(message, "INVALID_RESPONSE");
        this.name = "BotApiInvalidResponseError";
    }
}

type AuthorizationToken = () => Promise<string>;

type VerifyRequest = {
    userId: string;
}

export class BotApi {
    constructor(private endpoint: string, private getAuthToken: AuthorizationToken) {
    }

    async request(path: string, body: any, scheme: z.ZodType): Promise<any> {
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
            throw new BotApiError("Bot API returned an error", response.statusText);
        }

        const responseData = await response.json();
        const parseResult = scheme.safeParse(responseData);

        if (!parseResult.success) {
            throw new BotApiInvalidResponseError("Bot API returned invalid response");
        }

        return parseResult.data;
    }

    async verify(userId: string): Promise<void> {
        await this.request("/verify", { userId }, z.object({ status: z.string() }));
    }
}
