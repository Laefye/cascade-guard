import express from "express";
import z from "zod";
import crypto from "crypto";
import EventEmitter from "events";
import jwt from "jsonwebtoken";

const VerifyRequest = z.object({
    userId: z.string(),
});

export class Api {
    private app = express();
    private webPublicKey: crypto.KeyObject;

    bus: EventEmitter = new EventEmitter();

    private verifyWebJWT(token: string): boolean {
        const payload = jwt.verify(token, this.webPublicKey, {
            algorithms: ["ES256"],
        });
        if (typeof payload !== "object") {
            return false;
        }
        return true;
    }

    constructor(webPublicKey: crypto.KeyObject) {
        this.webPublicKey = webPublicKey;

        this.app.use(express.json());
        
        this.app.post("/verify", (req, res) => {
            const parseResult = VerifyRequest.safeParse(req.body);
            if (!parseResult.success) {
                res.status(400).json({ status: "INVALID_REQUEST" });
                return;
            }

            const authHeader = req.headers["authorization"];
            if (!authHeader) {
                res.status(401).json({ status: "MISSING_AUTHORIZATION_HEADER" });
                return;
            }

            const [scheme, token] = authHeader.split(" ");
            if (scheme !== "Bearer" || !token) {
                console.log("Invalid auth header format:", authHeader);
                res.status(401).json({ status: "INVALID_AUTHORIZATION_HEADER" });
                return;
            }

            if (!this.verifyWebJWT(token)) {
                console.log("Invalid auth token:", token);
                res.status(401).json({ status: "INVALID_AUTH_TOKEN" });
                return;
            }

            this.bus.emit("verified", parseResult.data.userId);

            res.status(200).json({ status: "OK" });
        });
    }

    listen(port: string | number) {
        this.app.listen(port, () => {
            console.log(`API server listening on port ${port}`);
        });
    }
}
