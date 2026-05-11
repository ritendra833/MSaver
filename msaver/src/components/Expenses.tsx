import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Plus, 
  Trash2, 
  Search, 
  Filter,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { api } from '@/src/lib/api';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { toast } from 'sonner';

interface ExpensesProps {
  expenses: any[];
}

const CATEGORIES = [
  'Food & Drinks',
  'Rent & Bills',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Health',
  'Others'
];

export default function Expenses({ expenses }: ExpensesProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newExpense, setNewExpense] = useState({
    amount: '',
    category: 'Others',
    note: '',
    date: new Date().toISOString().split('T')[0]
  });

  const handleAdd = async () => {
    if (!newExpense.amount || !newExpense.category) {
      toast.error('Please fill all required fields');
      return;
    }
    try {
      await api.addForUser('expenses', {
        ...newExpense,
        amount: parseFloat(newExpense.amount),
        date: new Date(newExpense.date)
      });
      setIsAddOpen(false);
      toast.success('Expense added successfully');
      setNewExpense({
        amount: '',
        category: 'Others',
        note: '',
        date: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      toast.error('Failed to add expense');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteForUser('expenses', id);
      toast.success('Expense deleted');
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Expenses</h2>
          <p className="text-muted-foreground">Track and manage your spending habits.</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-teal-600 hover:bg-teal-700 gap-2">
              <Plus className="h-4 w-4" /> Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#0c1324] border-white/10 text-white">
            <DialogHeader>
              <DialogTitle>Add New Expense</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₹)</Label>
                <Input 
                  id="amount" 
                  type="number" 
                  placeholder="0.00" 
                  value={newExpense.amount}
                  onChange={e => setNewExpense({...newExpense, amount: e.target.value})}
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={newExpense.category} onValueChange={v => setNewExpense({...newExpense, category: v})}>
                  <SelectTrigger className="bg-white/5 border-white/10">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0c1324] border-white/10 text-white">
                    {CATEGORIES.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input 
                  id="date" 
                  type="date" 
                  value={newExpense.date}
                  onChange={e => setNewExpense({...newExpense, date: e.target.value})}
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="note">Note (Optional)</Label>
                <Input 
                  id="note" 
                  placeholder="What was this for?" 
                  value={newExpense.note}
                  onChange={e => setNewExpense({...newExpense, note: e.target.value})}
                  className="bg-white/5 border-white/10"
                />
              </div>
              <Button className="w-full bg-teal-600 hover:bg-teal-700" onClick={handleAdd}>
                Save Expense
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="glass-card">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-white/5">
              <TableHead className="text-slate-400">Date</TableHead>
              <TableHead className="text-slate-400">Category</TableHead>
              <TableHead className="text-slate-400">Note</TableHead>
              <TableHead className="text-slate-400 text-right">Amount</TableHead>
              <TableHead className="text-slate-400 text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.length === 0 ? (
               <TableRow>
                 <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                   No expenses recorded yet.
                 </TableCell>
               </TableRow>
            ) : (
              expenses.map((expense) => (
                <TableRow key={expense.id} className="border-white/10 hover:bg-white/5">
                  <TableCell className="font-medium">
                    {new Date(expense.date.seconds * 1000).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-teal-500/10 text-teal-500 border-teal-500/20">
                      {expense.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-400 max-w-[200px] truncate">{expense.note || '-'}</TableCell>
                  <TableCell className="text-right font-bold text-rose-500">-₹{expense.amount.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="hover:bg-rose-500/10 hover:text-rose-500" onClick={() => handleDelete(expense.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
