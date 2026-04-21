"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import {
  AdminCategoryInput,
  AdminLookupInput,
  AdminProductInput,
  api,
  Brand,
  Category,
  ProductDetail,
  Sport,
  StoreInfo,
} from "@/lib/api";

const emptyStore: StoreInfo = {
  id: null,
  store_name: "",
  tagline: "",
  address_line1: "",
  address_line2: "",
  city: "",
  state: "",
  pincode: "",
  google_maps_url: "",
  phone_primary: "",
  phone_secondary: "",
  whatsapp_number: "",
  email: "",
  call_to_order_instructions: "",
  opening_hours: "",
  is_active: true,
};

const emptyProduct: AdminProductInput = {
  name: "",
  description: "",
  brand_id: 0,
  category_id: 0,
  sport_ids: [],
  thumbnail_url: "",
  is_active: true,
  is_featured: false,
  sku: "",
  size: "",
  colour: "",
  mrp: "",
  selling_price: "",
  in_stock: true,
};

function toggleId(values: number[], id: number) {
  return values.includes(id) ? values.filter((value) => value !== id) : [...values, id];
}

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [store, setStore] = useState<StoreInfo>(emptyStore);
  const [sports, setSports] = useState<Sport[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<ProductDetail[]>([]);
  const [sportForm, setSportForm] = useState<AdminLookupInput>({ name: "", icon_url: "", is_active: true });
  const [brandForm, setBrandForm] = useState<AdminLookupInput>({ name: "", logo_url: "", is_active: true });
  const [categoryForm, setCategoryForm] = useState<AdminCategoryInput>({ name: "", sports: [], is_active: true });
  const [productForm, setProductForm] = useState<AdminProductInput>(emptyProduct);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);

  async function loadDashboard() {
    setLoading(true);
    try {
      const [storeData, sportData, brandData, categoryData, productData] = await Promise.all([
        api.getAdminStoreInfo(),
        api.getAdminSports(),
        api.getAdminBrands(),
        api.getAdminCategories(),
        api.getAdminProducts(),
      ]);
      setStore({ ...emptyStore, ...storeData });
      setSports(sportData);
      setBrands(brandData);
      setCategories(categoryData);
      setProducts(productData);
      setMessage("");
    } catch {
      setMessage("The admin dashboard needs the Django backend running on port 8000.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  async function handleStoreSubmit(e: FormEvent) {
    e.preventDefault();
    const saved = await api.saveAdminStoreInfo(store);
    setStore(saved);
    setMessage("Store info saved.");
  }

  async function handleSportSubmit(e: FormEvent) {
    e.preventDefault();
    await api.createAdminSport(sportForm);
    setSportForm({ name: "", icon_url: "", is_active: true });
    await loadDashboard();
    setMessage("Sport added.");
  }

  async function handleBrandSubmit(e: FormEvent) {
    e.preventDefault();
    await api.createAdminBrand(brandForm);
    setBrandForm({ name: "", logo_url: "", is_active: true });
    await loadDashboard();
    setMessage("Brand added.");
  }

  async function handleCategorySubmit(e: FormEvent) {
    e.preventDefault();
    await api.createAdminCategory(categoryForm);
    setCategoryForm({ name: "", sports: [], is_active: true });
    await loadDashboard();
    setMessage("Category added.");
  }

  async function handleProductSubmit(e: FormEvent) {
    e.preventDefault();
    if (editingProductId === null) {
      await api.createAdminProduct(productForm);
      setMessage("Product created.");
    } else {
      await api.updateAdminProduct(editingProductId, productForm);
      setMessage("Product updated.");
    }
    setEditingProductId(null);
    setProductForm(emptyProduct);
    await loadDashboard();
  }

  function loadProductIntoEditor(product: ProductDetail) {
    const variant = product.variants[0];
    setEditingProductId(product.id);
    setProductForm({
      name: product.name,
      description: product.description,
      brand_id: product.brand.id,
      category_id: product.category.id,
      sport_ids: product.sports.map((sport) => sport.id),
      thumbnail_url: product.thumbnail_url,
      is_active: true,
      is_featured: product.is_featured,
      sku: variant?.sku || "",
      size: variant?.size || "",
      colour: variant?.colour || "",
      mrp: variant?.mrp || "",
      selling_price: variant?.selling_price || "",
      in_stock: variant?.in_stock ?? true,
    });
    setMessage(`Editing ${product.name}`);
  }

  return (
    <div className="container mx-auto min-h-screen px-4 py-10">
      <div className="mb-8 flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-3 inline-block border border-primary bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.25em] text-primary">
            Admin Dashboard
          </p>
          <h1 className="font-display text-4xl font-bold uppercase tracking-tight md:text-6xl">
            Control Room
          </h1>
          <p className="mt-3 max-w-2xl text-foreground/70">
            Manage real catalogue values, store details, and lookup data for the live app.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/catalogue" className="border border-border px-4 py-3 text-sm font-bold uppercase tracking-wider hover:bg-card">
            View Storefront
          </Link>
          <a href="http://127.0.0.1:8000/admin/" className="border border-primary bg-primary px-4 py-3 text-sm font-bold uppercase tracking-wider text-black">
            Django Admin
          </a>
        </div>
      </div>

      {message && <div className="mb-6 border border-primary/40 bg-card px-4 py-3 text-sm text-foreground/80">{message}</div>}
      {loading ? <p className="text-foreground/60">Loading dashboard data...</p> : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={handleStoreSubmit} className="border border-border bg-card p-6">
          <h2 className="mb-4 font-display text-2xl font-bold uppercase tracking-wider">Store Info</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <input value={store.store_name} onChange={(e) => setStore({ ...store, store_name: e.target.value })} placeholder="Store name" className="border border-border bg-background p-3" />
            <input value={store.tagline} onChange={(e) => setStore({ ...store, tagline: e.target.value })} placeholder="Tagline" className="border border-border bg-background p-3" />
            <input value={store.address_line1} onChange={(e) => setStore({ ...store, address_line1: e.target.value })} placeholder="Address line 1" className="border border-border bg-background p-3" />
            <input value={store.address_line2} onChange={(e) => setStore({ ...store, address_line2: e.target.value })} placeholder="Address line 2" className="border border-border bg-background p-3" />
            <input value={store.city} onChange={(e) => setStore({ ...store, city: e.target.value })} placeholder="City" className="border border-border bg-background p-3" />
            <input value={store.state} onChange={(e) => setStore({ ...store, state: e.target.value })} placeholder="State" className="border border-border bg-background p-3" />
            <input value={store.pincode} onChange={(e) => setStore({ ...store, pincode: e.target.value })} placeholder="Pincode" className="border border-border bg-background p-3" />
            <input value={store.phone_primary} onChange={(e) => setStore({ ...store, phone_primary: e.target.value })} placeholder="Primary phone" className="border border-border bg-background p-3" />
            <input value={store.phone_secondary} onChange={(e) => setStore({ ...store, phone_secondary: e.target.value })} placeholder="Secondary phone" className="border border-border bg-background p-3" />
            <input value={store.whatsapp_number} onChange={(e) => setStore({ ...store, whatsapp_number: e.target.value })} placeholder="WhatsApp number" className="border border-border bg-background p-3" />
            <input value={store.email} onChange={(e) => setStore({ ...store, email: e.target.value })} placeholder="Email" className="border border-border bg-background p-3" />
            <input value={store.google_maps_url} onChange={(e) => setStore({ ...store, google_maps_url: e.target.value })} placeholder="Google Maps URL" className="border border-border bg-background p-3" />
          </div>
          <textarea value={store.call_to_order_instructions} onChange={(e) => setStore({ ...store, call_to_order_instructions: e.target.value })} placeholder="Call to order instructions" className="mt-4 min-h-24 w-full border border-border bg-background p-3" />
          <textarea value={store.opening_hours} onChange={(e) => setStore({ ...store, opening_hours: e.target.value })} placeholder="Opening hours" className="mt-4 min-h-20 w-full border border-border bg-background p-3" />
          <button className="mt-4 border border-primary bg-primary px-5 py-3 font-bold uppercase tracking-wider text-black">Save Store Info</button>
        </form>

        <div className="grid gap-6">
          <form onSubmit={handleSportSubmit} className="border border-border bg-card p-6">
            <h2 className="mb-4 font-display text-2xl font-bold uppercase tracking-wider">Add Sport</h2>
            <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
              <input value={sportForm.name || ""} onChange={(e) => setSportForm({ ...sportForm, name: e.target.value })} placeholder="Sport name" className="border border-border bg-background p-3" />
              <input value={sportForm.icon_url || ""} onChange={(e) => setSportForm({ ...sportForm, icon_url: e.target.value })} placeholder="Icon URL" className="border border-border bg-background p-3" />
              <button className="border border-primary bg-primary px-4 py-3 font-bold uppercase tracking-wider text-black">Add</button>
            </div>
            <p className="mt-3 text-sm text-foreground/60">{sports.length} sports available</p>
          </form>

          <form onSubmit={handleBrandSubmit} className="border border-border bg-card p-6">
            <h2 className="mb-4 font-display text-2xl font-bold uppercase tracking-wider">Add Brand</h2>
            <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
              <input value={brandForm.name || ""} onChange={(e) => setBrandForm({ ...brandForm, name: e.target.value })} placeholder="Brand name" className="border border-border bg-background p-3" />
              <input value={brandForm.logo_url || ""} onChange={(e) => setBrandForm({ ...brandForm, logo_url: e.target.value })} placeholder="Logo URL" className="border border-border bg-background p-3" />
              <button className="border border-primary bg-primary px-4 py-3 font-bold uppercase tracking-wider text-black">Add</button>
            </div>
            <p className="mt-3 text-sm text-foreground/60">{brands.length} brands available</p>
          </form>

          <form onSubmit={handleCategorySubmit} className="border border-border bg-card p-6">
            <h2 className="mb-4 font-display text-2xl font-bold uppercase tracking-wider">Add Category</h2>
            <input value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} placeholder="Category name" className="mb-4 w-full border border-border bg-background p-3" />
            <div className="mb-4 grid gap-2 md:grid-cols-2">
              {sports.map((sport) => (
                <label key={sport.id} className="flex items-center gap-2 border border-border px-3 py-2 text-sm">
                  <input
                    type="checkbox"
                    checked={categoryForm.sports.includes(sport.id)}
                    onChange={() => setCategoryForm({ ...categoryForm, sports: toggleId(categoryForm.sports, sport.id) })}
                  />
                  <span>{sport.name}</span>
                </label>
              ))}
            </div>
            <button className="border border-primary bg-primary px-4 py-3 font-bold uppercase tracking-wider text-black">Add Category</button>
          </form>
        </div>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <form onSubmit={handleProductSubmit} className="border border-border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-2xl font-bold uppercase tracking-wider">
              {editingProductId === null ? "Create Product" : "Edit Product"}
            </h2>
            {editingProductId !== null && (
              <button
                type="button"
                onClick={() => {
                  setEditingProductId(null);
                  setProductForm(emptyProduct);
                }}
                className="border border-border px-3 py-2 text-xs font-bold uppercase tracking-wider"
              >
                Clear
              </button>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <input value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} placeholder="Product name" className="border border-border bg-background p-3" />
            <input value={productForm.thumbnail_url} onChange={(e) => setProductForm({ ...productForm, thumbnail_url: e.target.value })} placeholder="Thumbnail URL" className="border border-border bg-background p-3" />
            <select value={productForm.brand_id} onChange={(e) => setProductForm({ ...productForm, brand_id: Number(e.target.value) })} className="border border-border bg-background p-3">
              <option value={0}>Select brand</option>
              {brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
            </select>
            <select value={productForm.category_id} onChange={(e) => setProductForm({ ...productForm, category_id: Number(e.target.value) })} className="border border-border bg-background p-3">
              <option value={0}>Select category</option>
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
          </div>

          <textarea value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} placeholder="Product description" className="mt-4 min-h-28 w-full border border-border bg-background p-3" />

          <div className="mt-4 grid gap-2 md:grid-cols-3">
            {sports.map((sport) => (
              <label key={sport.id} className="flex items-center gap-2 border border-border px-3 py-2 text-sm">
                <input
                  type="checkbox"
                  checked={productForm.sport_ids.includes(sport.id)}
                  onChange={() => setProductForm({ ...productForm, sport_ids: toggleId(productForm.sport_ids, sport.id) })}
                />
                <span>{sport.name}</span>
              </label>
            ))}
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <input value={productForm.sku} onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })} placeholder="SKU" className="border border-border bg-background p-3" />
            <input value={productForm.size} onChange={(e) => setProductForm({ ...productForm, size: e.target.value })} placeholder="Size" className="border border-border bg-background p-3" />
            <input value={productForm.colour} onChange={(e) => setProductForm({ ...productForm, colour: e.target.value })} placeholder="Colour" className="border border-border bg-background p-3" />
            <input value={productForm.mrp} onChange={(e) => setProductForm({ ...productForm, mrp: e.target.value })} placeholder="MRP" className="border border-border bg-background p-3" />
            <input value={productForm.selling_price} onChange={(e) => setProductForm({ ...productForm, selling_price: e.target.value })} placeholder="Selling price" className="border border-border bg-background p-3" />
          </div>

          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={productForm.is_featured} onChange={(e) => setProductForm({ ...productForm, is_featured: e.target.checked })} />
              Featured
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={productForm.is_active} onChange={(e) => setProductForm({ ...productForm, is_active: e.target.checked })} />
              Active
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={productForm.in_stock} onChange={(e) => setProductForm({ ...productForm, in_stock: e.target.checked })} />
              In stock
            </label>
          </div>

          <button className="mt-5 border border-primary bg-primary px-5 py-3 font-bold uppercase tracking-wider text-black">
            {editingProductId === null ? "Create Product" : "Update Product"}
          </button>
        </form>

        <section className="border border-border bg-card p-6">
          <h2 className="mb-4 font-display text-2xl font-bold uppercase tracking-wider">Existing Products</h2>
          <div className="space-y-3">
            {products.map((product) => {
              const variant = product.variants[0];
              return (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => loadProductIntoEditor(product)}
                  className="w-full border border-border bg-background p-4 text-left transition-colors hover:border-primary/60"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">{product.brand.name}</p>
                      <h3 className="mt-1 font-display text-lg font-bold uppercase">{product.name}</h3>
                      <p className="mt-2 text-sm text-foreground/60">{product.category.name}</p>
                    </div>
                    <div className="text-right text-sm text-foreground/70">
                      <p>₹{variant?.selling_price || "---"}</p>
                      <p>{variant?.sku || "No SKU"}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
