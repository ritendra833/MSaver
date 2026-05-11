import React from 'react';
import { Button } from '@/components/ui/button';
import { Wallet, Sparkles, TrendingUp, Target, ShieldCheck } from 'lucide-react';
import { signInWithGoogle } from '@/src/lib/firebase';
import { motion } from 'motion/react';

export default function LoginScreen() {
  const handleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Login failed', error);
    }
  };

  return (
    <div className="min-h-screen bg-background-rich flex flex-col items-center justify-center relative overflow-hidden px-6 border-[16px] border-border-heavy">
      {/* Structural Patterns */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[1px] bg-white/5" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-full w-[1px] bg-white/5" />
      
      <div className="absolute -left-24 top-1/4 rotate-90">
        <span className="text-[120px] font-black text-white/[0.02] tracking-tighter uppercase whitespace-nowrap">AUTHENTICATION</span>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full text-center space-y-12 z-10"
      >
        <div className="space-y-2">
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="accent-label text-xs"
          >
            System Status: Standby
          </motion.span>
          <h1 className="text-[100px] md:text-[140px] bold-heading text-white">
            M<span className="text-white/20">SAVER</span>
          </h1>
          <p className="mono-label text-sm tracking-[0.5em] mt-[-10px]">Financial Intelligence Terminal</p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center text-left py-12 border-y border-white/10">
          <div className="space-y-6">
            <h2 className="text-3xl font-black italic tracking-tighter uppercase text-white leading-none">
              Deploy Your <br/><span className="text-accent underline decoration-4 underline-offset-4">Wealth Strategy</span>
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed max-w-xs uppercase tracking-tight">
              Real-time asset tracking, AI-powered price analysis, and automated budget enforcement.
            </p>
          </div>

          <div className="space-y-6">
             <div className="flex items-center gap-4">
               <div className="h-10 w-10 bg-white/5 border border-white/10 flex items-center justify-center text-accent">
                 <ShieldCheck className="h-5 w-5" />
               </div>
               <div>
                  <span className="mono-label !opacity-100 !text-white">Secure Access</span>
                  <p className="text-[10px] text-slate-500 uppercase">Google Identity Verified</p>
               </div>
             </div>

             <Button 
               onClick={handleLogin}
               className="w-full h-16 bg-white text-black hover:bg-accent transition-colors rounded-none font-black uppercase text-sm tracking-[0.2em] gap-3"
             >
               Initialize Session
             </Button>
          </div>
        </div>

        <div className="flex justify-between items-center px-4">
           <span className="mono-label">Version 4.0.2S</span>
           <span className="mono-label">© 2026 MSAVER CORP</span>
        </div>
      </motion.div>
    </div>
  );
}
