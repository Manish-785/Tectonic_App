"""
admin.py — Tectonic Fitness and Sports
Admin configuration for all catalogue models.
"""

from django.contrib import admin
from django.utils.html import format_html

from .models import (
    Brand,
    Category,
    Product,
    ProductImage,
    ProductVariant,
    Sport,
    StoreInfo,
)


# ---------------------------------------------------------------------------
# Inline admins
# ---------------------------------------------------------------------------


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    fields = ("image_url", "alt_text", "display_order")


class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 1
    fields = ("sku", "size", "colour", "mrp", "selling_price", "in_stock", "is_active")


# ---------------------------------------------------------------------------
# Model admins
# ---------------------------------------------------------------------------


@admin.register(Sport)
class SportAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "is_active")
    list_filter = ("is_active",)
    search_fields = ("name",)
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "is_active")
    list_filter = ("is_active",)
    search_fields = ("name",)
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "is_active")
    list_filter = ("is_active", "sports")
    search_fields = ("name",)
    filter_horizontal = ("sports",)
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "brand",
        "category",
        "is_active",
        "is_featured",
        "variant_count",
        "updated_at",
    )
    list_filter = ("is_active", "is_featured", "brand", "category", "sports")
    search_fields = ("name", "description", "brand__name")
    filter_horizontal = ("sports",)
    prepopulated_fields = {"slug": ("name",)}
    inlines = [ProductImageInline, ProductVariantInline]
    readonly_fields = ("created_at", "updated_at")

    @admin.display(description="Variants")
    def variant_count(self, obj) -> int:
        return obj.variants.count()


@admin.register(StoreInfo)
class StoreInfoAdmin(admin.ModelAdmin):
    list_display = ("store_name", "phone_primary", "is_active", "updated_at")
    readonly_fields = ("updated_at",)

    def has_add_permission(self, request) -> bool:
        # Warn operator if an active record already exists.
        if StoreInfo.objects.filter(is_active=True).exists():
            self.message_user(
                request,
                "An active store info record already exists. "
                "Consider editing it instead of creating a new one.",
                level="warning",
            )
        return True
