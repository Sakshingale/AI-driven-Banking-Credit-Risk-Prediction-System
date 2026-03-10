import { useParams, Link } from "wouter";
import { useLoan, useAnalyzeLoan, useUpdateLoanStatus } from "@/hooks/use-loans";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ArrowLeft, BrainCircuit, CheckCircle2, XCircle, FileText, Activity } from "lucide-react";
import { useEffect, useState } from "react";

function RiskScoreCircle({ score }: { score: number }) {
  const [animatedScore, setAnimatedScore] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(score), 300);
    return () => clearTimeout(timer);
  }, [score]);

  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;
  
  const getColor = (s: number) => {
    if (s >= 70) return "stroke-rose-500";
    if (s >= 40) return "stroke-amber-500";
    return "stroke-emerald-500";
  };

  return (
    <div className="relative flex items-center justify-center w-40 h-40">
      <svg className="transform -rotate-90 w-40 h-40">
        {/* Background circle */}
        <circle
          cx="80" cy="80" r={radius}
          className="stroke-white/10" strokeWidth="12" fill="none"
        />
        {/* Progress circle */}
        <circle
          cx="80" cy="80" r={radius}
          className={`${getColor(score)} transition-all duration-1500 ease-out`}
          strokeWidth="12" fill="none"
          strokeLinecap="round"
          style={{ strokeDasharray: circumference, strokeDashoffset }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-4xl font-display font-bold">{animatedScore}</span>
        <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Score</span>
      </div>
    </div>
  );
}

export default function ApplicationDetails() {
  const { id } = useParams();
  const { data: loan, isLoading } = useLoan(Number(id));
  const analyzeLoan = useAnalyzeLoan();
  const updateStatus = useUpdateLoanStatus();

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!loan) {
    return <div className="text-center py-20 text-muted-foreground">Application not found</div>;
  }

  const DataRow = ({ label, value }: { label: string, value: React.ReactNode }) => (
    <div className="flex justify-between items-center py-3 border-b border-border/50 last:border-0">
      <span className="text-muted-foreground text-sm">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="flex items-center gap-4">
        <Link href="/" className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
          <ArrowLeft className="w-5 h-5 text-muted-foreground hover:text-white" />
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-display font-bold text-white">{loan.applicantName}</h1>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border
              ${loan.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                loan.status === 'Rejected' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 
                'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
              {loan.status}
            </span>
          </div>
          <p className="text-muted-foreground flex items-center gap-2 mt-1">
            <FileText className="w-4 h-4" /> Application #{loan.id.toString().padStart(5, '0')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Details */}
        <div className="space-y-8">
          <Card className="border-border/50 bg-card/40 backdrop-blur p-6 shadow-xl">
            <h3 className="text-lg font-display font-semibold mb-4 text-white">Financial Profile</h3>
            <div className="space-y-1">
              <DataRow label="Requested Amount" value={`$${loan.amount.toLocaleString()}`} />
              <DataRow label="Term" value={`${loan.termMonths} Months`} />
              <DataRow label="Annual Income" value={`$${loan.income.toLocaleString()}`} />
              <DataRow label="Employment" value={loan.employmentStatus} />
              <DataRow label="DTI Ratio" value={`${loan.debtToIncomeRatio}%`} />
              <DataRow label="Purpose" value={loan.purpose} />
            </div>
          </Card>

          {/* Action Panel */}
          {loan.status === "Pending" && (
            <Card className="border-border/50 bg-card/40 backdrop-blur p-6 shadow-xl flex flex-col gap-4">
              <h3 className="text-lg font-display font-semibold text-white">Final Decision</h3>
              <p className="text-sm text-muted-foreground mb-2">Review the AI analysis before making a final determination on this application.</p>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => updateStatus.mutate({ id: loan.id, status: "Approved" })}
                  disabled={updateStatus.isPending}
                  className="py-3 px-4 rounded-xl font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" /> Approve
                </button>
                <button 
                  onClick={() => updateStatus.mutate({ id: loan.id, status: "Rejected" })}
                  disabled={updateStatus.isPending}
                  className="py-3 px-4 rounded-xl font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <XCircle className="w-5 h-5" /> Reject
                </button>
              </div>
            </Card>
          )}
        </div>

        {/* Right Column: AI Analysis */}
        <div>
          <Card className="border-border/50 bg-gradient-to-b from-card/80 to-card/40 backdrop-blur p-8 shadow-xl h-full relative overflow-hidden">
            {/* Decorative background glow */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-center gap-3 mb-8 relative">
              <div className="p-2 rounded-lg bg-primary/20 text-primary">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-display font-bold text-white">Nexus Risk Engine</h3>
            </div>

            {loan.riskScore === null ? (
              <div className="flex flex-col items-center justify-center h-64 text-center space-y-6 relative">
                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                  <Activity className="w-8 h-8 text-muted-foreground opacity-50" />
                </div>
                <div className="max-w-xs">
                  <p className="text-muted-foreground text-sm mb-4">No analysis has been generated for this profile yet.</p>
                  <button
                    onClick={() => analyzeLoan.mutate(loan.id)}
                    disabled={analyzeLoan.isPending}
                    className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-primary to-cyan-500 text-white shadow-lg hover:shadow-primary/25 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:animate-pulse"
                  >
                    {analyzeLoan.isPending ? "Analyzing Data..." : "Run AI Analysis"}
                  </button>
                </div>
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative"
              >
                <div className="flex flex-col md:flex-row items-center gap-8 mb-8">
                  <RiskScoreCircle score={loan.riskScore} />
                  
                  <div className="flex-1 space-y-2 text-center md:text-left">
                    <p className="text-sm text-muted-foreground uppercase tracking-widest font-semibold">Risk Classification</p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border bg-background/50 backdrop-blur">
                      <div className={`w-3 h-3 rounded-full 
                        ${loan.riskLevel === 'Low' ? 'bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]' : 
                          loan.riskLevel === 'Medium' ? 'bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.8)]' : 
                          'bg-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.8)]'}`} 
                      />
                      <span className="text-xl font-display font-bold text-white">{loan.riskLevel} Risk</span>
                    </div>
                  </div>
                </div>

                <div className="bg-black/20 rounded-xl p-5 border border-white/5 relative">
                  <div className="absolute -top-3 left-4 px-2 bg-card text-xs font-semibold text-primary uppercase tracking-wider">
                    AI Summary
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    {loan.aiAnalysis}
                  </p>
                </div>
              </motion.div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
