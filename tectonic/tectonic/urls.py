"""
urls.py — Tectonic Fitness and Sports
All catalogue API routes.  Include this module in your project's root urls.py:

    path("api/v1/", include("catalogue.urls")),
"""

from django.urls import path

from .views import (
    AdminBrandListCreateView,
    AdminCategoryListCreateView,
    AdminProductDetailView,
    AdminProductListCreateView,
    AdminSportListCreateView,
    AdminStoreInfoView,
    BrandListView,
    CategoryListView,
    FeaturedProductListView,
    ProductDetailView,
    ProductListView,
    SportListView,
    StoreInfoView,
)

app_name = "catalogue"

urlpatterns = [
    # ── Admin dashboard ───────────────────────────────────────────────────
    path("admin-dashboard/store/", AdminStoreInfoView.as_view(), name="admin-store"),
    path("admin-dashboard/sports/", AdminSportListCreateView.as_view(), name="admin-sport-list"),
    path("admin-dashboard/brands/", AdminBrandListCreateView.as_view(), name="admin-brand-list"),
    path(
        "admin-dashboard/categories/",
        AdminCategoryListCreateView.as_view(),
        name="admin-category-list",
    ),
    path(
        "admin-dashboard/products/",
        AdminProductListCreateView.as_view(),
        name="admin-product-list",
    ),
    path(
        "admin-dashboard/products/<int:pk>/",
        AdminProductDetailView.as_view(),
        name="admin-product-detail",
    ),
    # ── Store ────────────────────────────────────────────────────────────
    path("store/", StoreInfoView.as_view(), name="store-info"),
    # ── Lookup tables ────────────────────────────────────────────────────
    path("sports/", SportListView.as_view(), name="sport-list"),
    path("brands/", BrandListView.as_view(), name="brand-list"),
    path("categories/", CategoryListView.as_view(), name="category-list"),
    # ── Products ─────────────────────────────────────────────────────────
    # NOTE: 'featured/' must come before '<slug:slug>/' to avoid shadowing.
    path("products/", ProductListView.as_view(), name="product-list"),
    path(
        "products/featured/", FeaturedProductListView.as_view(), name="product-featured"
    ),
    path("products/<slug:slug>/", ProductDetailView.as_view(), name="product-detail"),
]
