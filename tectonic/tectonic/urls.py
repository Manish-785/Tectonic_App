"""
urls.py — Tectonic Fitness and Sports
All catalogue API routes.  Include this module in your project's root urls.py:

    path("api/v1/", include("catalogue.urls")),
"""

from django.urls import path

from .views import (
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