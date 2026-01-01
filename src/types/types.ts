export type NLUResult = {
  intent: string;
  entities: Partial<{
    date: string;
    department: string;
    time: string;
  }>;
};

export type BookingContext = {
  intent: string | null;
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
