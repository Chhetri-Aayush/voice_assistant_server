import NepaliDate from "nepali-date-converter";

export function askTimeResponse(): string {
  const randomNum = Math.floor(Math.random() * 5) + 1;

  const responses: { [key: number]: string } = {
    1: "तपाईंलाई कति बजे आउन सजिलो हुन्छ?",
    2: "कति बजेको अपोइन्टमेन्ट राखिदिऊँ?",
    3: "कुन समयमा बुक गर्न चाहनुहुन्छ?",
    4: "आउने समय भन्नुहोस् न।",
    5: "कुन टाइममा बुकिङ गरिदिऊँ?",
  };

  return responses[randomNum];
}

export function askDateResponse(): string {
  const randomNum = Math.floor(Math.random() * 5) + 1;

  const responses: { [key: number]: string } = {
    1: "कुन दिनको अपोइन्टमेन्ट राखिदिऊँ?",
    2: "कहिले आउन मिल्छ हजुरलाई?",
    3: "कुन गते वा बार आउन चाहनुहुन्छ?",
    4: "बुकिङ कुन मितिको लागि गर्ने हो?",
    5: "आउने दिन वा मिति भन्नुहोस् न।",
  };

  return responses[randomNum];
}

export function askDepartmentResponse(): string {
  const randomNum = Math.floor(Math.random() * 5) + 1;

  const responses: { [key: number]: string } = {
    1: "कुन विभागमा जाँच गराउन चाहनुहुन्छ?",
    2: "कुन डिपार्टमेन्टमा अपोइन्टमेन्ट हो?",
    3: "कुन विभागको डाक्टरलाई भेट्न खोज्नुभएको?",
    4: "कुन समस्या वा विभागको लागि अपोइन्टमेन्ट चाहिएको हो?",
    5: "विभागको नाम भन्नुहोस् न।",
  };

  return responses[randomNum];
}

export function askDoctorResponse(): string {
  const randomNum = Math.floor(Math.random() * 5) + 1;

  const responses: { [key: number]: string } = {
    1: "कुन डाक्टरलाई देखाउन चाहनुहुन्छ?",
    2: "तपाईं कुन डाक्टरलाई भेट्न खोज्नुभएको हो?",
    3: "कृपया डाक्टरको नाम भन्नुहोस् न।",
    4: "कुन डाक्टरसँग जाँच गराउने हो?",
    5: "कुन डाक्टरको अपोइन्टमेन्ट मिलाइदिऊँ?",
  };

  return responses[randomNum];
}

export function parseNepaliTime(input: string): string | null {
  // console.log("we are in the parse nepali time:", input);

  let period: "AM" | "PM" | null = null;
  let hour: number | null = null;
  let minutes: string = "00";

  const periodMap: Record<string, "AM" | "PM"> = {
    बिहान: "AM",
    विहान: "AM",
    बिहाना: "AM",
    दिउँसो: "PM",
    दिउसो: "PM",
    साँझ: "PM",
    सांझ: "PM",
    राति: "PM",
    रात: "PM",
  };

  const nepaliDigits: Record<string, string> = {
    "०": "0",
    "१": "1",
    "२": "2",
    "३": "3",
    "४": "4",
    "५": "5",
    "६": "6",
    "७": "7",
    "८": "8",
    "९": "9",
  };

  const wordToNumber: Record<string, number> = {
    एक: 1,
    दुई: 2,
    तिन: 3,
    तीन: 3,
    चार: 4,
    पाँच: 5,
    छ: 6,
    सात: 7,
    आठ: 8,
    नौ: 9,
    दश: 10,
    दस: 10,
    एघार: 11,
    एगार: 11,
    बाह्र: 12,
  };

  function toArabic(str: string): string {
    return str
      .split("")
      .map((c: string) => nepaliDigits[c] ?? c)
      .join("");
  }

  for (const [word, value] of Object.entries(periodMap)) {
    if (input.includes(word)) {
      period = value;
      break;
    }
  }

  const timeMatch = input.match(/([०-९\d]+):([०-९\d]+)|([०-९\d]+)/);

  if (timeMatch) {
    if (timeMatch[1] && timeMatch[2]) {
      hour = parseInt(toArabic(timeMatch[1]), 10);
      minutes = toArabic(timeMatch[2]).padStart(2, "0");
    } else if (timeMatch[3]) {
      hour = parseInt(toArabic(timeMatch[3]), 10);
    }
  }

  if (hour === null) {
    for (const [word, value] of Object.entries(wordToNumber)) {
      if (input.includes(word)) {
        hour = value;
        break;
      }
    }
  }

  if (hour === null) return null;

  if (period === "PM" && hour !== 12) hour += 12;
  if (period === "AM" && hour === 12) hour = 0;

  const value = `${String(hour).padStart(2, "0")}:${minutes}`;

  return value;
}

type NepaliNumberMap = Record<string, number>;

const nepaliWordToNumber: NepaliNumberMap = {
  एक: 1,
  दुई: 2,
  तीन: 3,
  चार: 4,
  पाँच: 5,
  छ: 6,
  सात: 7,
  आठ: 8,
  नौ: 9,
  दस: 10,
  एघार: 11,
  बाह्र: 12,
  तेह्र: 13,
  चौध: 14,
  पन्ध्र: 15,
  सोह्र: 16,
  सत्र: 17,
  अठार: 18,
  उन्नाइस: 19,
  बिस: 20,
  बीस: 20,
  एक्काइस: 21,
  बाइस: 22,
  तेइस: 23,
  चौबिस: 24,
  पच्चिस: 25,
  छब्बिस: 26,
  सत्ताइस: 27,
  अट्ठाइस: 28,
  उनन्तिस: 29,
  तिस: 30,
  एकतिस: 31,
  बत्तिस: 32,
};

interface ResolvedDate {
  englishDate: string;
}

function parseNepaliGate(phrase: string): number {
  const cleaned = phrase.replace(/गते/g, "").trim();
  const num = nepaliWordToNumber[cleaned];

  if (num === undefined) {
    throw new Error(`Unknown Nepali day word: "${cleaned}"`);
  }

  return num;
}

function formatDateLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function resolveNepaliDateToEnglish(nepaliPhrase: string): ResolvedDate {
  const targetDay = parseNepaliGate(nepaliPhrase);

  const todayBS = new NepaliDate();
  const currentDay: number = todayBS.getDate();
  let month: number = todayBS.getMonth();
  let year: number = todayBS.getYear();

  if (targetDay < currentDay) {
    month++;
    if (month >= 12) {
      month = 0;
      year++;
    }
  }

  const resolvedBS = new NepaliDate(year, month, targetDay);

  const englishDateObj: Date = resolvedBS.toJsDate();
  const englishDate: string = formatDateLocal(englishDateObj);

  return {
    englishDate,
  };
}
