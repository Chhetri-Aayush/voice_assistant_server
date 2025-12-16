import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().default(8000),
  DB_URL: z.string(),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string(),
  BETTER_AUTH_SECRET: z.string(),
  BETTER_AUTH_URL: z.string(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(parsed.error.issues);
  process.exit(1);
}

export const env = parsed.data;
