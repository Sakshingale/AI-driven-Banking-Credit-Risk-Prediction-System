import { useState } from "react";
import { useLocation } from "wouter";
import { useCreateLoan } from "@/hooks/use-loans";
import { Card } from "@/components/ui/card";
import { z } from "zod";
import { Shield, ArrowRight, Loader2 } from "lucide-react";

// Use coercion to handle string inputs safely
const formSchema = z.object({
  applicantName: z.string().min(2, "Name is required"),
  amount: z.coerce.number().min(100, "Minimum amount is $100"),
  termMonths: z.coerce.number().min(1, "Minimum term is 1 month"),
  purpose: z.string().min(5, "Purpose is required"),
  income: z.coerce.number().min(1, "Income is required"),
  employmentStatus: z.string().min(1, "Employment status is required"),
  debtToIncomeRatio: z.coerce.number().min(0, "Ratio is required").max(100, "Must be under 100"),
});

type FormState = z.infer<typeof formSchema>;

export default function NewApplication() {
  const [, setLocation] = useLocation();
  const createLoan = useCreateLoan();
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    const parsed = formSchema.safeParse(data);
    if (!parsed.success) {
      const formErrors: any = {};
      parsed.error.errors.forEach((err) => {
        if (err.path[0]) formErrors[err.path[0]] = err.message;
      });
      setErrors(formErrors);
      return;
    }

    setErrors({});
    createLoan.mutate(parsed.data, {
      onSuccess: () => setLocation("/")
    });
  };

  const inputClasses = "w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all";
  const labelClasses = "block text-sm font-medium text-muted-foreground mb-2";

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-display text-gradient mb-2">Originate Loan</h1>
        <p className="text-muted-foreground">Submit a new application for AI risk evaluation.</p>
      </div>

      <Card className="border-border/50 bg-card/40 backdrop-blur p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="text-lg font-display font-medium border-b border-border/50 pb-2">Applicant Details</h3>
              
              <div>
                <label className={labelClasses}>Full Legal Name</label>
                <input name="applicantName" placeholder="John Doe" className={inputClasses} />
                {errors.applicantName && <p className="text-rose-400 text-sm mt-1">{errors.applicantName}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClasses}>Annual Income ($)</label>
                  <input name="income" type="number" placeholder="85000" className={inputClasses} />
                  {errors.income && <p className="text-rose-400 text-sm mt-1">{errors.income}</p>}
                </div>
                <div>
                  <label className={labelClasses}>DTI Ratio (%)</label>
                  <input name="debtToIncomeRatio" type="number" step="0.1" placeholder="32.5" className={inputClasses} />
                  {errors.debtToIncomeRatio && <p className="text-rose-400 text-sm mt-1">{errors.debtToIncomeRatio}</p>}
                </div>
              </div>

              <div>
                <label className={labelClasses}>Employment Status</label>
                <select name="employmentStatus" className={inputClasses} defaultValue="">
                  <option value="" disabled className="bg-card text-muted-foreground">Select Status...</option>
                  <option value="Employed" className="bg-card text-foreground">Employed Full-Time</option>
                  <option value="Self-employed" className="bg-card text-foreground">Self-Employed</option>
                  <option value="Unemployed" className="bg-card text-foreground">Unemployed / Other</option>
                </select>
                {errors.employmentStatus && <p className="text-rose-400 text-sm mt-1">{errors.employmentStatus}</p>}
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-display font-medium border-b border-border/50 pb-2">Loan Specifics</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClasses}>Loan Amount ($)</label>
                  <input name="amount" type="number" placeholder="25000" className={inputClasses} />
                  {errors.amount && <p className="text-rose-400 text-sm mt-1">{errors.amount}</p>}
                </div>
                <div>
                  <label className={labelClasses}>Term (Months)</label>
                  <input name="termMonths" type="number" placeholder="60" className={inputClasses} />
                  {errors.termMonths && <p className="text-rose-400 text-sm mt-1">{errors.termMonths}</p>}
                </div>
              </div>

              <div>
                <label className={labelClasses}>Purpose of Loan</label>
                <textarea 
                  name="purpose" 
                  rows={4} 
                  placeholder="Debt consolidation, Home improvement..." 
                  className={`${inputClasses} resize-none`} 
                />
                {errors.purpose && <p className="text-rose-400 text-sm mt-1">{errors.purpose}</p>}
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-border/50 flex items-center justify-between">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Shield className="w-5 h-5 text-primary" />
              <span className="text-sm">Data will be processed securely via Nexus Risk Engine</span>
            </div>
            <button
              type="submit"
              disabled={createLoan.isPending}
              className="px-8 py-3 rounded-xl font-semibold bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
            >
              {createLoan.isPending ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
              ) : (
                <>Submit Application <ArrowRight className="w-5 h-5" /></>
              )}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
