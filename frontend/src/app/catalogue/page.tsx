"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { api, ProductList, ProductQueryParams } from "@/lib/api";
import Link from "next/link";
import { Dumbbell, ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useSearchParams } from "next/navigation";

export default function CataloguePage() {
  const [products, setProducts] = useState<ProductList[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();

  useEffect(() => {
    async function loadCatalogue() {
      setLoading(true);
      const paramsFromUrl = new URLSearchParams(queryString);
      const params: ProductQueryParams = {
        category: paramsFromUrl.get("category") || undefined,
        brand: paramsFromUrl.get("brand") || undefined,
        sport: paramsFromUrl.get("sport") || undefined,
        search: paramsFromUrl.get("search") || undefined,
        in_stock: paramsFromUrl.get("in_stock") || undefined,
      };
      const data = await api.getProducts(params);
      setProducts(data);
      setLoading(false);
    }
    loadCatalogue();
  }, [queryString]);

  const activeFilter =
    searchParams.get("category") ||
    searchParams.get("brand") ||
    searchParams.get("sport") ||
    searchParams.get("search");

  return (
    <div className="container mx-auto px-4 py-20 min-h-screen">
      <div className="mb-12 border-b border-border pb-8">
        <div className="text-primary font-bold tracking-widest uppercase mb-4 text-xs border border-primary inline-block px-2 py-1 bg-primary/10">
          IIT Bombay Exclusive
        </div>
        <h1 className="text-4xl md:text-6xl font-display font-bold uppercase tracking-tight">The <span className="text-primary italic">Arsenal</span></h1>
        <p className="mt-4 text-foreground/70 max-w-2xl text-lg">Browse our complete collection of supplements, protective gear, and equipment. Stock up for your hostel games.</p>
        {activeFilter && (
          <p className="mt-3 text-sm uppercase tracking-[0.2em] text-primary">
            Filter active: {activeFilter}
          </p>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-primary">
          <Dumbbell className="h-16 w-16 animate-pulse mb-4" />
          <p className="font-display uppercase tracking-widest font-bold">Loading Arsenal...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="border border-border bg-card/60 px-6 py-12 text-center">
          <p className="font-display text-2xl font-bold uppercase tracking-wider">
            No Products Matched
          </p>
          <p className="mt-3 text-foreground/70">
            Try a different filter or seed the backend with the MVP catalogue.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {products.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group bg-card border border-border flex flex-col hover:border-primary/50 transition-colors"
            >
              <div className="aspect-square bg-white relative p-4 flex items-center justify-center border-b border-border">
                {product.is_featured && (
                  <div className="absolute top-2 right-2 bg-primary text-black font-bold text-[10px] uppercase px-2 py-1 z-10 rounded-sm">Featured</div>
                )}
                {product.in_stock ? null : (
                  <div className="absolute top-2 left-2 bg-red-600 text-white font-bold text-[10px] uppercase px-2 py-1 z-10 rounded-sm">Out of Stock</div>
                )}
                <img 
                  src={product.thumbnail_url} 
                  alt={product.name} 
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="text-xs text-primary font-bold uppercase tracking-wider mb-2">
                  {product.brand?.name || 'Tectonic'}
                </div>
                <h3 className="font-display font-bold text-lg leading-tight mb-4 flex-1">
                  {product.name}
                </h3>
                <div className="mt-auto">
                  <span className="text-xl font-bold font-mono text-foreground block mb-4">
                    ₹{product.min_price?.toLocaleString() || '---'}
                  </span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => addToCart(product)}
                      disabled={!product.in_stock}
                      className="flex-1 bg-primary text-black hover:bg-primary/90 border border-primary py-2 font-bold uppercase text-xs transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
                    >
                      <ShoppingCart className="h-4 w-4" /> Add
                    </button>
                    <Link 
                       href={`/catalogue/${product.slug}`}
                       className="bg-transparent text-foreground hover:bg-border border border-border px-4 py-2 font-bold uppercase text-xs transition-colors"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
