import express from "express";
import z from "zod";
import crypto from "crypto";
import EventEmitter from "events";
import jwt from "jsonwebtoken";

const VerifyRequest = z.object({
    userId: z.string(),
});

export type TokenVerifier = (token: string) => boolean;

export class Api {
    private app = express();

    bus: EventEmitter = new EventEmitter();

    constructor(public tokenVerifier: TokenVerifier) {
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

            if (!this.tokenVerifier(token)) {
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
