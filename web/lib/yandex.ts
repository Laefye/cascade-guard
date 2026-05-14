import { config } from "./config";

const endpoint = "https://smartcaptcha.cloud.yandex.ru/validate";
const secretKey = () => {
    return config.yandexCaptchaSecretKey;
};

export async function verifyCaptcha(token: string, ip?: string): Promise<boolean> {
    try {
        const params = new URLSearchParams();
        params.append("secret", secretKey());
        params.append("token", token);
        if (ip) {
            params.append("ip", ip);
        }

        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: params.toString(),
        });
        if (!response.ok) {
            console.error("Failed to verify captcha, server responded with status:", response.status);
            return false;
        }

        const data = await response.json();
        return data.status === 'ok';
    } catch (error) {
        console.error("Error verifying captcha:", error);
        return false;
    }
}