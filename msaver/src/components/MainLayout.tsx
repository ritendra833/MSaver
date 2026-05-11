import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Wallet, 
  TrendingDown, 
  Target, 
  Package, 
  Bell, 
  User as UserIcon,
  LogOut,
  Menu,
  X,
  ChevronRight,
  TrendingUp,
  LayoutDashboard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'motion/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { auth, logout } from '@/src/lib/firebase';
import { useUser } from '@/src/hooks/useUser';

interface MainLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function MainLayout({ children, activeTab, setActiveTab }: MainLayoutProps) {
  const { user } = useUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'income', label: 'Income', icon: TrendingUp },
    { id: 'expenses', label: 'Expenses', icon: TrendingDown },
    { id: 'savings', label: 'Savings', icon: Target },
    { id: 'products', label: 'Price Track', icon: Package },
    { id: 'notifications', label: 'Alerts', icon: Bell },
    { id: 'profile', label: 'Account', icon: UserIcon },
  ];

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="flex h-screen bg-background-rich text-[#F0F0F0] overflow-hidden border-[16px] border-border-heavy">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-72 flex-col border-r border-white/10 bg-background-rich">
        <div className="p-8 border-b border-white/10">
          <div className="flex flex-col gap-1">
            <span className="accent-label text-[8px]">Financial Core / v1.0</span>
            <h1 className="text-4xl bold-heading text-white">M<span className="text-accent italic">SAVER</span></h1>
          </div>
        </div>

        <nav className="flex-1 px-2 py-8 space-y-1 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-6 py-4 transition-all duration-200 group relative ${
                activeTab === item.id 
                  ? 'bg-accent/5 text-accent' 
                  : 'text-slate-500 hover:text-white hover:bg-white/[0.02]'
              }`}
            >
              {activeTab === item.id && (
                <motion.div 
                  layoutId="active-indicator" 
                  className="absolute left-0 top-0 bottom-0 w-1 bg-accent" 
                />
              )}
              <item.icon className={`h-5 w-5 ${activeTab === item.id ? 'text-accent' : 'opacity-40 group-hover:opacity-100'}`} />
              <span className={`text-sm uppercase tracking-widest font-bold ${activeTab === item.id ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}`}>
                {item.label}
              </span>
              <div className="ml-auto opacity-0 group-hover:opacity-10 transition-opacity">
                <ChevronRight className="h-4 w-4" />
              </div>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full h-16 flex items-center justify-start gap-4 px-4 hover:bg-white/[0.02] transition-colors rounded-none">
                <div className="h-10 w-10 border border-white/20 bg-white/5 flex items-center justify-center font-mono font-bold text-accent">
                   {auth.currentUser?.displayName?.[0] || 'U'}
                </div>
                <div className="flex flex-col items-start overflow-hidden">
                  <span className="mono-label !opacity-100 !text-white text-xs">{auth.currentUser?.displayName || 'OPERATOR'}</span>
                  <span className="mono-label text-[9px] mt-1 line-clamp-1">{auth.currentUser?.email}</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64 bg-background-rich border-white/10 text-[#F0F0F0] rounded-none p-2">
              <DropdownMenuLabel className="mono-label px-2 py-2">System Access</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem onClick={() => setActiveTab('profile')} className="cursor-pointer py-3 hover:bg-white/5 rounded-none font-bold uppercase text-[10px] tracking-widest">
                <UserIcon className="mr-3 h-4 w-4 opacity-50" /> System Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="text-rose-500 cursor-pointer py-3 hover:bg-rose-500/10 rounded-none font-bold uppercase text-[10px] tracking-widest">
                <LogOut className="mr-3 h-4 w-4" /> Terminate Session
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none -z-10 overflow-hidden w-full h-full opacity-[0.02]">
           <span className="text-[250px] font-black text-white italic tracking-tighter uppercase whitespace-nowrap block rotate-[-12deg]">
             MSAVER SYSTEM TERMINAL
           </span>
        </div>

        {/* Header - Mobile */}
        <header className="lg:hidden h-20 flex items-center justify-between px-8 border-b border-white/10 bg-background-rich sticky top-0 z-50">
          <div className="flex flex-col gap-1">
            <span className="accent-label text-[8px]">Live</span>
            <h1 className="text-2xl bold-heading">MSAVER</h1>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)}>
            <Menu className="h-6 w-6" />
          </Button>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-background-rich">
          <div className="max-w-6xl mx-auto p-8 md:p-12">
             {children}
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
              />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed top-0 right-0 h-full w-[280px] bg-[#0c1324] border-l border-white/10 z-[70] lg:hidden flex flex-col"
              >
                <div className="p-6 flex items-center justify-between border-b border-white/10">
                  <span className="text-xl font-bold text-teal-400">Navigation</span>
                  <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                    <X className="h-6 w-6" />
                  </Button>
                </div>
                <div className="flex-1 p-4 space-y-2 overflow-y-auto">
                  {menuItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl transition-all duration-200 ${
                        activeTab === item.id 
                          ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' 
                          : 'text-slate-400'
                      }`}
                    >
                      <item.icon className="h-6 w-6" />
                      <span className="text-lg font-medium">{item.label}</span>
                    </button>
                  ))}
                </div>
                <div className="p-6 border-t border-white/10">
                   <Button variant="destructive" className="w-full py-6 rounded-xl text-lg gap-3" onClick={handleLogout}>
                     <LogOut className="h-5 w-5" /> Sign Out
                   </Button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
