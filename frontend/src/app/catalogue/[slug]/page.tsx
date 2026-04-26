"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api, ProductDetail } from "@/lib/api";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, PhoneCall } from "lucide-react";
import Link from "next/link";

export default function ProductDetailPage() {
  const { slug } = useParams();
  const router = useRouter();
  
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      if (!slug) return;
      try {
        const data = await api.getProduct(slug as string);
        setProduct(data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="font-bold uppercase tracking-widest text-sm animate-pulse">Running diagnostics...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-4xl font-display font-bold uppercase tracking-widest text-primary mb-4">404 - MIA</h1>
        <p className="text-foreground/70 mb-8">This piece of equipment could not be located in our arsenal.</p>
        <button onClick={() => router.push('/catalogue')} className="bg-background border border-border px-6 py-3 font-bold uppercase tracking-widest text-sm hover:bg-border transition-colors">
          Return to Arsenal
        </button>
      </div>
    );
  }

  // Use the active variant data (assumes backend handles the lowest price properly)
  const variant = product.variants.find((v) => v.is_active) || product.variants[0];
  const inStock = variant?.in_stock ?? false;
  const price = variant?.selling_price || "0";
  const mrp = variant?.mrp || "0";
  const displayImage = product.images?.[0]?.image_url || product.thumbnail_url;

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen">
      <Link href="/catalogue" className="inline-flex items-center gap-2 text-foreground/60 hover:text-primary transition-colors text-sm font-bold uppercase tracking-wider mb-8">
        <ArrowLeft className="h-4 w-4" /> Back to Arsenal
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
        {/* Gallery */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white border border-border aspect-square flex items-center justify-center p-8 relative"
        >
          {!inStock && (
            <div className="absolute top-4 left-4 bg-red-600 text-white font-bold text-xs uppercase px-3 py-1 shadow-lg">
              Out of Stock
            </div>
          )}
          <img 
            src={displayImage} 
            alt={product.name} 
            className="w-full h-full object-contain"
          />
        </motion.div>

        {/* Product Details */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col"
        >
          <div className="text-primary font-bold uppercase tracking-wider text-sm mb-2 select-none">
            {product.brand?.name || "Tectonic"}
          </div>
          <h1 className="text-4xl lg:text-5xl font-display font-bold uppercase tracking-tight mb-6">
            {product.name}
          </h1>

          <div className="flex flex-col gap-2 mb-8">
            {parseFloat(mrp) > parseFloat(price) || parseFloat(price) > 0 ? (
              <>
                <div className="text-foreground/50 line-through font-mono text-xl mb-1">
                  Amazon Price: ₹{Math.round(parseFloat(price) * 1.15).toLocaleString()}
                </div>
                <div className="flex items-end gap-4">
                  <span className="text-4xl font-mono font-bold">₹{price}</span>
                  <span className="text-primary font-bold uppercase tracking-widest text-sm border border-primary px-3 py-1 mb-1">
                    IITB Exclusive: ₹{Math.round(parseFloat(price) * 0.95).toLocaleString()}
                  </span>
                </div>
              </>
            ) : (
              <span className="text-4xl font-mono font-bold">₹{price}</span>
            )}
          </div>

          <p className="text-foreground/80 text-lg mb-8 leading-relaxed font-light">
            {product.description || "Premium high-grade equipment specifically curated for maximum output during your inter-hostel grinds. Built resilient. Built tough. Built for IIT Bombay."}
          </p>

          <div className="space-y-4 mb-10 pb-10 border-b border-border/50">
             {variant?.size && (
               <div className="flex items-center gap-4">
                 <span className="w-16 uppercase text-xs font-bold tracking-widest text-foreground/50">Size</span>
                 <span className="font-mono font-bold">{variant.size}</span>
               </div>
             )}
             {variant?.colour && (
               <div className="flex items-center gap-4">
                 <span className="w-16 uppercase text-xs font-bold tracking-widest text-foreground/50">Color</span>
                 <span className="font-mono font-bold capitalize">{variant.colour}</span>
               </div>
             )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-auto">
            <a 
              href="tel:9769587317"
              className="flex-1 h-14 bg-primary text-black flex items-center justify-center gap-3 font-bold uppercase tracking-widest hover:bg-primary/90 transition-all group border border-primary relative overflow-hidden"
            >
              <PhoneCall className="h-5 w-5 relative z-10" /> 
              <span className="relative z-10">Call To Order: 97695 87317</span>
              <div className="absolute inset-0 w-0 bg-white/20 group-hover:w-full transition-all duration-300 ease-out z-0"></div>
            </a>
          </div>


        </motion.div>
      </div>
    </div>
  );
}
