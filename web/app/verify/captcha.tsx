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

async function sendTokenToServer(verificationId: string, captchaToken: string, onSuccess?: () => void, onError?: (error: VerifyError) => void) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/api/verify`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ verificationId: verificationId, captchaToken: captchaToken }),
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

export const Captcha = ({ yandexSiteKey }: { yandexSiteKey: string }) => {
    const searchParams = useSearchParams();
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    return (
        <div className={(loading ? "pointer-events-none opacity-50" : "") + " transition-opacity flex flex-col gap-4"}>
            {error && <div className="text-center text-danger">{error}</div>}
            {success && <div className="text-center text-success">Вы успешно прошли проверку</div>}
            {!success && !error && (
                <SmartCaptcha
                    sitekey={yandexSiteKey}
                    onSuccess={
                        (token) => {
                            setLoading(true);
                            sendTokenToServer(
                                searchParams.get("id") || "", token,
                                () => {
                                    setSuccess(true);
                                    setLoading(false);
                                },
                                (error) => {
                                    setError(error.message);
                                    setLoading(false);
                                }
                            );
                        }
                    }
                />
            )}
        </div>
    );
};