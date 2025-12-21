export type NLUResult = {
  intent: string;
  entities: Partial<{
    date: string;
    department: string;
    time: string;
  }>;
};

// export type BookingContext = {
//   // intent: "BOOK_APPOINTMENT" | null;
//   intent: string | null;
//   date: string | null;
//   department: string | null;
//   time: string | null;
// };

export type BookingContext = {
  intent: string | null;
  TIME: string | null;
  // DATE: string | null;
  PERSON: string | null;
  DEPARTMENT: string | null;
};

export const values: { name: string; date: string } = {
  name: "राम बहादुर",
  date: "२०२५ ३० डिसेम्बर",
};

export const id = 12;

// export const emptyContext: BookingContext = {
//   intent: null,
//   date: null,
//   department: null,
//   time: null,
// };
