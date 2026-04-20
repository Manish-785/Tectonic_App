import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Dumbbell } from "lucide-react";
import { CartProvider } from "@/context/CartContext";
import { ClientHeader } from "@/components/ClientHeader";
import { CartDrawer } from "@/components/CartDrawer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tectonic | Handcrafted for IIT Bombay",
  description: "Premium Aggressive Sports Gear catered solely for IIT Bombay students.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${montserrat.variable} antialiased min-h-screen flex flex-col`}>
        <CartProvider>
          <ClientHeader />
          <CartDrawer />
          
          <main className="flex-1 flex flex-col">
            {children}
          </main>

          <footer className="border-t border-border bg-card mt-auto py-12">
            <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Dumbbell className="h-6 w-6 text-primary" />
                  <span className="font-display font-bold text-lg uppercase tracking-wider">
                    Tectonic
                  </span>
                </div>
                <p className="text-sm text-foreground/70">
                  Groundbreaking fitness equipment, apparel, and supplements handcrafted specifically for IIT Bombay students, empowering peak performance across all hostels.
                </p>
                <div className="text-primary text-xs font-bold uppercase tracking-wider border border-primary inline-block px-2 py-1">
                  Exclusive to IITB
                </div>
              </div>
              <div>
                <h3 className="font-display font-bold mb-4 uppercase text-sm tracking-wider">Catalogue</h3>
                <ul className="space-y-2 text-sm text-foreground/70">
                  <li><Link href="/catalogue?category=protein" className="hover:text-primary transition-colors">Supplements</Link></li>
                  <li><Link href="/catalogue?category=gear" className="hover:text-primary transition-colors">Protective Gear</Link></li>
                  <li><Link href="/catalogue?category=footwear" className="hover:text-primary transition-colors">Footwear</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="font-display font-bold mb-4 uppercase text-sm tracking-wider">Company</h3>
                <ul className="space-y-2 text-sm text-foreground/70">
                  <li><Link href="/catalogue" className="hover:text-primary transition-colors">The Arsenal</Link></li>
                  <li><Link href="#" className="hover:text-primary transition-colors">About Us</Link></li>
                  <li><Link href="#" className="hover:text-primary transition-colors">Contact</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="font-display font-bold mb-4 uppercase text-sm tracking-wider">Legal</h3>
                <ul className="space-y-2 text-sm text-foreground/70">
                  <li><Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                  <li><Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                </ul>
              </div>
            </div>
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}
