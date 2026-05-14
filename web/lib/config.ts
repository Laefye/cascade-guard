export const config = {
    botPublicKey: process.env.BOT_PUBLIC_KEY || '',
    botEndpoint: process.env.BOT_ENDPOINT || '',
    yandexCaptchaSecretKey: process.env.YANDEX_CAPTCHA_SECRET_KEY || '',
    yandexCaptchaSiteKey: process.env.YANDEX_CAPTCHA_SITE_KEY || '',
    keyPairDir: process.env.KEYPAIR_DIR || '.',
    basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
    redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
};