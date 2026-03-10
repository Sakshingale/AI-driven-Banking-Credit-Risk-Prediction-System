import { db } from "./db";
import { loanApplications, type InsertLoanApplication, type LoanApplication, type UpdateLoanApplicationRequest } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getLoans(): Promise<LoanApplication[]>;
  getLoan(id: number): Promise<LoanApplication | undefined>;
  createLoan(loan: InsertLoanApplication): Promise<LoanApplication>;
  updateLoan(id: number, updates: UpdateLoanApplicationRequest): Promise<LoanApplication>;
}

export class DatabaseStorage implements IStorage {
  async getLoans(): Promise<LoanApplication[]> {
    return await db.select().from(loanApplications).orderBy(desc(loanApplications.createdAt));
  }

  async getLoan(id: number): Promise<LoanApplication | undefined> {
    const [loan] = await db.select().from(loanApplications).where(eq(loanApplications.id, id));
    return loan;
  }

  async createLoan(loan: InsertLoanApplication): Promise<LoanApplication> {
    const [newLoan] = await db.insert(loanApplications).values(loan).returning();
    return newLoan;
  }

  async updateLoan(id: number, updates: UpdateLoanApplicationRequest): Promise<LoanApplication> {
    const [updated] = await db.update(loanApplications)
      .set(updates)
      .where(eq(loanApplications.id, id))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
