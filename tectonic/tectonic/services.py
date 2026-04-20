"""
services.py — Tectonic Fitness and Sports
Pure query/business-logic functions.  Views call these; no HTTP logic here.
Each function has exactly one responsibility.
"""

from django.db.models import QuerySet

from .models import Brand, Category, Product, Sport, StoreInfo


# ---------------------------------------------------------------------------
# Product queries
# ---------------------------------------------------------------------------


def get_active_products() -> QuerySet:
    """Return all active products with their related objects pre-fetched."""
    return (
        Product.objects.filter(is_active=True)
        .select_related("brand", "category")
        .prefetch_related("sports", "variants", "images")
    )


def get_featured_products() -> QuerySet:
    """Return active featured products."""
    return get_active_products().filter(is_featured=True)


def get_product_by_slug(slug: str) -> Product:
    """Return a single active product by slug; raises DoesNotExist if absent."""
    return get_active_products().get(slug=slug)


def filter_products_by_sport(queryset: QuerySet, sport_slug: str) -> QuerySet:
    """Narrow a product queryset to a given sport slug."""
    return queryset.filter(sports__slug=sport_slug)


def filter_products_by_brand(queryset: QuerySet, brand_slug: str) -> QuerySet:
    """Narrow a product queryset to a given brand slug."""
    return queryset.filter(brand__slug=brand_slug)


def filter_products_by_category(queryset: QuerySet, category_slug: str) -> QuerySet:
    """Narrow a product queryset to a given category slug."""
    return queryset.filter(category__slug=category_slug)


def filter_products_in_stock(queryset: QuerySet) -> QuerySet:
    """Narrow to products that have at least one active in-stock variant."""
    return queryset.filter(variants__in_stock=True, variants__is_active=True).distinct()


# ---------------------------------------------------------------------------
# Lookup queries
# ---------------------------------------------------------------------------


def get_active_sports() -> QuerySet:
    return Sport.objects.filter(is_active=True)


def get_active_brands() -> QuerySet:
    return Brand.objects.filter(is_active=True)


def get_active_categories() -> QuerySet:
    return Category.objects.filter(is_active=True).prefetch_related("sports")


# ---------------------------------------------------------------------------
# Store info query
# ---------------------------------------------------------------------------


def get_store_info() -> StoreInfo | None:
    """Return the active store info record, or None if not configured."""
    return StoreInfo.objects.filter(is_active=True).order_by("-updated_at").first()