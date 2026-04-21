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
            "is_active",
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


# ---------------------------------------------------------------------------
# Admin / management serializers
# ---------------------------------------------------------------------------


class AdminSportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sport
        fields = ["id", "name", "slug", "icon_url", "is_active", "created_at"]
        read_only_fields = ["id", "slug", "created_at"]


class AdminBrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = ["id", "name", "slug", "logo_url", "is_active", "created_at"]
        read_only_fields = ["id", "slug", "created_at"]


class AdminCategorySerializer(serializers.ModelSerializer):
    sports = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Sport.objects.all(), required=False
    )

    class Meta:
        model = Category
        fields = ["id", "name", "slug", "sports", "is_active", "created_at"]
        read_only_fields = ["id", "slug", "created_at"]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["sports"] = SportSerializer(instance.sports.all(), many=True).data
        return data


class AdminStoreInfoSerializer(serializers.ModelSerializer):
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
            "is_active",
            "updated_at",
        ]
        read_only_fields = ["id", "updated_at"]


class AdminProductUpsertSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    name = serializers.CharField(max_length=200)
    description = serializers.CharField(allow_blank=True, required=False)
    brand_id = serializers.PrimaryKeyRelatedField(
        queryset=Brand.objects.all(), source="brand"
    )
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), source="category"
    )
    sport_ids = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Sport.objects.all(), source="sports", required=False
    )
    thumbnail_url = serializers.URLField(allow_blank=True, required=False)
    is_active = serializers.BooleanField(required=False, default=True)
    is_featured = serializers.BooleanField(required=False, default=False)
    sku = serializers.CharField(max_length=80)
    size = serializers.CharField(max_length=50, allow_blank=True, required=False)
    colour = serializers.CharField(max_length=80, allow_blank=True, required=False)
    mrp = serializers.DecimalField(max_digits=10, decimal_places=2)
    selling_price = serializers.DecimalField(max_digits=10, decimal_places=2)
    in_stock = serializers.BooleanField(required=False, default=True)

    def create(self, validated_data):
        sports = validated_data.pop("sports", [])
        variant_data = {
            "sku": validated_data.pop("sku"),
            "size": validated_data.pop("size", ""),
            "colour": validated_data.pop("colour", ""),
            "mrp": validated_data.pop("mrp"),
            "selling_price": validated_data.pop("selling_price"),
            "in_stock": validated_data.pop("in_stock", True),
            "is_active": True,
        }

        product = Product.objects.create(**validated_data)
        product.sports.set(sports)

        if product.thumbnail_url:
            ProductImage.objects.update_or_create(
                product=product,
                display_order=0,
                defaults={
                    "image_url": product.thumbnail_url,
                    "alt_text": product.name,
                },
            )

        ProductVariant.objects.create(product=product, **variant_data)
        return product

    def update(self, instance, validated_data):
        sports = validated_data.pop("sports", None)
        variant_data = {
            "sku": validated_data.pop("sku"),
            "size": validated_data.pop("size", ""),
            "colour": validated_data.pop("colour", ""),
            "mrp": validated_data.pop("mrp"),
            "selling_price": validated_data.pop("selling_price"),
            "in_stock": validated_data.pop("in_stock", True),
            "is_active": True,
        }

        for field, value in validated_data.items():
            setattr(instance, field, value)
        instance.save()

        if sports is not None:
            instance.sports.set(sports)

        if instance.thumbnail_url:
            ProductImage.objects.update_or_create(
                product=instance,
                display_order=0,
                defaults={
                    "image_url": instance.thumbnail_url,
                    "alt_text": instance.name,
                },
            )

        variant = instance.variants.order_by("id").first()
        if variant is None:
            ProductVariant.objects.create(product=instance, **variant_data)
        else:
            for field, value in variant_data.items():
                setattr(variant, field, value)
            variant.save()

        return instance
