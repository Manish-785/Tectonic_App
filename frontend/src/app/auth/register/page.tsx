"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Dumbbell } from "lucide-react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push("/auth/login");
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background">
      <div className="absolute inset-0 z-0">
        <svg className="absolute h-full w-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="register-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M0 40L40 0H20L0 20M40 40V20L20 40" stroke="currentColor" strokeWidth="1" fill="none" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#register-grid)" />
        </svg>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="mb-10 text-center">
          <Link href="/" className="group mb-6 inline-flex items-center gap-2 text-primary">
            <Dumbbell className="h-10 w-10 transition-transform group-hover:rotate-12" />
          </Link>
          <h1 className="mb-2 text-3xl font-display font-bold uppercase tracking-wider">
            Join the <span className="text-primary italic">Movement</span>
          </h1>
          <p className="text-foreground/60">
            This MVP uses a mock registration flow so you can explore the app without a backend auth system.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="border border-border bg-card p-8 shadow-2xl">
          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-foreground/80">
                Full Name
              </label>
              <input
                type="text"
                required
                className="w-full border border-border bg-background p-3 font-mono transition-all focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Aman Kumar"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-foreground/80">
                Email Identifier
              </label>
              <input
                type="email"
                required
                className="w-full border border-border bg-background p-3 font-mono transition-all focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="agent@tectonic.com"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-foreground/80">
                Security Code
              </label>
              <input
                type="password"
                required
                className="w-full border border-border bg-background p-3 font-mono transition-all focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="relative flex w-full items-center justify-center overflow-hidden border border-primary bg-primary p-4 font-bold uppercase tracking-wider text-primary-foreground transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <span className="relative z-10">
                {loading ? "Creating Access..." : "Create Mock Account"}
              </span>
              <div className="absolute inset-0 z-0 bg-white/10" />
            </button>
          </div>

          <div className="mt-8 border-t border-border pt-6 text-center">
            <p className="text-sm text-foreground/60">
              Already enlisted?{" "}
              <Link href="/auth/login" className="ml-1 text-xs font-bold uppercase tracking-wider text-primary hover:underline">
                Login Here
              </Link>
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
