import dotenv from "dotenv";

dotenv.config({
    path: [
        ".env.local",
        ".env",
    ]
});

(async () => {
    const { config } = await import('@/lib/config');
    const { getKeyPair } = await import('@/lib/keys');

    const keyPair = getKeyPair();

    console.log("Public Key:", keyPair.encodedPublicKey);
})();
