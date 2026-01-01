import { env } from "@/config/env";

export const entitiesResponse = async (text: string) => {
  const res = await fetch(`${env.LLM_API_BASE_URL}/ner`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": env.LLM_API_KEY,
    },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) {
    throw new Error(
      `There is some error in the mbert for the entities extraction `,
    );
  }

  return res.json();
};

export const intentResponse = async (text: string) => {
  const res = await fetch(`${env.LLM_API_BASE_URL}/intent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": env.LLM_API_KEY,
    },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) {
    throw new Error(
      `There is some error in the mbert for the intent extraction `,
    );
  }

  return res.json();
};

export const mt5Response = async (payload: string) => {
  const res = await fetch(`${env.LLM_API_BASE_URL}/mt5_appointment`, {
    method: "POST",
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      "X-API-Key": env.LLM_API_KEY,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`Your MT5 failed bruv`);
  }

  return res.json();
};

// const payload = {
//   text: "context: intent=BookAppointment; doctor_name=डाक्टर सिता; department=Neurology; date=३० डिसेम्बर; time=२ बजे; status=available",
// };
//
// const payload = {
//   text: `context: intent=${bookingContext.intent}; doctor_name=${bookingContext.PERSON}; department=${bookingContext.DEPARTMENT}; date="३० डिसेम्बर"; time=${bookingContext.TIME}; status="available"`,
// };
