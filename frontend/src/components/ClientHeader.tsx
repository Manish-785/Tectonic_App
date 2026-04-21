"use client";

import Link from "next/link";
import { Dumbbell, User, ShoppingCart, Menu } from "lucide-react";
import { useCart } from "@/context/CartContext";

export function ClientHeader() {
  const { toggleCart, cartItems } = useCart();
  
  const itemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <Dumbbell className="h-8 w-8 text-primary group-hover:rotate-12 transition-transform" />
          <span className="font-display font-bold text-xl uppercase tracking-wider">
            Tectonic <span className="text-primary text-xs ml-1">for IITB</span>
          </span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-8 font-medium text-sm">
          <Link href="/catalogue" className="hover:text-primary transition-colors">The Arsenal</Link>
          <Link href="/catalogue?category=protein" className="hover:text-primary transition-colors">Supplements</Link>
          <Link href="/admin/dashboard" className="hover:text-primary transition-colors">Admin</Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/auth/login" className="hidden md:flex items-center justify-center h-10 w-10 rounded-full hover:bg-card transition-colors">
            <User className="h-5 w-5" />
          </Link>
          <button 
            onClick={() => toggleCart(true)}
            className="flex items-center justify-center h-10 w-10 rounded-full hover:bg-card transition-colors relative"
          >
            <ShoppingCart className="h-5 w-5" />
             {itemCount > 0 && (
               <span className="absolute top-0 right-0 h-4 w-4 bg-primary text-black font-bold text-[10px] flex items-center justify-center rounded-full leading-none">
                 {itemCount}
               </span>
             )}
          </button>
          <button className="md:hidden flex items-center justify-center h-10 w-10 rounded-full hover:bg-card transition-colors">
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
