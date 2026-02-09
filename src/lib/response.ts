// export function askTimeResponse(): string {
//   const randomNum = Math.floor(Math.random() * 5) + 1;

//   const responses: { [key: number]: string } = {
//     1: "कृपया बुकिङको लागि समय दिनुस्।",
//     2: "कृपया तपाईंको उपलब्ध समय बताउनुहोस्।",
//     3: "कृपया समय निर्धारण गर्नुहोस्।",
//     4: "कृपया समय चयन गर्नुहोस्।",
//     5: "कृपया उपयुक्त समय छान्नुहोस्।",
//   };

//   return responses[randomNum];
// }

// export function askDateResponse(): string {
//   const randomNum = Math.floor(Math.random() * 5) + 1;

//   const responses: { [key: number]: string } = {
//     1: "कृपया कुन दिन अपोइन्टमेन्ट बुक गर्न चाहनुहुन्छ?",
//     2: "कृपया तपाईंको सुविधाजनक मिति बताउनुहोस्।",
//     3: "कृपया मिति निर्धारण गर्नुहोस्।",
//     4: "कृपया मिति चयन गर्नुहोस्।",
//     5: "कृपया उपयुक्त मिति छान्नुहोस्।",
//   };

//   return responses[randomNum];
// }

// export function askDepartmentResponse(): string {
//   const randomNum = Math.floor(Math.random() * 5) + 1;

//   const responses: { [key: number]: string } = {
//     1: "कृपया कुन विभागमा अपोइन्टमेन्ट बुक गर्न चाहनुहुन्छ?",
//     2: "कृपया तपाईंको इच्छित विभाग बताउनुहोस्।",
//     3: "कृपया विभाग निर्धारण गर्नुहोस्।",
//     4: "कृपया विभाग चयन गर्नुहोस्।",
//     5: "कृपया उपयुक्त विभाग छान्नुहोस्।",
//   };

//   return responses[randomNum];
// }

// export function askDoctorResponse(): string {
//   const randomNum = Math.floor(Math.random() * 5) + 1;

//   const responses: { [key: number]: string } = {
//     1: "कृपया कुन डाक्टरसँग अपोइन्टमेन्ट बुक गर्न चाहनुहुन्छ?",
//     2: "कृपया तपाईंको इच्छित डाक्टर बताउनुहोस्।",
//     3: "कृपया डाक्टर निर्धारण गर्नुहोस्।",
//     4: "कृपया डाक्टर चयन गर्नुहोस्।",
//     5: "कृपया उपयुक्त डाक्टर छान्नुहोस्।",
//   };

//   return responses[randomNum];
// }

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
