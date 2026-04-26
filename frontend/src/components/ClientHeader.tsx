"use client";

import Link from "next/link";
import { Dumbbell, Menu, PhoneCall } from "lucide-react";

export function ClientHeader() {

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <Dumbbell className="h-8 w-8 text-primary group-hover:rotate-12 transition-transform" />
          <span className="font-display font-bold text-xl uppercase tracking-wider">
            Tectonic <span className="text-primary text-xs ml-1">for IITB</span>
          </span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-8 font-medium text-sm font-display tracking-widest uppercase">
          <Link href="/catalogue" className="hover:text-primary transition-colors">The Arsenal</Link>
          <Link href="/catalogue?category=protein" className="hover:text-primary transition-colors">Supplements</Link>
        </nav>

        <div className="flex items-center gap-4">
          <a
            href="tel:9769587317"
            className="hidden md:inline-flex items-center justify-center gap-2 rounded-full border border-primary/40 bg-primary px-5 py-2.5 font-display text-sm font-bold uppercase tracking-[0.14em] text-primary-foreground hover:bg-[#ff2244] transition-colors"
          >
            <PhoneCall className="h-4 w-4" />
            Call: 97695 87317
          </a>
          <a
            href="tel:9769587317"
            className="md:hidden flex items-center justify-center h-10 w-10 rounded-full hover:bg-card transition-colors relative"
          >
            <PhoneCall className="h-5 w-5 text-primary" />
          </a>
          <button className="md:hidden flex items-center justify-center h-10 w-10 rounded-full hover:bg-card transition-colors">
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
