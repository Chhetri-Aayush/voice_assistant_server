export function askTimeResponse(): string {
  const randomNum = Math.floor(Math.random() * 5) + 1;

  const responses: { [key: number]: string } = {
    1: "कृपया बुकिङको लागि समय दिनुस्।",
    2: "कृपया तपाईंको उपलब्ध समय बताउनुहोस्।",
    3: "कृपया समय निर्धारण गर्नुहोस्।",
    4: "कृपया समय चयन गर्नुहोस्।",
    5: "कृपया उपयुक्त समय छान्नुहोस्।",
  };

  return responses[randomNum];
}

export function askDateResponse(): string {
  const randomNum = Math.floor(Math.random() * 5) + 1;

  const responses: { [key: number]: string } = {
    1: "कृपया कुन दिन अपोइन्टमेन्ट बुक गर्न चाहनुहुन्छ?",
    2: "कृपया तपाईंको सुविधाजनक मिति बताउनुहोस्।",
    3: "कृपया मिति निर्धारण गर्नुहोस्।",
    4: "कृपया मिति चयन गर्नुहोस्।",
    5: "कृपया उपयुक्त मिति छान्नुहोस्।",
  };

  return responses[randomNum];
}

export function askDepartmentResponse(): string {
  const randomNum = Math.floor(Math.random() * 5) + 1;

  const responses: { [key: number]: string } = {
    1: "कृपया कुन विभागमा अपोइन्टमेन्ट बुक गर्न चाहनुहुन्छ?",
    2: "कृपया तपाईंको इच्छित विभाग बताउनुहोस्।",
    3: "कृपया विभाग निर्धारण गर्नुहोस्।",
    4: "कृपया विभाग चयन गर्नुहोस्।",
    5: "कृपया उपयुक्त विभाग छान्नुहोस्।",
  };

  return responses[randomNum];
}

export function askDoctorResponse(): string {
  const randomNum = Math.floor(Math.random() * 5) + 1;

  const responses: { [key: number]: string } = {
    1: "कृपया कुन डाक्टरसँग अपोइन्टमेन्ट बुक गर्न चाहनुहुन्छ?",
    2: "कृपया तपाईंको इच्छित डाक्टर बताउनुहोस्।",
    3: "कृपया डाक्टर निर्धारण गर्नुहोस्।",
    4: "कृपया डाक्टर चयन गर्नुहोस्।",
    5: "कृपया उपयुक्त डाक्टर छान्नुहोस्।",
  };

  return responses[randomNum];
}
