
const endpoint = "https://smartcaptcha.cloud.yandex.ru/validate";
const secretKey = () => {
    return process.env.YANDEX_CAPTCHA_SECRET_KEY || "";
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
        const data = await response.json();
        console.log("Captcha verification response:", data);
        return data.status === 'ok';
    } catch (error) {
        console.error("Error verifying captcha:", error);
        return false;
    }
}