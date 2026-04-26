"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useMemo, Suspense } from "react";
import { api, ProductList, ProductQueryParams, MOCK_PRODUCTS } from "@/lib/api";
import Link from "next/link";
import { Dumbbell, PhoneCall, Search, X, ChevronRight } from "lucide-react";
import { useSearchParams } from "next/navigation";

const CATEGORIES = [
  { label: "All", slug: "" },
  { label: "Cricket", slug: "cricket" },
  { label: "Badminton", slug: "badminton" },
  { label: "Football", slug: "football" },
  { label: "Strength", slug: "strength" },
  { label: "Cardio", slug: "cardio" },
  { label: "Boxing", slug: "boxing" },
  { label: "CrossFit", slug: "crossfit" },
  { label: "Accessories", slug: "accessories" },
];

function CatalogueContent() {
  const [products, setProducts] = useState<ProductList[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
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

  const filteredProducts = useMemo(() => {
    let result = products;
    if (activeCategory) {
      result = result.filter((p) => p.category.slug === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.name.toLowerCase().includes(q)
      );
    }
    return result;
  }, [products, activeCategory, searchQuery]);

  const productCount = filteredProducts.length;

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <section className="relative bg-card border-b border-border overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        <div className="container mx-auto px-4 py-16 md:py-20 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="h-1 w-12 bg-primary" />
              <span className="text-primary font-bold tracking-[0.3em] uppercase text-xs">IIT Bombay Exclusive</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-display font-black uppercase tracking-tighter leading-[0.9]">
              The <span className="text-primary italic">Arsenal</span>
            </h1>
            <p className="mt-5 text-foreground/60 max-w-xl text-lg font-light">
              Premium sports equipment &amp; fitness gear from brands you trust. Every product priced below Amazon.
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 max-w-md"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/40" />
              <input
                type="text"
                placeholder="Search products or brands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 pl-12 pr-10 bg-background border border-border text-foreground placeholder:text-foreground/30 font-mono text-sm focus:outline-none focus:border-primary transition-colors"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-primary">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Category Tabs */}
      <div className="border-b border-border sticky top-[72px] z-30 bg-background/95 backdrop-blur-md">
        <div className="container mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto py-3 scrollbar-hide -mx-4 px-4">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => setActiveCategory(cat.slug)}
                className={`whitespace-nowrap px-5 py-2.5 text-xs font-bold uppercase tracking-widest transition-all border ${
                  activeCategory === cat.slug
                    ? "bg-primary text-white border-primary"
                    : "bg-transparent text-foreground/60 border-border hover:border-foreground/30 hover:text-foreground"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="container mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <p className="text-sm font-mono text-foreground/50">
            <span className="text-primary font-bold">{productCount}</span> product{productCount !== 1 ? "s" : ""} found
          </p>
          {activeCategory && (
            <button
              onClick={() => setActiveCategory("")}
              className="text-xs text-primary font-bold uppercase tracking-wider hover:underline flex items-center gap-1"
            >
              Clear Filter <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-primary">
            <Dumbbell className="h-16 w-16 animate-pulse mb-4" />
            <p className="font-display uppercase tracking-widest font-bold text-sm">Loading Arsenal...</p>
          </div>
        ) : productCount === 0 ? (
          <div className="border border-border bg-card/60 px-6 py-16 text-center">
            <p className="font-display text-2xl font-bold uppercase tracking-wider">
              No Products Matched
            </p>
            <p className="mt-3 text-foreground/50">
              Try a different category or clear the search filter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product, i) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.03, duration: 0.3 }}
                  className="group bg-card border border-border flex flex-col hover:border-primary/50 transition-all duration-300 relative overflow-hidden"
                >
                  {/* Sport Tag */}
                  <div className="absolute top-3 left-3 z-10 flex gap-1.5">
                    {product.is_featured && (
                      <span className="bg-primary text-white font-black text-[10px] uppercase px-2 py-0.5 tracking-wider">
                        ★ Featured
                      </span>
                    )}
                    <span className="bg-background/80 backdrop-blur-sm text-foreground/70 font-bold text-[10px] uppercase px-2 py-0.5 tracking-wider border border-border">
                      {product.category.name}
                    </span>
                  </div>

                  {/* Image */}
                  <Link href={`/catalogue/${product.slug}`} className="aspect-[4/3] bg-white relative p-6 flex items-center justify-center border-b border-border cursor-pointer overflow-hidden">
                    <img
                      src={product.thumbnail_url}
                      alt={product.name}
                      className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 ease-out"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                  </Link>

                  {/* Content */}
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="text-[11px] text-primary font-black uppercase tracking-[0.2em] mb-1.5">
                      {product.brand?.name || "Tectonic"}
                    </div>
                    <h3 className="font-display font-bold text-base leading-snug mb-4 flex-1 group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>

                    {/* Pricing Block */}
                    <div className="mt-auto">
                      {product.min_price && (
                        <div className="mb-4 space-y-1.5">
                          {/* Amazon price */}
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/40 bg-foreground/5 px-1.5 py-0.5">Amazon</span>
                            <span className="text-sm text-foreground/40 line-through font-mono">
                              ₹{(product.amazon_price || Math.round(product.min_price * 1.15)).toLocaleString()}
                            </span>
                          </div>
                          {/* Our price + IITB */}
                          <div className="flex items-end justify-between">
                            <div className="flex items-baseline gap-2">
                              <span className="text-2xl font-black font-mono tracking-tight">
                                ₹{product.min_price.toLocaleString()}
                              </span>
                            </div>
                            <span className="text-[10px] font-black text-primary bg-primary/10 border border-primary/30 px-2 py-1 tracking-wider uppercase">
                              IITB: ₹{Math.round(product.min_price * 0.95).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2">
                        <a
                          href="tel:9769587317"
                          className="flex-1 bg-primary text-white hover:brightness-110 py-2.5 font-black uppercase text-[11px] tracking-wider transition-all flex items-center justify-center gap-1.5 group/btn"
                        >
                          <PhoneCall className="h-3.5 w-3.5" />
                          Order Now
                        </a>
                        <Link
                          href={`/catalogue/${product.slug}`}
                          className="bg-transparent text-foreground/60 hover:text-primary hover:border-primary border border-border px-4 py-2.5 font-bold uppercase text-[11px] tracking-wider transition-all flex items-center justify-center"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <section className="border-t border-border bg-card">
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl md:text-4xl font-display font-black uppercase tracking-tight mb-4">
            Can&apos;t find what you need?
          </h2>
          <p className="text-foreground/50 mb-8 max-w-lg mx-auto">
            We stock 500+ products across all categories. Call us for custom orders, bulk pricing, and hostel-level deals.
          </p>
          <a
            href="tel:9769587317"
            className="inline-flex items-center gap-3 bg-primary text-white px-10 py-4 font-black uppercase tracking-wider text-sm hover:brightness-110 transition-all"
          >
            <PhoneCall className="h-5 w-5" />
            Call Now: 97695 87317
          </a>
        </div>
      </section>
    </div>
  );
}

export default function CataloguePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center justify-center py-24 text-primary">
          <Dumbbell className="h-16 w-16 animate-pulse mb-4" />
          <p className="font-display uppercase tracking-widest font-bold text-sm">Loading Arsenal...</p>
        </div>
      </div>
    }>
      <CatalogueContent />
    </Suspense>
  );
}
