"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Dumbbell } from "lucide-react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push("/catalogue");
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background">
      <div className="absolute inset-0 z-0">
        <svg className="absolute w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M0 40L40 0H20L0 20M40 40V20L20 40" stroke="currentColor" strokeWidth="1" fill="none" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2 text-primary group mb-6">
            <Dumbbell className="h-10 w-10 group-hover:rotate-12 transition-transform" />
          </Link>
          <h1 className="text-3xl font-display font-bold uppercase tracking-wider mb-2">Initiate <span className="text-primary italic">Sequence</span></h1>
          <p className="text-foreground/60">Enter credentials to access your command center.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card border border-border p-8 shadow-2xl">
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-foreground/80">Email Identifier</label>
              <input 
                type="email" 
                required
                className="w-full bg-background border border-border p-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-mono"
                placeholder="agent@tectonic.com"
              />
            </div>
            <div>
               <div className="flex justify-between mb-2">
                 <label className="block text-xs font-bold uppercase tracking-wider text-foreground/80">Security Code</label>
                 <Link href="#" className="text-xs text-primary hover:underline">Forgot?</Link>
               </div>
              <input 
                type="password" 
                required
                className="w-full bg-background border border-border p-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-mono"
                placeholder="••••••••"
              />
            </div>
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground p-4 font-bold uppercase tracking-wider hover:bg-primary/90 transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed border border-primary relative overflow-hidden group"
            >
              <span className="relative z-10">{loading ? 'Authenticating...' : 'Engage'}</span>
              <div className="absolute inset-0 w-0 bg-white/20 group-hover:w-full transition-all duration-300 ease-out z-0"></div>
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-border text-center">
            <p className="text-sm text-foreground/60">
              Not part of the movement yet?{' '}
              <Link href="/auth/register" className="text-primary font-bold uppercase text-xs tracking-wider hover:underline ml-1">
                Enlist Here
              </Link>
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
