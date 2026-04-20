import axios from "axios";

// Base API Configuration
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Types based on Django Serializers
export interface Sport {
  id: number;
  name: string;
  slug: string;
  icon_url: string;
}

export interface Brand {
  id: number;
  name: string;
  slug: string;
  logo_url: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  sports: Sport[];
}

export interface ProductList {
  id: number;
  name: string;
  slug: string;
  brand: Brand;
  category: Category;
  sports: Sport[];
  thumbnail_url: string;
  min_price: number | null;
  in_stock: boolean;
  is_featured: boolean;
}

export interface ProductVariant {
  id: number;
  sku: string;
  size: string;
  colour: string;
  mrp: string;
  selling_price: string;
  discount_percent: number | null;
  in_stock: boolean;
}

export interface ProductImage {
  id: number;
  image_url: string;
  alt_text: string;
  display_order: number;
}

export interface ProductDetail extends Omit<ProductList, 'min_price' | 'in_stock'> {
  description: string;
  images: ProductImage[];
  variants: ProductVariant[];
  updated_at: string;
}

// Fallback Mock Data
export const MOCK_PRODUCTS: ProductList[] = [
  {
    id: 1,
    name: "Whey Protein Isolate - 2kg",
    slug: "whey-protein-isolate-2kg",
    brand: { id: 1, name: "MuscleTech", slug: "muscletech", logo_url: "" },
    category: { id: 1, name: "Supplements", slug: "supplements", sports: [] },
    sports: [],
    thumbnail_url: "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&q=80&w=800",
    min_price: 4500.00,
    in_stock: true,
    is_featured: true,
  },
  {
    id: 2,
    name: "Pre-Workout Explosive Energy",
    slug: "pre-workout-explosive",
    brand: { id: 2, name: "Optimum Nutrition", slug: "optimum-nutrition", logo_url: "" },
    category: { id: 1, name: "Supplements", slug: "supplements", sports: [] },
    sports: [],
    thumbnail_url: "https://images.unsplash.com/photo-1554629947-334ff61d112c?auto=format&fit=crop&q=80&w=800",
    min_price: 2200.00,
    in_stock: true,
    is_featured: true,
  },
  {
    id: 3,
    name: "Pro-Grip Lifting Gloves",
    slug: "pro-grip-lifting-gloves",
    brand: { id: 3, name: "Rogue Fitness", slug: "rogue", logo_url: "" },
    category: { id: 2, name: "Protective Gear", slug: "protective-gear", sports: [] },
    sports: [],
    thumbnail_url: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&q=80&w=800",
    min_price: 850.00,
    in_stock: true,
    is_featured: true,
  },
  {
    id: 4,
    name: "Adjustable Kettlebell 20kg",
    slug: "adjustable-kettlebell-20kg",
    brand: { id: 3, name: "Rogue Fitness", slug: "rogue", logo_url: "" },
    category: { id: 3, name: "Equipment", slug: "equipment", sports: [] },
    sports: [],
    thumbnail_url: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&q=80&w=800",
    min_price: 6500.00,
    in_stock: true,
    is_featured: false,
  }
];

// API Functions
export const api = {
  // Products
  getProducts: async (params?: Record<string, any>) => {
    try {
      const response = await apiClient.get('/products/', { params });
      return response.data.results || response.data; // Handle pagination
    } catch (error) {
      console.warn("Backend unavailable, using mock products");
      return MOCK_PRODUCTS;
    }
  },
  
  getFeaturedProducts: async () => {
    try {
      const response = await apiClient.get('/products/featured/');
      return response.data;
    } catch (error) {
      console.warn("Backend unavailable, using mock featured products");
      return MOCK_PRODUCTS.filter(p => p.is_featured);
    }
  },

  getProduct: async (slug: string) => {
    try {
      const response = await apiClient.get(`/products/${slug}/`);
      return response.data;
    } catch (error) {
      console.warn("Backend unavailable, using mock product detail");
      const listProd = MOCK_PRODUCTS.find(p => p.slug === slug);
      if (!listProd) throw new Error("Not found");
      return {
        ...listProd,
        description: "A premium product designed for maximum performance. Built with advanced materials to withstand the toughest workouts.",
        images: [{ id: 1, image_url: listProd.thumbnail_url, alt_text: listProd.name, display_order: 0 }],
        variants: [{
          id: 1, sku: `${listProd.slug}-V1`, size: "Standard", colour: "Default", mrp: `${listProd.min_price}`, selling_price: `${listProd.min_price}`, discount_percent: 0, in_stock: true
        }],
        updated_at: new Date().toISOString()
      };
    }
  },

  // Mocked Services (No backend endpoints)
  login: async (credentials: any) => {
    return new Promise(resolve => setTimeout(() => resolve({ token: "mock_jwt_token", user: { id: 1, name: "Test User" } }), 1000));
  },
  
  register: async (data: any) => {
    return new Promise(resolve => setTimeout(() => resolve({ success: true }), 1000));
  },

  getClasses: async () => {
    return new Promise(resolve => setTimeout(() => resolve([
      { id: 1, title: "HIIT Inferno", trainer: "Alex Cross", intensity: "High", time: "06:00 AM" },
      { id: 2, title: "Strength & Conditioning", trainer: "Maria Santos", intensity: "Medium", time: "05:30 PM" },
      { id: 3, title: "Core Crusher", trainer: "David Kim", intensity: "High", time: "07:00 PM" },
    ]), 800));
  }
};
