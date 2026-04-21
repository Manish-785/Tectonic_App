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
  is_active: boolean;
}

export interface ProductImage {
  id: number;
  image_url: string;
  alt_text: string;
  display_order: number;
}

export interface ProductDetail extends Omit<ProductList, "min_price" | "in_stock"> {
  description: string;
  images: ProductImage[];
  variants: ProductVariant[];
  updated_at: string;
}

export interface StoreInfo {
  id: number | null;
  store_name: string;
  tagline: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  pincode: string;
  google_maps_url: string;
  phone_primary: string;
  phone_secondary: string;
  whatsapp_number: string;
  email: string;
  call_to_order_instructions: string;
  opening_hours: string;
  is_active?: boolean;
  updated_at?: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    name: string;
  };
}

export interface RegisterResponse {
  success: boolean;
}

export interface AdminProductInput {
  name: string;
  description: string;
  brand_id: number;
  category_id: number;
  sport_ids: number[];
  thumbnail_url: string;
  is_active: boolean;
  is_featured: boolean;
  sku: string;
  size: string;
  colour: string;
  mrp: string;
  selling_price: string;
  in_stock: boolean;
}

export interface AdminLookupInput {
  name: string;
  icon_url?: string;
  logo_url?: string;
  is_active?: boolean;
}

export interface AdminCategoryInput {
  name: string;
  sports: number[];
  is_active?: boolean;
}

export type ProductQueryParams = Record<
  string,
  string | number | boolean | undefined
>;

function filterMockProducts(params?: ProductQueryParams): ProductList[] {
  if (!params) {
    return MOCK_PRODUCTS;
  }

  return MOCK_PRODUCTS.filter((product) => {
    const category = typeof params.category === "string" ? params.category : undefined;
    const brand = typeof params.brand === "string" ? params.brand : undefined;
    const sport = typeof params.sport === "string" ? params.sport : undefined;
    const search = typeof params.search === "string" ? params.search.toLowerCase() : undefined;
    const inStock = params.in_stock === "1" || params.in_stock === true;

    if (category && product.category.slug !== category) {
      return false;
    }
    if (brand && product.brand.slug !== brand) {
      return false;
    }
    if (sport && !product.sports.some((item) => item.slug === sport)) {
      return false;
    }
    if (
      search &&
      !`${product.name} ${product.brand.name} ${product.category.name}`.toLowerCase().includes(search)
    ) {
      return false;
    }
    if (inStock && !product.in_stock) {
      return false;
    }

    return true;
  });
}

// Fallback Mock Data
export const MOCK_PRODUCTS: ProductList[] = [
  {
    id: 1,
    name: "Whey Protein Isolate - 2kg",
    slug: "whey-protein-isolate-2kg",
    brand: { id: 1, name: "MuscleTech", slug: "muscletech", logo_url: "" },
    category: { id: 1, name: "Protein", slug: "protein", sports: [] },
    sports: [{ id: 1, name: "Gym Fitness", slug: "gym-fitness", icon_url: "" }],
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
    category: { id: 1, name: "Protein", slug: "protein", sports: [] },
    sports: [{ id: 1, name: "Gym Fitness", slug: "gym-fitness", icon_url: "" }],
    thumbnail_url: "https://images.unsplash.com/photo-1554629947-334ff61d112c?auto=format&fit=crop&q=80&w=800",
    min_price: 2200.00,
    in_stock: true,
    is_featured: true,
  },
  {
    id: 3,
    name: "Micronized Creatine",
    slug: "micronized-creatine",
    brand: { id: 2, name: "Optimum Nutrition", slug: "optimum-nutrition", logo_url: "" },
    category: { id: 1, name: "Protein", slug: "protein", sports: [] },
    sports: [{ id: 1, name: "Gym Fitness", slug: "gym-fitness", icon_url: "" }],
    thumbnail_url: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=800",
    min_price: 1299.00,
    in_stock: true,
    is_featured: false,
  },
  {
    id: 4,
    name: "Recovery Protein Bar Box",
    slug: "recovery-protein-bar-box",
    brand: { id: 2, name: "Optimum Nutrition", slug: "optimum-nutrition", logo_url: "" },
    category: { id: 1, name: "Protein", slug: "protein", sports: [] },
    sports: [
      { id: 1, name: "Gym Fitness", slug: "gym-fitness", icon_url: "" },
      { id: 3, name: "Cricket", slug: "cricket", icon_url: "" },
    ],
    thumbnail_url: "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?auto=format&fit=crop&q=80&w=800",
    min_price: 1899.00,
    in_stock: true,
    is_featured: false,
  },
  {
    id: 5,
    name: "Pro-Grip Lifting Gloves",
    slug: "pro-grip-lifting-gloves",
    brand: { id: 3, name: "Rogue Fitness", slug: "rogue", logo_url: "" },
    category: { id: 2, name: "Gear", slug: "gear", sports: [] },
    sports: [{ id: 1, name: "Gym Fitness", slug: "gym-fitness", icon_url: "" }],
    thumbnail_url: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&q=80&w=800",
    min_price: 850.00,
    in_stock: true,
    is_featured: true,
  },
  {
    id: 6,
    name: "Resistance Band Set",
    slug: "resistance-band-set",
    brand: { id: 3, name: "Rogue Fitness", slug: "rogue", logo_url: "" },
    category: { id: 2, name: "Gear", slug: "gear", sports: [] },
    sports: [
      { id: 1, name: "Gym Fitness", slug: "gym-fitness", icon_url: "" },
      { id: 2, name: "Football", slug: "football", icon_url: "" },
    ],
    thumbnail_url: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=800",
    min_price: 1499.00,
    in_stock: true,
    is_featured: false,
  },
  {
    id: 7,
    name: "Shaker Bottle Pro",
    slug: "shaker-bottle-pro",
    brand: { id: 3, name: "Rogue Fitness", slug: "rogue", logo_url: "" },
    category: { id: 2, name: "Gear", slug: "gear", sports: [] },
    sports: [{ id: 1, name: "Gym Fitness", slug: "gym-fitness", icon_url: "" }],
    thumbnail_url: "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?auto=format&fit=crop&q=80&w=800",
    min_price: 449.00,
    in_stock: true,
    is_featured: false,
  },
  {
    id: 8,
    name: "Cricket Match Ball",
    slug: "cricket-match-ball",
    brand: { id: 4, name: "Nike", slug: "nike", logo_url: "" },
    category: { id: 2, name: "Gear", slug: "gear", sports: [] },
    sports: [{ id: 3, name: "Cricket", slug: "cricket", icon_url: "" }],
    thumbnail_url: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&q=80&w=800",
    min_price: 599.00,
    in_stock: true,
    is_featured: false,
  },
  {
    id: 9,
    name: "Cricket Batting Gloves",
    slug: "cricket-batting-gloves",
    brand: { id: 4, name: "Nike", slug: "nike", logo_url: "" },
    category: { id: 2, name: "Gear", slug: "gear", sports: [] },
    sports: [{ id: 3, name: "Cricket", slug: "cricket", icon_url: "" }],
    thumbnail_url: "https://images.unsplash.com/photo-1526676037777-05a232554f77?auto=format&fit=crop&q=80&w=800",
    min_price: 1549.00,
    in_stock: true,
    is_featured: false,
  },
  {
    id: 10,
    name: "Astroturf Football Boots",
    slug: "astroturf-football-boots",
    brand: { id: 4, name: "Nike", slug: "nike", logo_url: "" },
    category: { id: 3, name: "Footwear", slug: "footwear", sports: [] },
    sports: [{ id: 2, name: "Football", slug: "football", icon_url: "" }],
    thumbnail_url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800",
    min_price: 6500.0,
    in_stock: true,
    is_featured: false,
  },
  {
    id: 11,
    name: "Training Running Shoes",
    slug: "training-running-shoes",
    brand: { id: 4, name: "Nike", slug: "nike", logo_url: "" },
    category: { id: 3, name: "Footwear", slug: "footwear", sports: [] },
    sports: [
      { id: 1, name: "Gym Fitness", slug: "gym-fitness", icon_url: "" },
      { id: 2, name: "Football", slug: "football", icon_url: "" },
    ],
    thumbnail_url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800",
    min_price: 5599.0,
    in_stock: true,
    is_featured: true,
  },
  {
    id: 12,
    name: "Arcsaber Badminton Racket",
    slug: "arcsaber-badminton-racket",
    brand: { id: 5, name: "Yonex", slug: "yonex", logo_url: "" },
    category: { id: 2, name: "Gear", slug: "gear", sports: [] },
    sports: [{ id: 4, name: "Badminton", slug: "badminton", icon_url: "" }],
    thumbnail_url: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&q=80&w=800",
    min_price: 5999.0,
    in_stock: true,
    is_featured: false,
  },
  {
    id: 13,
    name: "Feather Shuttle Tube",
    slug: "feather-shuttle-tube",
    brand: { id: 5, name: "Yonex", slug: "yonex", logo_url: "" },
    category: { id: 2, name: "Gear", slug: "gear", sports: [] },
    sports: [{ id: 4, name: "Badminton", slug: "badminton", icon_url: "" }],
    thumbnail_url: "https://images.unsplash.com/photo-1613918431703-aa508a48bfc4?auto=format&fit=crop&q=80&w=800",
    min_price: 1499.0,
    in_stock: true,
    is_featured: false,
  },
  {
    id: 14,
    name: "Court Badminton Shoes",
    slug: "court-badminton-shoes",
    brand: { id: 5, name: "Yonex", slug: "yonex", logo_url: "" },
    category: { id: 3, name: "Footwear", slug: "footwear", sports: [] },
    sports: [{ id: 4, name: "Badminton", slug: "badminton", icon_url: "" }],
    thumbnail_url: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&q=80&w=800",
    min_price: 5299.0,
    in_stock: true,
    is_featured: true,
  },
];

// API Functions
export const api = {
  // Products
  getProducts: async (params?: ProductQueryParams) => {
    try {
      const response = await apiClient.get("/products/", { params });
      return response.data.results || response.data; // Handle pagination
    } catch {
      console.warn("Backend unavailable, using mock products");
      return filterMockProducts(params);
    }
  },
  
  getFeaturedProducts: async () => {
    try {
      const response = await apiClient.get("/products/featured/");
      return response.data;
    } catch {
      console.warn("Backend unavailable, using mock featured products");
      return MOCK_PRODUCTS.filter((p) => p.is_featured);
    }
  },

  getProduct: async (slug: string) => {
    try {
      const response = await apiClient.get(`/products/${slug}/`);
      return response.data;
    } catch {
      console.warn("Backend unavailable, using mock product detail");
      const listProd = MOCK_PRODUCTS.find((p) => p.slug === slug);
      if (!listProd) throw new Error("Not found");
      return {
        ...listProd,
        description: "A premium product designed for maximum performance. Built with advanced materials to withstand the toughest workouts.",
        images: [{ id: 1, image_url: listProd.thumbnail_url, alt_text: listProd.name, display_order: 0 }],
        variants: [{
          id: 1, sku: `${listProd.slug}-V1`, size: "Standard", colour: "Default", mrp: `${listProd.min_price}`, selling_price: `${listProd.min_price}`, discount_percent: 0, in_stock: true, is_active: true
        }],
        updated_at: new Date().toISOString()
      };
    }
  },

  getAdminStoreInfo: async (): Promise<StoreInfo> => {
    const response = await apiClient.get("/admin-dashboard/store/");
    return response.data;
  },

  saveAdminStoreInfo: async (payload: StoreInfo): Promise<StoreInfo> => {
    const response = await apiClient.put("/admin-dashboard/store/", payload);
    return response.data;
  },

  getAdminSports: async (): Promise<Sport[]> => {
    const response = await apiClient.get("/admin-dashboard/sports/");
    return response.data;
  },

  createAdminSport: async (payload: AdminLookupInput): Promise<Sport> => {
    const response = await apiClient.post("/admin-dashboard/sports/", payload);
    return response.data;
  },

  getAdminBrands: async (): Promise<Brand[]> => {
    const response = await apiClient.get("/admin-dashboard/brands/");
    return response.data;
  },

  createAdminBrand: async (payload: AdminLookupInput): Promise<Brand> => {
    const response = await apiClient.post("/admin-dashboard/brands/", payload);
    return response.data;
  },

  getAdminCategories: async (): Promise<Category[]> => {
    const response = await apiClient.get("/admin-dashboard/categories/");
    return response.data;
  },

  createAdminCategory: async (payload: AdminCategoryInput): Promise<Category> => {
    const response = await apiClient.post("/admin-dashboard/categories/", payload);
    return response.data;
  },

  getAdminProducts: async (): Promise<ProductDetail[]> => {
    const response = await apiClient.get("/admin-dashboard/products/");
    return response.data;
  },

  createAdminProduct: async (payload: AdminProductInput): Promise<ProductDetail> => {
    const response = await apiClient.post("/admin-dashboard/products/", payload);
    return response.data;
  },

  updateAdminProduct: async (
    id: number,
    payload: AdminProductInput
  ): Promise<ProductDetail> => {
    const response = await apiClient.put(`/admin-dashboard/products/${id}/`, payload);
    return response.data;
  },

  // Mocked Services (No backend endpoints)
  login: async (): Promise<AuthResponse> => {
    return new Promise((resolve) =>
      setTimeout(
        () => resolve({ token: "mock_jwt_token", user: { id: 1, name: "Test User" } }),
        1000
      )
    );
  },
  
  register: async (): Promise<RegisterResponse> => {
    return new Promise((resolve) =>
      setTimeout(() => resolve({ success: true }), 1000)
    );
  },

  getClasses: async () => {
    return new Promise((resolve) =>
      setTimeout(
        () =>
          resolve([
            { id: 1, title: "HIIT Inferno", trainer: "Alex Cross", intensity: "High", time: "06:00 AM" },
            { id: 2, title: "Strength & Conditioning", trainer: "Maria Santos", intensity: "Medium", time: "05:30 PM" },
            { id: 3, title: "Core Crusher", trainer: "David Kim", intensity: "High", time: "07:00 PM" },
          ]),
        800
      )
    );
  }
};
