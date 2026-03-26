import { db } from "../db/index";
import { departments, doctors, doctorAvailability, timeSlots } from "./schema";

// const seedDepartments = [
//   {
//     name: "कार्डियोलोजी",
//     description: "मुटु र रक्तनली सम्बन्धी उपचार",
//   },
//   {
//     name: "डर्माटोलोजी",
//     description: "छाला, कपाल र नङ सम्बन्धी उपचार",
//   },
//   {
//     name: "बाल रोग विभाग",
//     description: "शिशु र बालबालिकाको स्वास्थ्य सेवा",
//   },
//   {
//     name: "न्युरोलोजी",
//     description: "मस्तिष्क र स्नायु प्रणाली सम्बन्धी रोगहरू",
//   },
// ];

// const seedDoctors = [
//   {
//     name: "डाक्टर राम",
//     departmentId: 1,
//     specialization: "इण्टरभेन्सनल कार्डियोलोजी",
//     experience: 12,
//     consultationFee: 150,
//   },
//   {
//     name: "डाक्टर आलिश",
//     departmentId: 4,
//     specialization: "कस्मेटिक डर्माटोलोजी",
//     experience: 8,
//     consultationFee: 100,
//   },
// ];
// const seedAvailability = [
//   {
//     doctorId: 1,
//     dayOfWeek: "सोमबार",
//     startTime: "09:00:00",
//     endTime: "17:00:00",
//   },
//   {
//     doctorId: 1,
//     dayOfWeek: "बुधबार",
//     startTime: "09:00:00",
//     endTime: "13:00:00",
//   },
//   {
//     doctorId: 2,
//     dayOfWeek: "मङ्गलबार",
//     startTime: "10:00:00",
//     endTime: "18:00:00",
//   },
// ];
const seedTimeSlots = [
  {
    doctorId: 1,
    slotDate: "2026-04-03",
    slotTime: "10:00:00",
    status: "available",
    durationMinutes: 30,
  },
  {
    doctorId: 1,
    slotDate: "2025-03-29",
    slotTime: "11:00:00",
    status: "available",
    durationMinutes: 30,
  },
];
await db.insert(timeSlots).values(seedTimeSlots);
