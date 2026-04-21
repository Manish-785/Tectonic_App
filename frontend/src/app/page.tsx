"use client";

import { motion } from "framer-motion";
import { ArrowRight, Zap, Target, Shield, Dumbbell, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api, ProductList } from "@/lib/api";
import { useCart } from "@/context/CartContext";

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<ProductList[]>([]);
  const { addToCart } = useCart();

  useEffect(() => {
    async function fetchData() {
      const prods = await api.getFeaturedProducts();
      setFeaturedProducts(prods.slice(0, 4));
    }
    fetchData();
  }, []);

  return (
    <>
      <section className="relative h-[90vh] min-h-[600px] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-background/90 z-10" />
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&q=80&w=2000"
            alt="Intense Workout at IITB Gym" 
            className="w-full h-full object-cover opacity-30 grayscale"
          />
        </div>

        <div className="container relative z-20 mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-3xl"
          >
            <div className="text-primary font-bold tracking-widest uppercase mb-4 text-sm border border-primary inline-block px-3 py-1 bg-primary/10">
              Handcrafted for IIT Bombay Students
            </div>
            <h1 className="text-5xl md:text-8xl font-display font-bold uppercase tracking-tight leading-[0.9] mb-6">
              Fuel the <span className="text-primary block mt-2 -skew-x-6">Grind</span>
            </h1>
            <p className="text-lg md:text-2xl text-foreground/80 mb-8 max-w-2xl font-light">
              Premium sports equipment and peak-performance supplements designed to carry you through grueling end-sems and intense inter-hostel GCs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/catalogue"
                className="bg-primary text-primary-foreground px-8 py-4 font-bold uppercase tracking-wider text-sm hover:bg-primary/90 transition-all text-center flex items-center justify-center gap-2 group border border-primary"
              >
                Stock Up Now
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/admin/dashboard"
                className="border border-border px-8 py-4 font-bold uppercase tracking-wider text-sm hover:border-primary/70 hover:text-primary transition-all text-center"
              >
                Open Admin
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-20 bg-card border-y border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { icon: Zap, title: "Exam-Season Energy", desc: "Top-tier protein & pre-workouts explicitly sourced for late-night campus grinds." },
              { icon: Shield, title: "Armour-Grade Gear", desc: "Equipment that survives the roughest Gymkhana ground conditions." },
              { icon: Target, title: "Direct to Hostel", desc: "No delays. Fast, direct deliveries right to your hostel gates." }
            ].map((prop, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="flex flex-col items-center text-center p-6 border border-border/50 bg-background/50 hover:border-primary/50 transition-colors"
              >
                <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-6 text-primary">
                  <prop.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-display font-bold uppercase tracking-wide mb-3">{prop.title}</h3>
                <p className="text-foreground/70">{prop.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Catalogue (Protein & Sports Items) */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-4xl md:text-5xl font-display font-bold uppercase tracking-tight">Prime <span className="text-primary italic">Arsenal</span></h2>
              <p className="mt-4 text-foreground/60 max-w-xl">Top-rated protein powders, supplements, and heavy-duty gear built for IITB's elite athletes.</p>
            </div>
            <Link href="/catalogue" className="hidden md:flex items-center gap-2 text-primary font-bold hover:underline uppercase text-sm tracking-wider">
              View Entire Arsenal <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.length > 0 ? featuredProducts.map((product, i) => (
              <motion.div 
                key={product.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative bg-card border border-border overflow-hidden flex flex-col"
              >
                <div className="aspect-square bg-white relative overflow-hidden flex items-center justify-center p-4">
                  <div className="absolute top-2 left-2 bg-primary text-black font-bold text-[10px] uppercase px-2 py-1 z-10">
                    Featured
                  </div>
                  <img 
                    src={product.thumbnail_url} 
                    alt={product.name}
                    className="object-contain w-full h-full group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <div className="text-xs text-primary font-bold uppercase tracking-wider pl-1 mb-1 border-l-2 border-primary">
                    {product.brand?.name || 'Tectonic'}
                  </div>
                  <h3 className="font-display font-bold text-lg mb-2 truncate" title={product.name}>
                    {product.name}
                  </h3>
                  <div className="mt-auto">
                    <span className="text-xl font-bold font-mono block mb-4">
                      ₹{product.min_price?.toLocaleString() || '---'}
                    </span>
                    <button 
                      onClick={() => addToCart(product)}
                      className="w-full h-12 bg-background border border-border flex items-center justify-center gap-2 hover:bg-primary hover:text-black hover:border-primary transition-all rounded-none font-bold uppercase text-sm group/btn"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Add to Cart
                    </button>
                  </div>
                </div>
              </motion.div>
            )) : (
              <div className="col-span-4 py-20 text-center text-foreground/50 flex flex-col items-center">
                 <Dumbbell className="h-12 w-12 mb-4 animate-pulse" />
                 <p>Loading the arsenal...</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
