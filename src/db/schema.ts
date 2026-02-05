import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  boolean,
  index,
  serial,
  varchar,
  integer,
  time,
  date,
} from "drizzle-orm/pg-core";

// auth queries
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

//booking queries
// define appointment related schema

// export const departments = pgTable("departments", {
//   id: serial("id").primaryKey(),
//   name: varchar("name", { length: 100 }).notNull().unique(),
//   description: text("description"),
//   createdAt: timestamp("created_at").defaultNow(),
//   updatedAt: timestamp("updated_at").defaultNow(),
// });

// export const doctors = pgTable("doctors", {
//   id: serial("id").primaryKey(),
//   userId: text("user_id")
//     .references(() => user.id)
//     .notNull(),
//   departmentId: integer("department_id")
//     .references(() => departments.id)
//     .notNull(),
//   specialization: varchar("specialization", { length: 255 }),
//   experience: integer("experience"),
//   consultationFee: integer("consultation_fee"),
//   createdAt: timestamp("created_at").defaultNow(),
//   updatedAt: timestamp("updated_at").defaultNow(),
// });

// export const doctorAvailability = pgTable("doctor_availability", {
//   id: serial("id").primaryKey(),
//   doctorId: integer("doctor_id")
//     .references(() => doctors.id)
//     .notNull(),
//   dayOfWeek: varchar("day_of_week", { length: 20 }).notNull(),
//   startTime: time("start_time").notNull(),
//   endTime: time("end_time").notNull(),
//   createdAt: timestamp("created_at").defaultNow(),
//   updatedAt: timestamp("updated_at").defaultNow(),
// });

// export const timeSlots = pgTable("time_slots", {
//   id: serial("id").primaryKey(),
//   doctorId: integer("doctor_id")
//     .references(() => doctors.id)
//     .notNull(),
//   slotDate: date("slot_date").notNull(),
//   slotTime: time("slot_time").notNull(),
//   status: varchar("status", { length: 20 }).default("available"),
//   durationMinutes: integer("duration_minutes").default(30),
//   createdAt: timestamp("created_at").defaultNow(),
//   updatedAt: timestamp("updated_at").defaultNow(),
// });

// export const patients = pgTable("patients", {
//   id: serial("id").primaryKey(),
//   userId: text("user_id")
//     .references(() => user.id)
//     .notNull()
//     .unique(),
//   contactNumber: varchar("contact_number", { length: 20 }),
//   createdAt: timestamp("created_at").defaultNow(),
//   updatedAt: timestamp("updated_at").defaultNow(),
// });

// export const appointments = pgTable("appointments", {
//   id: serial("id").primaryKey(),
//   patientId: integer("patient_id")
//     .references(() => patients.id)
//     .notNull(),
//   doctorId: integer("doctor_id")
//     .references(() => doctors.id)
//     .notNull(),
//   departmentId: integer("department_id")
//     .references(() => departments.id)
//     .notNull(),
//   timeSlotId: integer("time_slot_id")
//     .references(() => timeSlots.id)
//     .notNull()
//     .unique(),
//   appointmentDate: date("appointment_date"),
//   appointmentTime: time("appointment_time"),
//   status: varchar("status", { length: 20 }).default("booked"),
//   consultationFee: integer("consultation_fee"),
//   paymentStatus: varchar("payment_status", { length: 20 }).default("pending"),
//   createdAt: timestamp("created_at").defaultNow(),
//   updatedAt: timestamp("updated_at").defaultNow(),
// });

// export const cancellations = pgTable("cancellations", {
//   id: serial("id").primaryKey(),
//   appointmentId: integer("appointment_id")
//     .references(() => appointments.id)
//     .notNull(),
//   cancelledBy:text("cancelled_by")
//     .references(() => user.id)
//     .notNull(),
//   reason: varchar("reason", { length: 50 }),
//   refundStatus: varchar("refund_status", { length: 20 }).default("pending"),
//   createdAt: timestamp("created_at").defaultNow(),
// });

export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  date: text("date").notNull(),
  time: time("time").notNull(),
  department: varchar("department", { length: 100 }).notNull(),
  doctor: varchar("doctor", { length: 150 }).notNull(),
});
