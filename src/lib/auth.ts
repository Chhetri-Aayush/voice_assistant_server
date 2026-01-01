import { env } from "@/config/env";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db/index";
import { openAPI } from "better-auth/plugins";

export const auth = betterAuth({
  baseURL: `http://localhost:${env.PORT}`,
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [openAPI()],
});
