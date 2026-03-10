import { useLoans } from "@/hooks/use-loans";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import { ArrowRight, AlertTriangle, ShieldCheck, Activity, Users } from "lucide-react";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { data: loans, isLoading } = useLoans();

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const apps = loans || [];
  const totalApps = apps.length;
  const analyzedApps = apps.filter(a => a.riskScore !== null);
  const avgRisk = analyzedApps.length 
    ? Math.round(analyzedApps.reduce((acc, curr) => acc + (curr.riskScore || 0), 0) / analyzedApps.length) 
    : 0;
  const highRiskCount = apps.filter(a => a.riskLevel === "High").length;

  const stats = [
    { label: "Total Applications", value: totalApps, icon: Users, color: "text-blue-400", bg: "bg-blue-400/10" },
    { label: "Avg. Risk Score", value: avgRisk, icon: Activity, color: "text-indigo-400", bg: "bg-indigo-400/10" },
    { label: "High Risk Alerts", value: highRiskCount, icon: AlertTriangle, color: "text-rose-400", bg: "bg-rose-400/10" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display text-gradient mb-2">Intelligence Dashboard</h1>
        <p className="text-muted-foreground">Monitor and assess real-time credit risk analytics.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="p-6 border-border/50 bg-card/40 backdrop-blur hover:bg-card/60 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-2xl ${stat.bg}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <h3 className="text-3xl font-display font-bold text-foreground mt-1">{stat.value}</h3>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Table Section */}
      <Card className="border-border/50 bg-card/40 backdrop-blur overflow-hidden">
        <div className="p-6 border-b border-border/50 flex justify-between items-center">
          <h2 className="text-xl font-display font-semibold">Recent Applications</h2>
          <Link href="/loans/new" className="text-sm text-primary hover:text-primary/80 flex items-center gap-1 font-medium transition-colors">
            New Application <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/5">
              <tr className="text-left text-xs font-semibold text-muted-foreground tracking-wider uppercase">
                <th className="px-6 py-4">Applicant</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Term</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">AI Risk Level</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {apps.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    No applications found.
                  </td>
                </tr>
              ) : (
                apps.map((loan) => (
                  <tr key={loan.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">{loan.applicantName}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{loan.employmentStatus}</div>
                    </td>
                    <td className="px-6 py-4 font-mono">${loan.amount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-muted-foreground">{loan.termMonths} mos</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border
                        ${loan.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                          loan.status === 'Rejected' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 
                          'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                        {loan.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {loan.riskLevel ? (
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full 
                            ${loan.riskLevel === 'Low' ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]' : 
                              loan.riskLevel === 'Medium' ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]' : 
                              'bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.6)]'}`} 
                          />
                          <span className="text-sm font-medium">{loan.riskLevel}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground italic">Pending Analysis</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        href={`/loans/${loan.id}`}
                        className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium bg-white/5 hover:bg-white/10 text-white transition-all opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0"
                      >
                        Review
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
