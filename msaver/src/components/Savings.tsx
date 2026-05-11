import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Target, CheckCircle2 } from 'lucide-react';
import { api } from '@/src/lib/api';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { motion } from 'motion/react';

interface SavingsProps {
  savingsGoals: any[];
}

export default function Savings({ savingsGoals }: SavingsProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    targetAmount: '',
    currentAmount: '0',
    deadline: '',
  });

  const handleAdd = async () => {
    if (!newGoal.title || !newGoal.targetAmount) return;
    try {
      await api.addForUser('savingsGoals', {
        ...newGoal,
        targetAmount: parseFloat(newGoal.targetAmount),
        currentAmount: parseFloat(newGoal.currentAmount || '0'),
        deadline: newGoal.deadline ? new Date(newGoal.deadline) : null,
      });
      setIsAddOpen(false);
      toast.success('Savings goal set');
    } catch (error) {
      toast.error('Failed to set goal');
    }
  };

  const handleUpdateAmount = async (id: string, current: number, increment: number) => {
    try {
      await api.updateForUser('savingsGoals', id, { currentAmount: current + increment });
      toast.success('Progress updated');
    } catch (error) {
      toast.error('Update failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Savings Goals</h2>
          <p className="text-muted-foreground">What are you saving for? Plan your future purchases.</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-amber-600 hover:bg-amber-700 gap-2">
              <Plus className="h-4 w-4" /> New Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#0c1324] border-white/10 text-white">
            <DialogHeader>
              <DialogTitle>Create Savings Goal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>What is this for?</Label>
                <Input placeholder="e.g. New Laptop, Emergency Fund" value={newGoal.title} onChange={e => setNewGoal({...newGoal, title: e.target.value})} className="bg-white/5 border-white/10" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Target (₹)</Label>
                  <Input type="number" value={newGoal.targetAmount} onChange={e => setNewGoal({...newGoal, targetAmount: e.target.value})} className="bg-white/5 border-white/10" />
                </div>
                <div className="space-y-2">
                  <Label>Initial Saving (₹)</Label>
                  <Input type="number" value={newGoal.currentAmount} onChange={e => setNewGoal({...newGoal, currentAmount: e.target.value})} className="bg-white/5 border-white/10" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Target Date (Optional)</Label>
                <Input type="date" value={newGoal.deadline} onChange={e => setNewGoal({...newGoal, deadline: e.target.value})} className="bg-white/5 border-white/10" />
              </div>
              <Button className="w-full bg-amber-600 hover:bg-amber-700" onClick={handleAdd}>
                Create Goal
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {savingsGoals.map((goal) => {
          const progress = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
          const isCompleted = progress >= 100;

          return (
            <motion.div key={goal.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <Card className={`glass-card relative overflow-hidden ${isCompleted ? 'border-emerald-500/50' : ''}`}>
                {isCompleted && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-xl">{goal.title}</CardTitle>
                  <CardDescription>Target: ₹{goal.targetAmount.toLocaleString()}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Progress</span>
                      <span className="font-bold text-teal-400">{progress.toFixed(0)}%</span>
                    </div>
                    <Progress value={progress} className="h-2 bg-white/5" />
                    <p className="text-xs text-slate-500 font-medium">₹{goal.currentAmount.toLocaleString()} saved</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleUpdateAmount(goal.id, goal.currentAmount, 500)} className="bg-white/5 border-white/10">
                      +₹500
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleUpdateAmount(goal.id, goal.currentAmount, 1000)} className="bg-white/5 border-white/10">
                      +₹1000
                    </Button>
                  </div>

                  <Button variant="ghost" size="sm" className="w-full text-rose-500 hover:bg-rose-500/10" onClick={() => api.deleteForUser('savingsGoals', goal.id)}>
                    <Trash2 className="h-4 w-4 mr-2" /> Remove Goal
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
        {savingsGoals.length === 0 && (
          <div className="col-span-full h-48 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-2xl text-muted-foreground">
             <Target className="h-8 w-8 mb-2 opacity-20" />
             <p>No savings goals yet. Start small, dream big!</p>
          </div>
        )}
      </div>
    </div>
  );
}
