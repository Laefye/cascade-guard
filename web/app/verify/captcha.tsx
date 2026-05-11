'use client';

import { SmartCaptcha } from "@yandex/smart-captcha";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import z from "zod";

const ResultScheme = z.object({
    status: z.string(),
});

async function sendTokenToServer(verificationToken: string, captchaToken: string, onSuccess?: () => void, onError?: (error: any) => void) {
    try {
        const response = await fetch("/api/verify", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${verificationToken}`,
            },
            body: JSON.stringify({ token: captchaToken }),
        });
        const data = await response.json();
        const result = ResultScheme.parse(data);
        if (result.status === "OK") {
            onSuccess?.();
        } else {
            switch (result.status) {
                case "INVALID_TOKEN":
                    onError?.(new Error("Инвалидный токен в запросе"));
                    break;
                case "INVALID_CAPTCHA":
                    onError?.(new Error("Инвалидный токен капчи, попробуйте снова (обновите страницу)"));
                    break;
                default:
                    onError?.(new Error(`Unexpected status: ${result.status}`));
            }
        }
    } catch (error) {
        console.error("Error sending token to server:", error);
    }
}

export const ComponentWithCaptcha = () => {
    const searchParams = useSearchParams();
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    return (
        <div className="max-w-2xs">
            {error && <div className="mb-4 text-red-500">{error}</div>}
            {success && <div className="mb-4 text-green-500">Вы успешно прошли проверку</div>}
            {!success && !error && (
                <SmartCaptcha
                    sitekey="ysc1_bvVEgd0e4OdU5I4tNPNStKbAQrpPfRnTwImKPyH8fe4af38d"
                    onSuccess={
                        (token) => sendTokenToServer(
                            searchParams.get("token") || "", token,
                            () => setSuccess(true),
                            (error) => setError(error.message)
                        )
                    }
                />
            )}
        </div>
    );
};