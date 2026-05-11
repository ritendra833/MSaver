import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Bell, Info, AlertTriangle, CheckCircle, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { api } from '@/src/lib/api';
import { toast } from 'sonner';

interface NotificationsProps {
  notifications: any[];
}

export default function Notifications({ notifications }: NotificationsProps) {
  const handleDelete = async (id: string) => {
    try {
      await api.deleteForUser('notifications', id);
      toast.success('Signal purged');
    } catch (error) {
      toast.error('Failed to purge signal');
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <span className="accent-label">Signal Interface</span>
        <h2 className="text-5xl bold-heading">Alerts</h2>
      </div>

      <div className="space-y-4">
        {notifications.map((notif, idx) => (
          <motion.div
            key={notif.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card className="glass-card border-none hover:bg-white/[0.05] transition-colors overflow-hidden group">
              <CardContent className="p-6 flex items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                   <div className={`h-12 w-12 flex items-center justify-center border ${
                     notif.type === 'warning' ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' : 
                     notif.type === 'success' ? 'bg-accent/10 border-accent/20 text-accent' : 
                     'bg-white/5 border-white/10 text-white'
                   }`}>
                     {notif.type === 'warning' ? <AlertTriangle className="h-6 w-6" /> : 
                      notif.type === 'success' ? <CheckCircle className="h-6 w-6" /> : 
                      <Info className="h-6 w-6" />}
                   </div>
                   <div className="flex-1">
                     <div className="flex items-center gap-3">
                       <span className="mono-label !opacity-100 !text-white text-[10px]">{notif.title}</span>
                       <span className="mono-label text-[8px] opacity-40">{notif.createdAt?.seconds ? new Date(notif.createdAt.seconds * 1000).toLocaleString() : 'RECENT SIGNAL'}</span>
                     </div>
                     <p className="bold-heading text-lg mt-1">{notif.message}</p>
                   </div>
                </div>
                <button 
                  onClick={() => handleDelete(notif.id)}
                  className="p-3 bg-white/5 hover:bg-rose-500/20 text-white/40 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {notifications.length === 0 && (
          <div className="h-80 flex flex-col items-center justify-center border border-dashed border-white/10 relative overflow-hidden">
             <div className="absolute inset-0 opacity-[0.02] pointer-events-none select-none">
                <span className="text-[200px] font-black italic uppercase block text-center mt-20">SILENCE</span>
             </div>
             <Bell className="h-10 w-10 mb-6 text-accent opacity-20" />
             <span className="accent-label text-[10px] mb-2">Status: Silent</span>
             <p className="mono-label">Signal silence maintained.</p>
             <p className="text-xs text-slate-500 mt-4 uppercase tracking-tighter">No active alerts at this coordinate.</p>
          </div>
        )}
      </div>
    </div>
  );
}

