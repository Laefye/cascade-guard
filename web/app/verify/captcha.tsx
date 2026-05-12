'use client';

import { SmartCaptcha } from "@yandex/smart-captcha";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import z from "zod";

const ResultScheme = z.object({
    status: z.string(),
});

type VerifyError = {
    message: string;
};

async function sendTokenToServer(verificationToken: string, captchaToken: string, onSuccess?: () => void, onError?: (error: VerifyError) => void) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/api/verify`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ verificationToken: verificationToken, captchaToken: captchaToken }),
        });

        if (!response.ok) {
            onError?.({ message: "Ошибка сервера" });
            return;
        }

        const data = await response.json();
        const parsedResult = ResultScheme.safeParse(data);

        if (!parsedResult.success) {
            onError?.({ message: "Неверный ответ от сервера" });
            return;
        }

        const result = parsedResult.data;
        if (result.status === "OK") {
            onSuccess?.();
            return;
        }

        onError?.({ message: "Проверка не пройдена" });
    } catch (error) {
        if (error instanceof Error) {
            onError?.({ message: error.message || "Ошибка сети" });
        } else {
            onError?.({ message: "Неизвестная ошибка" });
        }
    }
}

export const ComponentWithCaptcha = () => {
    const searchParams = useSearchParams();
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    return (
        <div>
            {error && <div className="mb-4 text-danger">{error}</div>}
            {success && <div className="mb-4 text-success">Вы успешно прошли проверку</div>}
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