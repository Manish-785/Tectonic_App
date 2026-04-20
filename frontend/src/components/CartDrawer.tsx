"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, ShoppingCart, Loader2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useState } from "react";

export function CartDrawer() {
  const { cartItems, isCartOpen, toggleCart, removeFromCart, clearCart } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const subtotal = cartItems.reduce((acc, item) => acc + (item.product.min_price || 0) * item.quantity, 0);

  const handleCheckout = () => {
    setIsCheckingOut(true);
    setTimeout(() => {
      setIsCheckingOut(false);
      setOrderPlaced(true);
      clearCart();
    }, 1500);
  };

  const closeDrawer = () => {
    toggleCart(false);
    setTimeout(() => setOrderPlaced(false), 500); // reset status after closing animation
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDrawer}
            className="fixed inset-0 bg-black/60 z-[90] backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed inset-y-0 right-0 w-full md:w-[450px] bg-card border-l border-border shadow-2xl z-[100] flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-display font-bold uppercase tracking-wider flex items-center gap-2">
                <ShoppingCart className="h-6 w-6 text-primary" /> Arsenal Cart
              </h2>
              <button 
                onClick={closeDrawer}
                className="h-10 w-10 flex items-center justify-center hover:bg-background border border-transparent hover:border-border transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {orderPlaced ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                   <div className="h-20 w-20 bg-primary/20 flex items-center justify-center rounded-sm">
                     <ShoppingCart className="h-10 w-10 text-primary" />
                   </div>
                   <h3 className="font-display font-bold text-2xl uppercase tracking-wider text-primary">Deployment Confirmed</h3>
                   <p className="text-foreground/70">Your gear is inbound to your hostel. Stay ready.</p>
                </div>
              ) : cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-foreground/50 text-center">
                  <ShoppingCart className="h-16 w-16 mb-4 opacity-50" />
                  <p className="uppercase tracking-widest font-bold text-sm">Your Arsenal is Empty</p>
                  <p className="mt-2 text-xs">Load up on gear to proceed.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {cartItems.map((item) => (
                    <div key={item.product.id} className="flex gap-4 p-4 border border-border bg-background relative group">
                      <div className="h-20 w-20 bg-white flex items-center justify-center p-2 flex-shrink-0">
                        <img src={item.product.thumbnail_url} alt={item.product.name} className="max-h-full max-w-full object-contain" />
                      </div>
                      <div className="flex-1">
                        <div className="text-[10px] text-primary font-bold uppercase tracking-widest mb-1">{item.product.brand?.name || 'Tectonic'}</div>
                        <h4 className="font-bold text-sm leading-tight line-clamp-2 pr-6">{item.product.name}</h4>
                        <div className="flex items-center justify-between mt-2">
                           <span className="font-mono text-sm text-foreground/80">Qty: {item.quantity}</span>
                           <span className="font-mono font-bold">₹{((item.product.min_price||0) * item.quantity).toLocaleString()}</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.product.id)}
                        className="absolute top-2 right-2 p-1 text-foreground/40 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {!orderPlaced && cartItems.length > 0 && (
              <div className="p-6 border-t border-border bg-background">
                 <div className="flex items-center justify-between mb-4">
                   <span className="font-bold uppercase tracking-wider text-sm">Subtotal</span>
                   <span className="font-mono text-xl font-bold text-primary">₹{subtotal.toLocaleString()}</span>
                 </div>
                 <button 
                   onClick={handleCheckout}
                   disabled={isCheckingOut}
                   className="w-full bg-primary text-black font-bold uppercase tracking-widest py-4 flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-70 border border-primary"
                 >
                   {isCheckingOut ? (
                     <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> Verifying Requisition...</>
                   ) : (
                     "Checkout"
                   )}
                 </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
