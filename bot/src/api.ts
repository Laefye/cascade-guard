import express from "express";
import z from "zod";
import crypto from "crypto";
import { loadPublicKeyFromBase64 } from "./keypair.js";
import { verifyJwt, type JwtPayload } from "./jwt.js";
import EventEmitter from "events";

const VerifyRequest = z.object({
    token: z.string(),
});

export class Api {
    private app = express();
    private botPublicKey: crypto.KeyObject;
    private webPublicKey: crypto.KeyObject;

    bus: EventEmitter = new EventEmitter();

    constructor(botPublicKey: crypto.KeyObject, webPublicKey: crypto.KeyObject) {
        this.botPublicKey = botPublicKey;
        this.webPublicKey = webPublicKey;

        this.app.use(express.json());
        
        this.app.post("/verify", (req, res) => {
            const parseResult = VerifyRequest.safeParse(req.body);
            if (!parseResult.success) {
                res.status(400).json({ status: "INVALID_REQUEST" });
                return;
            }

            const bearerToken = req.headers.authorization;
            if (!bearerToken || !bearerToken.startsWith("Bearer ")) {
                res.status(401).json({ status: "INVALID_TOKEN" });
                return;
            }

            const verificationToken = bearerToken.split(" ")[1]!;

            if (!verifyJwt(verificationToken, this.webPublicKey)) {
                res.status(401).json({ status: "INVALID_TOKEN" });
                return;
            }

            const { token } = parseResult.data;
            const payload: JwtPayload | null = verifyJwt(token, this.botPublicKey);
            if (!payload) {
                res.status(401).json({ status: "INVALID_TOKEN" });
                return;
            }

            this.bus.emit("verified", payload.userId);

            res.status(200).json({ status: "OK", userId: payload.userId });
        });
    }

    listen(port: string | number) {
        this.app.listen(port, () => {
            console.log(`API server listening on port ${port}`);
        });
    }
}
