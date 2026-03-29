import { env } from "@/config/env";
import Redis from "ioredis";

export const redis = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
});
