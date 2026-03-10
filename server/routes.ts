import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

async function seedDatabase() {
  const existingItems = await storage.getLoans();
  if (existingItems.length === 0) {
    await storage.createLoan({
      applicantName: "Amjad Masad",
      amount: 500000,
      termMonths: 60,
      purpose: "Startup Expansion",
      income: 150000,
      employmentStatus: "Employed",
      debtToIncomeRatio: "0.25",
    });
    
    await storage.createLoan({
      applicantName: "Alice Smith",
      amount: 15000,
      termMonths: 24,
      purpose: "Debt Consolidation",
      income: 55000,
      employmentStatus: "Employed",
      debtToIncomeRatio: "0.45",
    });
    
    await storage.createLoan({
      applicantName: "Robert Johnson",
      amount: 250000,
      termMonths: 360,
      purpose: "Real Estate",
      income: 85000,
      employmentStatus: "Self-employed",
      debtToIncomeRatio: "0.55",
    });
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get(api.loans.list.path, async (req, res) => {
    const loans = await storage.getLoans();
    res.json(loans);
  });

  app.get(api.loans.get.path, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(404).json({ message: "Invalid ID" });
    const loan = await storage.getLoan(id);
    if (!loan) return res.status(404).json({ message: "Loan not found" });
    res.json(loan);
  });

  app.post(api.loans.create.path, async (req, res) => {
    try {
      // Coerce string fields that should be numbers
      const bodySchema = api.loans.create.input.extend({
        amount: z.coerce.number(),
        termMonths: z.coerce.number(),
        income: z.coerce.number(),
      });
      const input = bodySchema.parse(req.body);
      const loan = await storage.createLoan(input);
      res.status(201).json(loan);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch(api.loans.updateStatus.path, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(404).json({ message: "Invalid ID" });
      const input = api.loans.updateStatus.input.parse(req.body);
      const loan = await storage.updateLoan(id, { status: input.status });
      if (!loan) return res.status(404).json({ message: "Loan not found" });
      res.json(loan);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(api.loans.analyze.path, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(404).json({ message: "Invalid ID" });
      const loan = await storage.getLoan(id);
      if (!loan) return res.status(404).json({ message: "Loan not found" });

      const prompt = `Analyze the following loan application and provide a risk assessment.
Applicant Name: ${loan.applicantName}
Amount: $${loan.amount}
Term: ${loan.termMonths} months
Purpose: ${loan.purpose}
Income: $${loan.income}
Employment Status: ${loan.employmentStatus}
Debt-to-Income Ratio: ${loan.debtToIncomeRatio}

Respond in JSON format with exactly these fields:
- riskScore: a number from 0 to 100 (where 100 is highest risk)
- riskLevel: exactly one of "Low", "Medium", or "High"
- aiAnalysis: a short 2-3 sentence paragraph explaining the reasoning.`;

      const response = await openai.chat.completions.create({
        model: "gpt-5.1",
        messages: [{ role: "system", content: "You are a banking risk analysis AI." }, { role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });

      const analysis = JSON.parse(response.choices[0].message?.content || "{}");
      
      const updatedLoan = await storage.updateLoan(id, {
        riskScore: analysis.riskScore,
        riskLevel: analysis.riskLevel,
        aiAnalysis: analysis.aiAnalysis,
      });

      res.json(updatedLoan);
    } catch (error) {
      console.error("AI Analysis error:", error);
      res.status(500).json({ message: "Failed to run AI analysis" });
    }
  });

  seedDatabase().catch(console.error);

  return httpServer;
}
