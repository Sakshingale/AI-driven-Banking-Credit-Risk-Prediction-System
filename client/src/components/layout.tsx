import { Link, useLocation } from "wouter";
import { LayoutDashboard, FileText, Activity, CreditCard, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/loans/new", label: "New Application", icon: FileText },
  ];

  return (
    <div className="min-h-screen flex bg-background/95">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border/50 glass-panel hidden md:flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-cyan-400 flex items-center justify-center shadow-lg shadow-primary/20">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gradient-primary">Nexus AI</h1>
          </div>
          <p className="mt-1 text-xs text-muted-foreground uppercase tracking-widest font-semibold">Risk Intelligence</p>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            
            return (
              <Link key={item.href} href={item.href} className="block">
                <div className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group
                  ${isActive 
                    ? "bg-primary/10 text-primary border border-primary/20 shadow-inner" 
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground border border-transparent"}
                `}>
                  <Icon className={`w-5 h-5 ${isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`} />
                  <span className="font-medium">{item.label}</span>
                  {isActive && (
                    <motion.div layoutId="active-indicator" className="ml-auto">
                      <ChevronRight className="w-4 h-4" />
                    </motion.div>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>
        
        <div className="p-6 border-t border-border/50">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/5">
            <CreditCard className="w-5 h-5 text-primary" />
            <div className="flex flex-col">
              <span className="text-sm font-medium">System Status</span>
              <span className="text-xs text-emerald-400 font-medium">Online & Secure</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <header className="h-16 glass-panel border-b border-border/50 flex items-center px-8 z-10 sticky top-0">
          <h2 className="text-sm font-medium text-muted-foreground">
            {location === "/" ? "Overview" : location.includes("/new") ? "Origination" : "Application Review"}
          </h2>
        </header>
        
        <div className="flex-1 overflow-auto p-4 md:p-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-7xl mx-auto h-full"
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
