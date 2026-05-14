import Redis from "ioredis";

let redis: Redis | null = null;

export async function getRedis(): Promise<Redis> {
    if (!redis) {
        redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");
        await redis.ping();
    }
    return redis;
}