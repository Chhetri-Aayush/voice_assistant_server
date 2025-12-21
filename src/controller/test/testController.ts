import { Context } from "hono";

export const testController = async (c: Context) => {
  const url = "https://kadal-dipesh-hosting.hf.space/mt5_appointment";

  const payload = {
    text: "context: intent=CancelAppointment; doctor_name=डाक्टर सिता; department=Neurology; date=३० डिसेम्बर; time=२ बजे; status=available",
  };
  // const payload = {
  //   text: `context: intent=${bookingContext.intent}; doctor_name=${bookingContext.PERSON}; department=${bookingContext.DEPARTMENT}; date="३० डिसेम्बर"; time=${bookingContext.TIME}; status="available"`,
  // };
  const res = await fetch(url, {
    method: "POST",
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      "X-API-Key": "NepaliVoiceAssistant_2025_supersecret_9xK2!",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`MT5 request failed: ${res.status}`);
  }

  const result = await res.json();
  return c.json(result);
};
