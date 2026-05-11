import express from "express";
import z from "zod";
import crypto from "crypto";
import EventEmitter from "events";
import { defaultSignatureOptions, verify, VerifyAskScheme } from "./requests.js";

const VerifyRequest = z.object({
    verifyToken: z.string(),
});

export class Api {
    private app = express();
    private webPublicKey: crypto.KeyObject;

    bus: EventEmitter = new EventEmitter();

    constructor(webPublicKey: crypto.KeyObject) {
        this.webPublicKey = webPublicKey;

        this.app.use(express.json());
        
        this.app.post("/verify", (req, res) => {
            const parseResult = VerifyRequest.safeParse(req.body);
            if (!parseResult.success) {
                res.status(400).json({ status: "INVALID_REQUEST" });
                return;
            }

            const verifyAsk = verify(parseResult.data.verifyToken, this.webPublicKey, VerifyAskScheme, defaultSignatureOptions);
            if (!verifyAsk) {
                res.status(401).json({ status: "INVALID_TOKEN" });
                return;
            }

            this.bus.emit("verified", verifyAsk.userId);

            res.status(200).json({ status: "OK", userId: verifyAsk.userId });
        });
    }

    listen(port: string | number) {
        this.app.listen(port, () => {
            console.log(`API server listening on port ${port}`);
        });
    }
}
