import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Target, 
  AlertCircle,
  Lightbulb,
  Sparkles
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { motion } from 'motion/react';
import { Badge } from '@/components/ui/badge';
import { getFinancialAdvice } from '@/src/lib/gemini';
import { toast } from 'sonner';

interface DashboardProps {
  expenses: any[];
  salaryRecords: any[];
  savingsGoals: any[];
  user: any;
}

export default function Dashboard({ expenses, salaryRecords, savingsGoals, user }: DashboardProps) {
  const [aiInsights, setAiInsights] = useState<any[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const stats = useMemo(() => {
    const totalIncome = salaryRecords.reduce((acc, curr) => acc + curr.amount, 0);
    const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    const balance = totalIncome - totalExpenses;
    
    const categoryData: Record<string, number> = {};
    expenses.forEach(e => {
      categoryData[e.category] = (categoryData[e.category] || 0) + e.amount;
    });
    
    const pieData = Object.entries(categoryData).map(([name, value]) => ({ name, value }));
    const monthlyData = salaryRecords.slice(0, 6).map(s => {
      const exp = expenses.filter(e => {
        const d = new Date(e.date?.seconds * 1000 || e.date);
        return d.getMonth() === s.month - 1 && d.getFullYear() === s.year;
      }).reduce((acc, curr) => acc + curr.amount, 0);
      return {
        month: s.month,
        income: s.amount,
        expense: exp
      };
    }).reverse();

    return { totalIncome, totalExpenses, balance, pieData, monthlyData };
  }, [expenses, salaryRecords]);

  const handleGetAiAdvice = async () => {
    if (isAiLoading) return;
    setIsAiLoading(true);
    try {
      const advice = await getFinancialAdvice({
        user,
        expensesTotal: stats.totalExpenses,
        savingsCount: savingsGoals.length,
        recentExpenses: expenses.slice(0, 5).map(e => ({ amount: e.amount, category: e.category }))
      });
      setAiInsights(advice);
      toast.success("AI Analysis Complete");
    } catch (error) {
      toast.error("Failed to fetch AI insights");
    } finally {
      setIsAiLoading(false);
    }
  };

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <span className="accent-label">System Overview</span>
          <h2 className="text-5xl bold-heading">Dashboard</h2>
        </div>
        <div className="text-right hidden md:block">
           <span className="mono-label">Sync Status</span>
           <div className="flex items-center gap-2 text-[#00FF41]">
             <div className="h-2 w-2 rounded-full bg-[#00FF41] animate-pulse" />
             <span className="text-xs font-bold uppercase tracking-widest">Live Terminal</span>
           </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="glass-card border-none hover:bg-white/[0.05] transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <span className="mono-label">Total Balance</span>
              <Wallet className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl bold-heading">₹{stats.balance.toLocaleString()}</div>
              <p className="mono-label !opacity-30 mt-2">Active Capital</p>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="glass-card border-none hover:bg-white/[0.05] transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <span className="mono-label">Gross Income</span>
              <TrendingUp className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl bold-heading">₹{stats.totalIncome.toLocaleString()}</div>
              <p className="mono-label !opacity-30 mt-2">Revenue Total</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="glass-card border-none hover:bg-white/[0.05] transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <span className="mono-label">Expenditure</span>
              <TrendingDown className="h-4 w-4 text-rose-500" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl bold-heading">₹{stats.totalExpenses.toLocaleString()}</div>
              <p className="mono-label !opacity-30 mt-2">Resource Leakage</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="glass-card border-none hover:bg-white/[0.05] transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <span className="mono-label">Targets</span>
              <Target className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl bold-heading">{savingsGoals.length}</div>
              <p className="mono-label !opacity-30 mt-2">Deployment Goals</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card className="glass-card p-4">
          <CardHeader className="px-0">
             <span className="accent-label text-[10px]">Analytics / 01</span>
             <CardTitle className="text-2xl bold-heading mt-1">Income Propagation</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] px-0 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#4a4a4a', fontSize: 10, fontWeight: 'bold' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#4a4a4a', fontSize: 10, fontWeight: 'bold' }} tickFormatter={(value) => `₹${value/1000}k`} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  contentStyle={{ background: '#0A0A0A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0' }}
                />
                <Bar dataKey="income" fill="#00FF41" radius={0} name="Income" />
                <Bar dataKey="expense" fill="rgba(255,255,255,0.1)" radius={0} name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-card p-4">
          <CardHeader className="px-0">
             <span className="accent-label text-[10px]">Allocation / 02</span>
             <CardTitle className="text-2xl bold-heading mt-1">Resource Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] px-0 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {stats.pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#00FF41' : `rgba(255,255,255,${0.1 + (index * 0.1)})`} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#0A0A0A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card bg-accent/[0.02] border-accent/20 p-6">
        <CardHeader className="px-0 flex flex-row items-center gap-4">
          <div className="h-12 w-12 bg-accent/10 border border-accent/20 flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-accent" />
          </div>
          <div>
            <span className="accent-label">Heuristic Engine</span>
            <CardTitle className="text-2xl bold-heading mt-1">MSAVER Core Intelligence</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="px-0 mt-6">
          <div className="space-y-6">
            {aiInsights.length === 0 ? (
              <div className="border border-white/10 p-6 flex items-center gap-6">
                <Lightbulb className="h-8 w-8 text-accent opacity-40" />
                <div>
                   <p className="font-bold uppercase tracking-widest text-sm">System Ready for Analysis</p>
                   <p className="mono-label mt-1">Initiate intelligence sweep of current financial state.</p>
                </div>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {aiInsights.map((insight, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex flex-col gap-3 p-5 border border-white/10 bg-white/[0.02]"
                  >
                    <div className="flex justify-between items-center">
                       <span className={`text-[10px] font-bold uppercase tracking-[0.2em] px-2 py-1 ${insight.type === 'warning' ? 'bg-rose-500/20 text-rose-500' : 'bg-accent/20 text-accent'}`}>
                         {insight.type === 'warning' ? 'CRITICAL' : 'OPTIMAL'}
                       </span>
                       <span className="mono-label">Insight {idx + 1}</span>
                    </div>
                    <p className="text-lg bold-heading">{insight.title}</p>
                    <p className="text-sm text-slate-500 uppercase tracking-tight leading-relaxed">{insight.message}</p>
                  </motion.div>
                ))}
              </div>
            )}
            
            <Button 
              className="w-full h-16 bg-accent text-black hover:bg-white transition-colors rounded-none font-black uppercase text-sm tracking-[0.2em] gap-3"
              onClick={handleGetAiAdvice}
              disabled={isAiLoading}
            >
              {isAiLoading ? (
                 <div className="h-5 w-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <Sparkles className="h-5 w-5" />
              )}
              {isAiLoading ? 'Synthesizing...' : 'Execute Analysis'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
