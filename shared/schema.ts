import { pgTable, text, serial, integer, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const loanApplications = pgTable("loan_applications", {
  id: serial("id").primaryKey(),
  applicantName: text("applicant_name").notNull(),
  amount: integer("amount").notNull(),
  termMonths: integer("term_months").notNull(),
  purpose: text("purpose").notNull(),
  income: integer("income").notNull(),
  employmentStatus: text("employment_status").notNull(),
  debtToIncomeRatio: numeric("debt_to_income_ratio").notNull(),
  
  // AI generated fields
  riskScore: integer("risk_score"), // 0-100
  riskLevel: text("risk_level"), // Low, Medium, High
  aiAnalysis: text("ai_analysis"),
  
  status: text("status").default("Pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertLoanApplicationSchema = createInsertSchema(loanApplications).omit({ 
  id: true, 
  riskScore: true, 
  riskLevel: true, 
  aiAnalysis: true, 
  status: true, 
  createdAt: true 
});

export type LoanApplication = typeof loanApplications.$inferSelect;
export type InsertLoanApplication = z.infer<typeof insertLoanApplicationSchema>;
export type UpdateLoanApplicationRequest = Partial<InsertLoanApplication> & { 
  status?: string;
  riskScore?: number;
  riskLevel?: string;
  aiAnalysis?: string;
};
