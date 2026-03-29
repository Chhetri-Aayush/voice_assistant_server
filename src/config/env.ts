import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().default(8000),
  DB_URL: z.string(),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string(),
  BETTER_AUTH_SECRET: z.string(),
  BETTER_AUTH_URL: z.string(),
  LLM_API_KEY: z.string(),
  LLM_API_BASE_URL: z.string(),
  REDIS_HOST: z.string().default("127.0.0.1"),
  REDIS_PORT: z.coerce.number().default(6379),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(parsed.error.issues);
  process.exit(1);
}

export const env = parsed.data;
