import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Search, ExternalLink, Sparkles, TrendingDown, Clock, Globe } from 'lucide-react';
import { api } from '@/src/lib/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { Badge } from '@/components/ui/badge';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

interface ProductsProps {
  products: any[];
}

export default function Products({ products }: ProductsProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isComparing, setIsComparing] = useState<string | null>(null);
  const [comparisonResults, setComparisonResults] = useState<any[]>([]);
  const [newProduct, setNewProduct] = useState({
    name: '',
    currentPrice: '',
    url: '',
  });

  const handleAdd = async () => {
    if (!newProduct.name || !newProduct.currentPrice) return;
    try {
      await api.addForUser('products', {
        ...newProduct,
        currentPrice: parseFloat(newProduct.currentPrice),
        lastCheckedAt: new Date()
      });
      setIsAddOpen(false);
      toast.success('Product added to watch list');
      setNewProduct({ name: '', currentPrice: '', url: '' });
    } catch (error) {
      toast.error('Failed to add product');
    }
  };

  const handleCompare = async (product: any) => {
    setIsComparing(product.id);
    setComparisonResults([]);
    try {
      toast.info(`AI is searching for best prices for ${product.name}...`);
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Find the 3 best current prices for "${product.name}" from major Indian online stores like Amazon.in, Flipkart, Reliance Digital, or Croma.
                   Return the results as a JSON array of objects: [{ "store": "...", "price": number, "url": "..." }]`,
        config: {
          tools: [{ googleSearch: {} }]
        }
      });
      
      const text = response.text || '';
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      const prices = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
      
      if (prices.length > 0) {
        setComparisonResults(prices);
        toast.success('AI Price Search completed!');
      } else {
        toast.warning('No better prices found at the moment.');
      }
    } catch (error) {
      console.error(error);
      toast.error('AI Price Search failed. Please try again later.');
    } finally {
      setIsComparing(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div className="space-y-1">
          <span className="accent-label">Deal Sentinel</span>
          <h2 className="text-5xl bold-heading">Price Watch</h2>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-accent text-black hover:bg-white gap-3 rounded-none font-black uppercase text-xs tracking-widest h-12 px-6 transition-colors">
              <Plus className="h-4 w-4" /> Add Asset
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-background-rich border-white/10 text-[#F0F0F0] rounded-none">
            <DialogHeader>
              <DialogTitle className="text-2xl bold-heading">Track New Asset</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-6">
              <div className="space-y-2">
                <Label className="mono-label">Asset Name</Label>
                <Input placeholder="e.g. Sony WH-1000XM5" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="bg-white/5 border-white/10 rounded-none h-12" />
              </div>
              <div className="space-y-2">
                <Label className="mono-label">Target Price (₹)</Label>
                <Input type="number" placeholder="0.00" value={newProduct.currentPrice} onChange={e => setNewProduct({...newProduct, currentPrice: e.target.value})} className="bg-white/5 border-white/10 rounded-none h-12" />
              </div>
              <div className="space-y-2">
                <Label className="mono-label">Vendor URL (Optional)</Label>
                <Input placeholder="https://..." value={newProduct.url} onChange={e => setNewProduct({...newProduct, url: e.target.value})} className="bg-white/5 border-white/10 rounded-none h-12" />
              </div>
              <Button className="w-full h-14 bg-accent text-black hover:bg-white font-black uppercase tracking-widest rounded-none" onClick={handleAdd}>
                Initialize Tracking
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-8">
        {products.map((product) => (
          <Card key={product.id} className="glass-card overflow-hidden group border-none">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="flex-1 space-y-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="accent-label text-[8px] bg-accent/10 px-2 py-0.5">Tracking Active</span>
                      <span className="mono-label">ID: {product.id.slice(-6).toUpperCase()}</span>
                    </div>
                    <h3 className="text-3xl bold-heading">{product.name}</h3>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 opacity-40" />
                      <span className="mono-label tracking-normal">Checked: {product.lastCheckedAt ? new Date(product.lastCheckedAt.seconds * 1000).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    {product.url && (
                      <a href={product.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-accent hover:underline decoration-accent underline-offset-4">
                        <Globe className="h-4 w-4" /> 
                        <span className="mono-label tracking-normal text-accent !opacity-100 uppercase font-bold">Source Terminal</span>
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-10">
                  <div className="text-right">
                    <span className="mono-label">Benchmark Price</span>
                    <p className="text-4xl bold-heading text-white mt-1">₹{product.currentPrice.toLocaleString()}</p>
                  </div>
                  <div className="flex flex-col gap-3">
                    <Button 
                      onClick={() => handleCompare(product)}
                      disabled={isComparing === product.id}
                      className="bg-white text-black hover:bg-accent font-black uppercase text-[10px] tracking-widest rounded-none h-12 px-8 min-w-[160px] transition-colors"
                    >
                      {isComparing === product.id ? (
                        <>
                          <div className="h-4 w-4 border-2 border-black/30 border-t-black rounded-full animate-spin mr-3" />
                          Searching...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-3" /> AI PRICE SCAN
                        </>
                      )}
                    </Button>
                    <Button variant="ghost" size="sm" className="mono-label !opacity-40 hover:!opacity-100 text-rose-500 hover:bg-rose-500/10 rounded-none py-4" onClick={() => api.deleteForUser('products', product.id)}>
                      <Trash2 className="h-3 w-3 mr-2 text-rose-500" /> Purge Asset
                    </Button>
                  </div>
                </div>
              </div>

              {/* Comparison Results */}
              <AnimatePresence>
                {comparisonResults.length > 0 && !isComparing && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-10 pt-8 border-t border-white/10"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h4 className="text-sm font-black italic uppercase tracking-tighter flex items-center gap-2">
                        <TrendingDown className="h-4 w-4 text-accent" /> Deals Detected via AI Engine
                      </h4>
                      <span className="mono-label">Source: Global Retail Index</span>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {comparisonResults.map((res, idx) => (
                        <div key={idx} className="p-6 bg-white/[0.02] border border-white/5 flex flex-col justify-between group hover:border-accent transition-colors">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                               <span className="mono-label !text-white text-[9px]">{res.store}</span>
                               <p className="text-2xl bold-heading mt-1">₹{res.price.toLocaleString()}</p>
                            </div>
                            <div className={`px-2 py-1 text-[9px] font-black uppercase tracking-widest ${res.price < product.currentPrice ? 'bg-accent text-black' : 'bg-white/10 text-white'}`}>
                               {res.price < product.currentPrice ? 'UNDER CUT' : 'PAR'}
                            </div>
                          </div>
                          <div className="flex items-center justify-between pt-4 border-t border-white/5">
                             <p className={`mono-label !opacity-100 ${res.price < product.currentPrice ? 'text-accent' : 'text-slate-500'}`}>
                               {res.price < product.currentPrice ? `-₹${(product.currentPrice - res.price).toLocaleString()}` : '0% DIFF'}
                             </p>
                             <a href={res.url} target="_blank" rel="noreferrer">
                               <Button variant="link" className="p-0 h-auto text-white italic font-black uppercase text-[10px] tracking-tight hover:text-accent transition-colors">
                                 Intercept <ExternalLink className="h-3 w-3 ml-2" />
                               </Button>
                             </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        ))}

        {products.length === 0 && (
          <div className="h-80 flex flex-col items-center justify-center border border-dashed border-white/10 relative overflow-hidden">
             <div className="absolute inset-0 opacity-[0.02] pointer-events-none select-none">
                <span className="text-[200px] font-black italic uppercase block text-center mt-20">EMPTY</span>
             </div>
             <Search className="h-10 w-10 mb-6 text-accent opacity-20" />
             <span className="accent-label text-[10px] mb-2">Status: Waiting</span>
             <p className="mono-label">No active surveillance targets identified.</p>
             <p className="text-xs text-slate-500 mt-4 uppercase tracking-tighter">Add assets to initialize price monitoring engine.</p>
          </div>
        )}
      </div>
    </div>
  );
}
