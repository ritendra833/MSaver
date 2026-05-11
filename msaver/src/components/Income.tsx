import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, TrendingUp } from 'lucide-react';
import { api } from '@/src/lib/api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface IncomeProps {
  salaryRecords: any[];
}

export default function Income({ salaryRecords }: IncomeProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newIncome, setNewIncome] = useState({
    amount: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  const handleAdd = async () => {
    if (!newIncome.amount) return;
    try {
      await api.addForUser('salaryRecords', {
        amount: parseFloat(newIncome.amount),
        month: parseInt(newIncome.month.toString()),
        year: parseInt(newIncome.year.toString()),
      });
      setIsAddOpen(false);
      toast.success('Income recorded');
    } catch (error) {
      toast.error('Failed to record income');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Income</h2>
          <p className="text-muted-foreground">Log your monthly earnings and salary credits.</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
              <Plus className="h-4 w-4" /> Add Income
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#0c1324] border-white/10 text-white">
            <DialogHeader>
              <DialogTitle>Record New Income</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Amount (₹)</Label>
                <Input 
                  type="number" 
                  value={newIncome.amount}
                  onChange={e => setNewIncome({...newIncome, amount: e.target.value})}
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Month</Label>
                  <Input 
                    type="number" 
                    min="1" max="12"
                    value={newIncome.month}
                    onChange={e => setNewIncome({...newIncome, month: parseInt(e.target.value)})}
                    className="bg-white/5 border-white/10"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Year</Label>
                  <Input 
                    type="number" 
                    value={newIncome.year}
                    onChange={e => setNewIncome({...newIncome, year: parseInt(e.target.value)})}
                    className="bg-white/5 border-white/10"
                  />
                </div>
              </div>
              <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={handleAdd}>
                Save Income
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="glass-card">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10">
              <TableHead className="text-slate-400">Date Received</TableHead>
              <TableHead className="text-slate-400">Period</TableHead>
              <TableHead className="text-slate-400 text-right">Amount</TableHead>
              <TableHead className="text-slate-400 text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {salaryRecords.map((record) => (
              <TableRow key={record.id} className="border-white/10">
                <TableCell>{new Date(record.createdAt.seconds * 1000).toLocaleDateString()}</TableCell>
                <TableCell className="font-medium">{record.month}/{record.year}</TableCell>
                <TableCell className="text-right font-bold text-emerald-500">+₹{record.amount.toLocaleString()}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" className="hover:bg-rose-500/10 hover:text-rose-500" onClick={() => api.deleteForUser('salaryRecords', record.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
