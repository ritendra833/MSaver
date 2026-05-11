import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Mail, Phone, Calendar, Banknote, Save, CreditCard } from 'lucide-react';
import { api } from '@/src/lib/api';
import { auth, db } from '@/src/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ProfileProps {
  user: any;
}

export default function Profile({ user }: ProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    salary: user?.salary || 0,
    salaryDay: user?.salaryDay || 1,
    currency: user?.currency || 'INR'
  });

  const handleSave = async () => {
    if (!auth.currentUser) return;
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        ...formData,
        salary: parseFloat(formData.salary.toString()),
        salaryDay: parseInt(formData.salaryDay.toString())
      });
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-6 mb-8">
        <Avatar className="h-24 w-24 border-4 border-teal-500/20">
          <AvatarImage src={user.photoURL} />
          <AvatarFallback className="text-2xl bg-teal-500/20 text-teal-400">{user.name?.[0]}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-3xl font-bold">{user.name}</h2>
          <p className="text-slate-400">{user.email}</p>
          <div className="flex gap-2 mt-2">
            <Badge className="bg-teal-500/10 text-teal-400 border-teal-500/20">Pro Member</Badge>
            <Badge variant="outline" className="text-slate-500 border-white/10">Joined {new Date(user.createdAt.seconds * 1000).toLocaleDateString()}</Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-teal-400" /> Personal Identity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input 
                disabled={!isEditing} 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="bg-white/5 border-white/10 disabled:opacity-50" 
              />
            </div>
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input disabled value={user.email} className="bg-white/5 border-white/10 opacity-50" />
            </div>
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input 
                disabled={!isEditing} 
                placeholder="+91..." 
                value={formData.phone} 
                onChange={e => setFormData({...formData, phone: e.target.value})}
                className="bg-white/5 border-white/10 disabled:opacity-50" 
              />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-teal-400" /> Financial Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Base Monthly Salary (₹)</Label>
              <Input 
                disabled={!isEditing} 
                type="number" 
                value={formData.salary} 
                onChange={e => setFormData({...formData, salary: e.target.value})}
                className="bg-white/5 border-white/10 disabled:opacity-50" 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Salary Credit Day</Label>
                <Input 
                  disabled={!isEditing} 
                  type="number" 
                  min="1" max="31" 
                  value={formData.salaryDay} 
                  onChange={e => setFormData({...formData, salaryDay: e.target.value})}
                  className="bg-white/5 border-white/10 disabled:opacity-50" 
                />
              </div>
              <div className="space-y-2">
                <Label>Currency</Label>
                <Select disabled={!isEditing} value={formData.currency} onValueChange={v => setFormData({...formData, currency: v})}>
                  <SelectTrigger className="bg-white/5 border-white/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0c1324] border-white/10 text-white">
                    <SelectItem value="INR">INR (₹)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end pt-4">
        {isEditing ? (
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
            <Button className="bg-teal-600 hover:bg-teal-700 gap-2" onClick={handleSave}>
              <Save className="h-4 w-4" /> Save Changes
            </Button>
          </div>
        ) : (
          <Button variant="secondary" onClick={() => setIsEditing(true)}>Edit Profile</Button>
        )}
      </div>
    </div>
  );
}
