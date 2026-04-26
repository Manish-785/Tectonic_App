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
  amazon_price: number | null;
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

// Fallback Mock Data — curated from Tectonic Fitness & Sports catalogue
export const MOCK_PRODUCTS: ProductList[] = [
  // ── Cricket ──
  { id: 1, name: "SG RSD Spark Kashmir Willow Bat", slug: "sg-rsd-spark-bat", brand: { id: 1, name: "SG", slug: "sg", logo_url: "" }, category: { id: 1, name: "Cricket", slug: "cricket", sports: [] }, sports: [{ id: 1, name: "Cricket", slug: "cricket", icon_url: "" }], thumbnail_url: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=400&h=400&fit=crop", min_price: 1249, amazon_price: 1349, in_stock: true, is_featured: true },
  { id: 2, name: "SG Club Leather Cricket Ball", slug: "sg-club-leather-ball", brand: { id: 1, name: "SG", slug: "sg", logo_url: "" }, category: { id: 1, name: "Cricket", slug: "cricket", sports: [] }, sports: [{ id: 1, name: "Cricket", slug: "cricket", icon_url: "" }], thumbnail_url: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=400&h=400&fit=crop", min_price: 499, amazon_price: 575, in_stock: true, is_featured: false },
  { id: 3, name: "DSC Intense Attitude Batting Gloves", slug: "dsc-batting-gloves", brand: { id: 2, name: "DSC", slug: "dsc", logo_url: "" }, category: { id: 1, name: "Cricket", slug: "cricket", sports: [] }, sports: [{ id: 1, name: "Cricket", slug: "cricket", icon_url: "" }], thumbnail_url: "https://images.unsplash.com/photo-1526676037777-05a232554f77?w=400&h=400&fit=crop", min_price: 749, amazon_price: 849, in_stock: true, is_featured: false },
  { id: 4, name: "Shrey Classic Steel Cricket Helmet", slug: "shrey-cricket-helmet", brand: { id: 3, name: "Shrey", slug: "shrey", logo_url: "" }, category: { id: 1, name: "Cricket", slug: "cricket", sports: [] }, sports: [{ id: 1, name: "Cricket", slug: "cricket", icon_url: "" }], thumbnail_url: "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=400&h=400&fit=crop", min_price: 1399, amazon_price: 1499, in_stock: true, is_featured: false },

  // ── Badminton ──
  { id: 5, name: "Yonex GR 303 Badminton Racquet", slug: "yonex-gr-303", brand: { id: 4, name: "Yonex", slug: "yonex", logo_url: "" }, category: { id: 2, name: "Badminton", slug: "badminton", sports: [] }, sports: [{ id: 2, name: "Badminton", slug: "badminton", icon_url: "" }], thumbnail_url: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=400&h=400&fit=crop", min_price: 399, amazon_price: 499, in_stock: true, is_featured: true },
  { id: 6, name: "Yonex Mavis 350 Shuttlecock (6 pcs)", slug: "yonex-mavis-350", brand: { id: 4, name: "Yonex", slug: "yonex", logo_url: "" }, category: { id: 2, name: "Badminton", slug: "badminton", sports: [] }, sports: [{ id: 2, name: "Badminton", slug: "badminton", icon_url: "" }], thumbnail_url: "https://images.unsplash.com/photo-1613918431703-aa508a48bfc4?w=400&h=400&fit=crop", min_price: 699, amazon_price: 799, in_stock: true, is_featured: false },

  // ── Football ──
  { id: 7, name: "Nivia Ashtang Football Size 5", slug: "nivia-ashtang-football", brand: { id: 5, name: "Nivia", slug: "nivia", logo_url: "" }, category: { id: 3, name: "Football", slug: "football", sports: [] }, sports: [{ id: 3, name: "Football", slug: "football", icon_url: "" }], thumbnail_url: "https://images.unsplash.com/photo-1614632537423-1e6078b0f6c1?w=400&h=400&fit=crop", min_price: 649, amazon_price: 749, in_stock: true, is_featured: true },
  { id: 8, name: "Vector X Football Shoes Chaser", slug: "vector-x-football-shoes", brand: { id: 6, name: "Vector X", slug: "vector-x", logo_url: "" }, category: { id: 3, name: "Football", slug: "football", sports: [] }, sports: [{ id: 3, name: "Football", slug: "football", icon_url: "" }], thumbnail_url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop", min_price: 599, amazon_price: 699, in_stock: true, is_featured: false },

  // ── Fitness / Strength ──
  { id: 9, name: "Cockatoo Hex Dumbbells 5 Kg Pair", slug: "cockatoo-hex-dumbbells-5kg", brand: { id: 7, name: "Cockatoo", slug: "cockatoo", logo_url: "" }, category: { id: 4, name: "Strength", slug: "strength", sports: [] }, sports: [{ id: 4, name: "Gym Fitness", slug: "gym-fitness", icon_url: "" }], thumbnail_url: "https://images.unsplash.com/photo-1586401100295-7a8096fd231a?w=400&h=400&fit=crop", min_price: 1099, amazon_price: 1199, in_stock: true, is_featured: true },
  { id: 10, name: "PowerMax 8 Kg Cast Iron Kettlebell", slug: "powermax-kettlebell-8kg", brand: { id: 8, name: "PowerMax", slug: "powermax", logo_url: "" }, category: { id: 4, name: "Strength", slug: "strength", sports: [] }, sports: [{ id: 4, name: "Gym Fitness", slug: "gym-fitness", icon_url: "" }], thumbnail_url: "https://images.unsplash.com/photo-1517344884509-a0c97ec11bcc?w=400&h=400&fit=crop", min_price: 849, amazon_price: 949, in_stock: true, is_featured: false },
  { id: 11, name: "USI Weight Lifting Belt 6 inch", slug: "usi-weight-belt", brand: { id: 9, name: "USI", slug: "usi", logo_url: "" }, category: { id: 4, name: "Strength", slug: "strength", sports: [] }, sports: [{ id: 4, name: "Gym Fitness", slug: "gym-fitness", icon_url: "" }], thumbnail_url: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&h=400&fit=crop", min_price: 1149, amazon_price: 1249, in_stock: true, is_featured: false },

  // ── Cardio ──
  { id: 12, name: "PowerMax BS-150 Spin Bike", slug: "powermax-spin-bike", brand: { id: 8, name: "PowerMax", slug: "powermax", logo_url: "" }, category: { id: 5, name: "Cardio", slug: "cardio", sports: [] }, sports: [{ id: 4, name: "Gym Fitness", slug: "gym-fitness", icon_url: "" }], thumbnail_url: "https://images.unsplash.com/photo-1591291621164-2c6367723315?w=400&h=400&fit=crop", min_price: 12499, amazon_price: 12999, in_stock: true, is_featured: false },
  { id: 13, name: "Cockatoo Foldable Treadmill CT-01", slug: "cockatoo-treadmill-ct01", brand: { id: 7, name: "Cockatoo", slug: "cockatoo", logo_url: "" }, category: { id: 5, name: "Cardio", slug: "cardio", sports: [] }, sports: [{ id: 4, name: "Gym Fitness", slug: "gym-fitness", icon_url: "" }], thumbnail_url: "https://images.unsplash.com/photo-1576678927484-cc907957088c?w=400&h=400&fit=crop", min_price: 21999, amazon_price: 22499, in_stock: true, is_featured: false },

  // ── Boxing / MMA ──
  { id: 14, name: "USI Immortal Boxing Gloves 12oz", slug: "usi-boxing-gloves-12oz", brand: { id: 9, name: "USI", slug: "usi", logo_url: "" }, category: { id: 6, name: "Boxing", slug: "boxing", sports: [] }, sports: [{ id: 5, name: "Boxing / MMA", slug: "boxing-mma", icon_url: "" }], thumbnail_url: "https://images.unsplash.com/photo-1509255929945-586a420363cf?w=400&h=400&fit=crop", min_price: 1099, amazon_price: 1199, in_stock: true, is_featured: true },
  { id: 15, name: "Xpeed Boxing Hand Wraps 180 inch", slug: "xpeed-hand-wraps", brand: { id: 10, name: "Xpeed", slug: "xpeed", logo_url: "" }, category: { id: 6, name: "Boxing", slug: "boxing", sports: [] }, sports: [{ id: 5, name: "Boxing / MMA", slug: "boxing-mma", icon_url: "" }], thumbnail_url: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=400&h=400&fit=crop", min_price: 249, amazon_price: 329, in_stock: true, is_featured: false },

  // ── CrossFit ──
  { id: 16, name: "Xpeed Battle Rope 30ft", slug: "xpeed-battle-rope-30ft", brand: { id: 10, name: "Xpeed", slug: "xpeed", logo_url: "" }, category: { id: 7, name: "CrossFit", slug: "crossfit", sports: [] }, sports: [{ id: 4, name: "Gym Fitness", slug: "gym-fitness", icon_url: "" }], thumbnail_url: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&h=400&fit=crop", min_price: 2299, amazon_price: 2399, in_stock: true, is_featured: false },
  { id: 17, name: "Cosco Medicine Ball 5 Kg", slug: "cosco-medicine-ball-5kg", brand: { id: 11, name: "Cosco", slug: "cosco", logo_url: "" }, category: { id: 7, name: "CrossFit", slug: "crossfit", sports: [] }, sports: [{ id: 4, name: "Gym Fitness", slug: "gym-fitness", icon_url: "" }], thumbnail_url: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=400&fit=crop", min_price: 1349, amazon_price: 1449, in_stock: true, is_featured: false },

  // ── Accessories ──
  { id: 18, name: "Xpeed Gym Gloves with Wrist Support", slug: "xpeed-gym-gloves", brand: { id: 10, name: "Xpeed", slug: "xpeed", logo_url: "" }, category: { id: 8, name: "Accessories", slug: "accessories", sports: [] }, sports: [{ id: 4, name: "Gym Fitness", slug: "gym-fitness", icon_url: "" }], thumbnail_url: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&h=400&fit=crop&crop=top", min_price: 449, amazon_price: 549, in_stock: true, is_featured: false },
  { id: 19, name: "PowerMax Resistance Bands Set (5 pcs)", slug: "powermax-resistance-bands", brand: { id: 8, name: "PowerMax", slug: "powermax", logo_url: "" }, category: { id: 8, name: "Accessories", slug: "accessories", sports: [] }, sports: [{ id: 4, name: "Gym Fitness", slug: "gym-fitness", icon_url: "" }], thumbnail_url: "https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=400&h=400&fit=crop", min_price: 399, amazon_price: 499, in_stock: true, is_featured: false },
  { id: 20, name: "Tynor Knee Cap Pair", slug: "tynor-knee-cap-pair", brand: { id: 12, name: "Tynor", slug: "tynor", logo_url: "" }, category: { id: 8, name: "Accessories", slug: "accessories", sports: [] }, sports: [{ id: 4, name: "Gym Fitness", slug: "gym-fitness", icon_url: "" }], thumbnail_url: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=400&fit=crop", min_price: 299, amazon_price: 399, in_stock: true, is_featured: false },
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
