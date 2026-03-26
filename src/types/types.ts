import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { auth } from "../lib/auth";

export type NLUResult = {
  intent: string;
  entities: Partial<{
    date: string;
    department: string;
    time: string;
  }>;
};

export type BookingContext = {
  ID: any | null;
  INTENT: string | null;
  TIME: string | null;
  DATE: string | null;
  PERSON: string | null;
  DEPARTMENT: string | null;
};

export type IntentResponse = {
  intent: string;
  confidence: number;
};

export type NerEntity = {
  text: string;
  label: string;
  score: number;
  start?: number;
  end?: number;
};

export type NerResponse = {
  entities: NerEntity[];
};

export type HonoEnv = {
  Variables: {
    user: typeof auth.$Infer.Session.user;
    session: typeof auth.$Infer.Session.session;
  };
};
