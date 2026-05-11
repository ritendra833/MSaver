import React, { useState, useEffect } from 'react';
import { useUser } from './hooks/useUser';
import MainLayout from './components/MainLayout';
import Dashboard from './components/Dashboard';
import Expenses from './components/Expenses';
import Income from './components/Income';
import Savings from './components/Savings';
import Products from './components/Products';
import Profile from './components/Profile';
import Notifications from './components/Notifications';
import LoginScreen from './components/LoginScreen';
import { Toaster } from '@/components/ui/sonner';
import { api } from './lib/api';

export default function App() {
  const { user, loading } = useUser();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // App State
  const [expenses, setExpenses] = useState<any[]>([]);
  const [salaryRecords, setSalaryRecords] = useState<any[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      // Set up real-time subscriptions
      const unsubExpenses = api.subscribeToUserCollection('expenses', setExpenses);
      const unsubSalary = api.subscribeToUserCollection('salaryRecords', setSalaryRecords);
      const unsubSavings = api.subscribeToUserCollection('savingsGoals', setSavingsGoals);
      const unsubProducts = api.subscribeToUserCollection('products', setProducts);
      const unsubNotifications = api.subscribeToUserCollection('notifications', setNotifications);

      return () => {
        unsubExpenses();
        unsubSalary();
        unsubSavings();
        unsubProducts();
        unsubNotifications();
      };
    }
  }, [user]);

  if (loading) {
    return (
      <div className="h-screen bg-background-rich flex flex-col items-center justify-center border-[16px] border-border-heavy">
        <div className="flex flex-col items-center gap-6">
          <div className="h-16 w-16 border-4 border-white/5 border-t-accent rounded-none animate-spin" />
          <div className="text-center space-y-1">
             <span className="accent-label animate-pulse">Initializing Terminal</span>
             <h1 className="text-4xl bold-heading text-white">M<span className="text-white/20">SAVER</span></h1>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <LoginScreen />
        <Toaster position="top-center" richColors />
      </>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard expenses={expenses} salaryRecords={salaryRecords} savingsGoals={savingsGoals} user={user} />;
      case 'income':
        return <Income salaryRecords={salaryRecords} />;
      case 'expenses':
        return <Expenses expenses={expenses} />;
      case 'savings':
        return <Savings savingsGoals={savingsGoals} />;
      case 'products':
        return <Products products={products} />;
      case 'notifications':
        return <Notifications notifications={notifications} />;
      case 'profile':
        return <Profile user={user} />;
      default:
        return <Dashboard expenses={expenses} salaryRecords={salaryRecords} savingsGoals={savingsGoals} user={user} />;
    }
  };

  return (
    <MainLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
      <Toaster position="top-right" richColors />
    </MainLayout>
  );
}
