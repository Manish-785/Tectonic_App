"""
serializers.py — Tectonic Fitness and Sports
Each serializer has a single responsibility: shape one model for the API.
Nested serializers are read-only; writes go through primary-key fields.
"""

from rest_framework import serializers

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
# Lookup serializers (lightweight, used in nested contexts)
# ---------------------------------------------------------------------------


class SportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sport
        fields = ["id", "name", "slug", "icon_url"]


class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = ["id", "name", "slug", "logo_url"]


class CategorySerializer(serializers.ModelSerializer):
    sports = SportSerializer(many=True, read_only=True)

    class Meta:
        model = Category
        fields = ["id", "name", "slug", "sports"]


# ---------------------------------------------------------------------------
# Product sub-resource serializers
# ---------------------------------------------------------------------------


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ["id", "image_url", "alt_text", "display_order"]


class ProductVariantSerializer(serializers.ModelSerializer):
    discount_percent = serializers.SerializerMethodField()

    class Meta:
        model = ProductVariant
        fields = [
            "id",
            "sku",
            "size",
            "colour",
            "mrp",
            "selling_price",
            "discount_percent",
            "in_stock",
        ]

    def get_discount_percent(self, obj) -> float | None:
        """Return rounded discount % or None when MRP is zero/missing."""
        if obj.mrp and obj.mrp > 0:
            discount = ((obj.mrp - obj.selling_price) / obj.mrp) * 100
            return round(float(discount), 1)
        return None


# ---------------------------------------------------------------------------
# Product serializers — list vs detail (two separate shapes)
# ---------------------------------------------------------------------------


class ProductListSerializer(serializers.ModelSerializer):
    """Compact representation for catalogue list views."""

    brand = BrandSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    sports = SportSerializer(many=True, read_only=True)
    min_price = serializers.SerializerMethodField()
    in_stock = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "slug",
            "brand",
            "category",
            "sports",
            "thumbnail_url",
            "min_price",
            "in_stock",
            "is_featured",
        ]

    def get_min_price(self, obj) -> float | None:
        """Lowest active selling price across variants."""
        prices = obj.variants.filter(is_active=True).values_list(
            "selling_price", flat=True
        )
        return float(min(prices)) if prices else None

    def get_in_stock(self, obj) -> bool:
        """True if at least one active variant is in stock."""
        return obj.variants.filter(is_active=True, in_stock=True).exists()


class ProductDetailSerializer(serializers.ModelSerializer):
    """Full representation including images and all variants."""

    brand = BrandSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    sports = SportSerializer(many=True, read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    variants = ProductVariantSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "slug",
            "description",
            "brand",
            "category",
            "sports",
            "thumbnail_url",
            "images",
            "variants",
            "is_featured",
            "updated_at",
        ]


# ---------------------------------------------------------------------------
# Store info serializer
# ---------------------------------------------------------------------------


class StoreInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = StoreInfo
        fields = [
            "id",
            "store_name",
            "tagline",
            "address_line1",
            "address_line2",
            "city",
            "state",
            "pincode",
            "google_maps_url",
            "phone_primary",
            "phone_secondary",
            "whatsapp_number",
            "email",
            "call_to_order_instructions",
            "opening_hours",
            "updated_at",
        ]