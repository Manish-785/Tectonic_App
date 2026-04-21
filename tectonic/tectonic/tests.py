"""
tests.py — Tectonic Fitness and Sports
Comprehensive test suite covering:
  • Model creation and validation
  • Derived model properties (slug auto-generation)
  • Serializer computed fields
  • All API endpoints: status codes, shapes, filtering, search, pagination
"""

from decimal import Decimal
from typing import Any, cast

from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from .models import (
    Brand,
    Category,
    Product,
    ProductImage,
    ProductVariant,
    Sport,
    StoreInfo,
)
from .serializers import ProductListSerializer, ProductVariantSerializer


# ---------------------------------------------------------------------------
# Helpers — reusable fixture factories
# ---------------------------------------------------------------------------


def make_sport(name="Cricket", **kwargs) -> Sport:
    return Sport.objects.create(name=name, **kwargs)


def make_brand(name="Yonex", **kwargs) -> Brand:
    return Brand.objects.create(name=name, **kwargs)


def make_category(name="Rackets", **kwargs) -> Category:
    return Category.objects.create(name=name, **kwargs)


def make_product(
    name="Voltric Z-Force II",
    brand=None,
    category=None,
    is_active=True,
    is_featured=False,
    **kwargs,
) -> Product:
    brand = brand or make_brand()
    category = category or make_category()
    return Product.objects.create(
        name=name,
        brand=brand,
        category=category,
        is_active=is_active,
        is_featured=is_featured,
        **kwargs,
    )


def make_variant(
    product,
    sku="SKU-001",
    mrp=Decimal("2499.00"),
    selling_price=Decimal("1999.00"),
    in_stock=True,
    **kwargs,
) -> ProductVariant:
    return ProductVariant.objects.create(
        product=product,
        sku=sku,
        mrp=mrp,
        selling_price=selling_price,
        in_stock=in_stock,
        **kwargs,
    )


def make_store_info(**kwargs) -> StoreInfo:
    defaults = dict(
        store_name="Tectonic Fitness and Sports",
        address_line1="Outside IIT Main Gate",
        city="Mumbai",
        state="Maharashtra",
        pincode="400076",
        phone_primary="9876543210",
        call_to_order_instructions="Call or WhatsApp to check availability.",
        is_active=True,
    )
    defaults.update(kwargs)
    return StoreInfo.objects.create(**defaults)


# ---------------------------------------------------------------------------
# Model tests
# ---------------------------------------------------------------------------


class SportModelTest(TestCase):
    def test_sport_creation(self):
        sport = make_sport("Football")
        self.assertEqual(sport.name, "Football")
        self.assertTrue(sport.is_active)

    def test_slug_auto_generated(self):
        sport = make_sport("Table Tennis")
        self.assertEqual(sport.slug, "table-tennis")

    def test_slug_not_overwritten_on_update(self):
        sport = make_sport("Basketball")
        original_slug = sport.slug
        sport.name = "Basketball Pro"
        sport.save()
        # slug should remain unchanged once set
        self.assertEqual(sport.slug, original_slug)

    def test_str_representation(self):
        sport = make_sport("Hockey")
        self.assertEqual(str(sport), "Hockey")


class BrandModelTest(TestCase):
    def test_brand_creation(self):
        brand = make_brand("Nike")
        self.assertEqual(brand.name, "Nike")

    def test_slug_auto_generated(self):
        brand = make_brand("Under Armour")
        self.assertEqual(brand.slug, "under-armour")

    def test_str_representation(self):
        brand = make_brand("Adidas")
        self.assertEqual(str(brand), "Adidas")


class CategoryModelTest(TestCase):
    def test_category_creation(self):
        cat = make_category("Footwear")
        self.assertEqual(cat.name, "Footwear")

    def test_slug_auto_generated(self):
        cat = make_category("Gym Equipment")
        self.assertEqual(cat.slug, "gym-equipment")

    def test_category_sports_m2m(self):
        sport = make_sport("Gym & Fitness")
        cat = make_category("Protein Supplements")
        cat.sports.add(sport)
        self.assertIn(sport, cat.sports.all())


class ProductModelTest(TestCase):
    def setUp(self):
        self.brand = make_brand("Cosco")
        self.category = make_category("Balls")

    def test_product_creation(self):
        product = make_product(
            name="Cosco Cricket Ball",
            brand=self.brand,
            category=self.category,
        )
        self.assertEqual(product.name, "Cosco Cricket Ball")
        self.assertTrue(product.is_active)

    def test_product_slug_includes_brand(self):
        product = make_product(
            name="Football Pro",
            brand=self.brand,
            category=self.category,
        )
        self.assertIn("cosco", product.slug)

    def test_product_str_representation(self):
        product = make_product(brand=self.brand, category=self.category)
        self.assertIn("Cosco", str(product))

    def test_inactive_product_flag(self):
        product = make_product(
            brand=self.brand, category=self.category, is_active=False
        )
        self.assertFalse(product.is_active)


class ProductVariantModelTest(TestCase):
    def setUp(self):
        self.product = make_product()

    def test_variant_creation(self):
        variant = make_variant(self.product, sku="ABC-001", size="M")
        self.assertEqual(variant.sku, "ABC-001")
        self.assertEqual(variant.size, "M")
        self.assertTrue(variant.in_stock)

    def test_invalid_sku_raises_validation_error(self):
        from django.core.exceptions import ValidationError

        variant = ProductVariant(
            product=self.product,
            sku="bad sku with spaces",
            mrp=Decimal("500.00"),
            selling_price=Decimal("400.00"),
        )
        with self.assertRaises(ValidationError):
            variant.full_clean()

    def test_str_representation(self):
        variant = make_variant(self.product, sku="XYZ-42", size="L", colour="Red")
        self.assertIn("XYZ-42", str(variant))
        self.assertIn("Size: L", str(variant))


class StoreInfoModelTest(TestCase):
    def test_store_info_creation(self):
        store = make_store_info()
        self.assertEqual(store.store_name, "Tectonic Fitness and Sports")
        self.assertTrue(store.is_active)

    def test_str_representation(self):
        store = make_store_info()
        self.assertEqual(str(store), "Tectonic Fitness and Sports")


# ---------------------------------------------------------------------------
# Serializer unit tests
# ---------------------------------------------------------------------------


class ProductVariantSerializerTest(TestCase):
    def test_discount_percent_calculated_correctly(self):
        product = make_product()
        variant = make_variant(
            product,
            sku="DISC-001",
            mrp=Decimal("1000.00"),
            selling_price=Decimal("750.00"),
        )
        data = cast(dict[str, object], ProductVariantSerializer(variant).data)
        self.assertEqual(data["discount_percent"], 25.0)

    def test_discount_percent_zero_mrp_returns_none(self):
        product = make_product()
        variant = make_variant(
            product, sku="DISC-002", mrp=Decimal("0.00"), selling_price=Decimal("0.00")
        )
        data = cast(dict[str, object], ProductVariantSerializer(variant).data)
        self.assertIsNone(data["discount_percent"])


class ProductListSerializerTest(TestCase):
    def setUp(self):
        self.product = make_product()
        make_variant(
            self.product, sku="V-001", selling_price=Decimal("999.00"), in_stock=True
        )
        make_variant(
            self.product, sku="V-002", selling_price=Decimal("1299.00"), in_stock=False
        )

    def test_min_price_returns_lowest(self):
        data = cast(dict[str, object], ProductListSerializer(self.product).data)
        self.assertEqual(data["min_price"], 999.0)

    def test_in_stock_true_when_any_variant_available(self):
        data = cast(dict[str, object], ProductListSerializer(self.product).data)
        self.assertTrue(data["in_stock"])

    def test_in_stock_false_when_all_out_of_stock(self):
        cast(Any, self.product).variants.update(in_stock=False)
        data = cast(dict[str, object], ProductListSerializer(self.product).data)
        self.assertFalse(data["in_stock"])


# ---------------------------------------------------------------------------
# API endpoint tests
# ---------------------------------------------------------------------------


class SportAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()
        make_sport("Cricket")
        make_sport("Badminton")
        make_sport("Swimming", is_active=False)

    def test_list_returns_200(self):
        url = reverse("catalogue:sport-list")
        response = cast(Any, self.client.get(url))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_list_excludes_inactive_sports(self):
        url = reverse("catalogue:sport-list")
        response = cast(Any, self.client.get(url))
        names = [s["name"] for s in response.data]
        self.assertNotIn("Swimming", names)
        self.assertIn("Cricket", names)

    def test_search_filters_by_name(self):
        url = reverse("catalogue:sport-list")
        response = cast(Any, self.client.get(url, {"search": "Badminton"}))
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["name"], "Badminton")


class BrandAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()
        make_brand("Nike")
        make_brand("Puma")
        make_brand("Discontinued Brand", is_active=False)

    def test_list_returns_200(self):
        url = reverse("catalogue:brand-list")
        response = cast(Any, self.client.get(url))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_list_excludes_inactive_brands(self):
        url = reverse("catalogue:brand-list")
        response = cast(Any, self.client.get(url))
        names = [b["name"] for b in response.data]
        self.assertNotIn("Discontinued Brand", names)

    def test_list_contains_slug(self):
        url = reverse("catalogue:brand-list")
        response = cast(Any, self.client.get(url))
        for brand in response.data:
            self.assertIn("slug", brand)


class CategoryAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()
        make_category("Footwear")
        make_category("Apparel")

    def test_list_returns_200(self):
        url = reverse("catalogue:category-list")
        response = cast(Any, self.client.get(url))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_response_contains_sports(self):
        url = reverse("catalogue:category-list")
        response = cast(Any, self.client.get(url))
        for cat in response.data:
            self.assertIn("sports", cat)


class ProductListAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.cricket = make_sport("Cricket")
        self.badminton = make_sport("Badminton")
        self.nike = make_brand("Nike")
        self.yonex = make_brand("Yonex")
        self.footwear = make_category("Footwear")
        self.rackets = make_category("Rackets")

        # Active cricket product
        self.cricket_product = make_product(
            name="Cricket Shoes Pro",
            brand=self.nike,
            category=self.footwear,
        )
        self.cricket_product.sports.add(self.cricket)
        make_variant(self.cricket_product, sku="CP-001")

        # Active badminton product
        self.badminton_product = make_product(
            name="Yonex Arcsaber 11",
            brand=self.yonex,
            category=self.rackets,
        )
        self.badminton_product.sports.add(self.badminton)
        make_variant(self.badminton_product, sku="YA-001")

        # Inactive product — should never appear
        self.inactive = make_product(
            name="Hidden Item",
            brand=self.nike,
            category=self.footwear,
            is_active=False,
        )

    def test_list_returns_200(self):
        response = cast(Any, self.client.get(reverse("catalogue:product-list")))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_list_excludes_inactive_products(self):
        response = cast(Any, self.client.get(reverse("catalogue:product-list")))
        names = [p["name"] for p in response.data["results"]]
        self.assertNotIn("Hidden Item", names)

    def test_pagination_keys_present(self):
        response = cast(Any, self.client.get(reverse("catalogue:product-list")))
        for key in ("count", "next", "previous", "results"):
            self.assertIn(key, response.data)


class AdminDashboardAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.sport = make_sport("Gym Fitness")
        self.brand = make_brand("Nike")
        self.category = make_category("Footwear")
        self.category.sports.add(self.sport)

    def test_store_info_can_be_created_via_dashboard_api(self):
        response = cast(
            Any,
            self.client.put(
                reverse("catalogue:admin-store"),
                {
                    "store_name": "Tectonic Fitness and Sports",
                    "tagline": "Built for campus athletes",
                    "address_line1": "Main Gate",
                    "address_line2": "Powai",
                    "city": "Mumbai",
                    "state": "Maharashtra",
                    "pincode": "400076",
                    "google_maps_url": "",
                    "phone_primary": "9876543210",
                    "phone_secondary": "",
                    "whatsapp_number": "",
                    "email": "hello@example.com",
                    "call_to_order_instructions": "Call us first.",
                    "opening_hours": "9 AM - 9 PM",
                    "is_active": True,
                },
                format="json",
            ),
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(StoreInfo.objects.count(), 1)

    def test_product_can_be_created_via_dashboard_api(self):
        response = cast(
            Any,
            self.client.post(
                reverse("catalogue:admin-product-list"),
                {
                    "name": "Campus Trainer",
                    "description": "Daily training shoe",
                    "brand_id": self.brand.id,
                    "category_id": self.category.id,
                    "sport_ids": [self.sport.id],
                    "thumbnail_url": "https://example.com/shoe.jpg",
                    "is_active": True,
                    "is_featured": True,
                    "sku": "SHOE-001",
                    "size": "9",
                    "colour": "Black",
                    "mrp": "3999.00",
                    "selling_price": "3499.00",
                    "in_stock": True,
                },
                format="json",
            ),
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Product.objects.count(), 1)
        self.assertEqual(ProductVariant.objects.count(), 1)
        self.assertEqual(ProductImage.objects.count(), 1)
