"""
models.py — Tectonic Fitness and Sports
Data layer: all database models for the catalogue and store info.
Each model has a single, clearly defined responsibility.
"""

from django.db import models
from django.core.validators import MinValueValidator, RegexValidator
from django.utils.text import slugify


# ---------------------------------------------------------------------------
# Lookup / reference tables
# ---------------------------------------------------------------------------


class Sport(models.Model):
    """A sport or fitness discipline (e.g. Cricket, Football, Gym & Fitness)."""

    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=110, unique=True, blank=True)
    icon_url = models.URLField(blank=True, help_text="Optional icon for the mobile UI.")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]
        verbose_name = "Sport"
        verbose_name_plural = "Sports"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Brand(models.Model):
    """A product brand (e.g. Nike, Yonex, Cosco)."""

    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=110, unique=True, blank=True)
    logo_url = models.URLField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]
        verbose_name = "Brand"
        verbose_name_plural = "Brands"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Category(models.Model):
    """
    A product category, optionally scoped to one or more sports.
    Examples: Footwear, Rackets, Protein Supplements, Protective Gear.
    """

    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=110, unique=True, blank=True)
    sports = models.ManyToManyField(
        Sport,
        blank=True,
        related_name="categories",
        help_text="Sports this category is relevant to.",
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]
        verbose_name = "Category"
        verbose_name_plural = "Categories"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


# ---------------------------------------------------------------------------
# Core catalogue
# ---------------------------------------------------------------------------


class Product(models.Model):
    """
    A catalogue product.  Pricing and stock are tracked on ProductVariant,
    not here, because the same product can come in multiple sizes/colours.
    """

    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    description = models.TextField(blank=True)
    brand = models.ForeignKey(
        Brand,
        on_delete=models.PROTECT,
        related_name="products",
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name="products",
    )
    sports = models.ManyToManyField(
        Sport,
        blank=True,
        related_name="products",
        help_text="Sports this product is used for.",
    )
    thumbnail_url = models.URLField(blank=True)
    is_active = models.BooleanField(default=True)
    is_featured = models.BooleanField(
        default=False, help_text="Highlight on the app home screen."
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]
        verbose_name = "Product"
        verbose_name_plural = "Products"
        indexes = [
            models.Index(fields=["brand"]),
            models.Index(fields=["category"]),
            models.Index(fields=["is_active", "is_featured"]),
        ]

    def save(self, *args, **kwargs):
        if not self.slug:
            brand_id = getattr(self, "brand_id", None)
            base_slug = slugify(
                f"{self.brand}-{self.name}" if brand_id else self.name
            )
            self.slug = base_slug
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.brand} – {self.name}"


class ProductImage(models.Model):
    """Additional gallery images for a product."""

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="images",
    )
    image_url = models.URLField()
    alt_text = models.CharField(max_length=200, blank=True)
    display_order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ["display_order"]
        verbose_name = "Product Image"
        verbose_name_plural = "Product Images"

    def __str__(self):
        return f"Image for {self.product.name} (order {self.display_order})"


class ProductVariant(models.Model):
    """
    A specific, purchasable variant of a product.
    Carries its own SKU, price, size, colour, and stock flag.
    """

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="variants",
    )
    sku = models.CharField(
        max_length=80,
        unique=True,
        validators=[
            RegexValidator(
                r"^[A-Za-z0-9\-_]+$",
                "SKU may only contain letters, digits, hyphens, and underscores.",
            )
        ],
    )
    size = models.CharField(max_length=50, blank=True, help_text="e.g. S, M, L, 7, 42")
    colour = models.CharField(max_length=80, blank=True)
    mrp = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text="Maximum Retail Price (INR).",
    )
    selling_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text="In-store selling price (INR).",
    )
    in_stock = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["product", "size", "colour"]
        verbose_name = "Product Variant"
        verbose_name_plural = "Product Variants"
        indexes = [
            models.Index(fields=["in_stock", "is_active"]),
        ]

    def __str__(self):
        parts = [self.product.name, self.sku]
        if self.size:
            parts.append(f"Size: {self.size}")
        if self.colour:
            parts.append(self.colour)
        return " | ".join(parts)


# ---------------------------------------------------------------------------
# Store information (editable via admin — no hardcoding)
# ---------------------------------------------------------------------------


class StoreInfo(models.Model):
    """
    Singleton-style model for dynamic store contact & delivery details.
    Only one active record should exist; the API returns that record.
    """

    store_name = models.CharField(max_length=200, default="Tectonic Fitness and Sports")
    tagline = models.CharField(max_length=300, blank=True)
    address_line1 = models.CharField(max_length=200)
    address_line2 = models.CharField(max_length=200, blank=True)
    city = models.CharField(max_length=100, default="Mumbai")
    state = models.CharField(max_length=100, default="Maharashtra")
    pincode = models.CharField(max_length=10)
    google_maps_url = models.URLField(blank=True)
    phone_primary = models.CharField(max_length=20)
    phone_secondary = models.CharField(max_length=20, blank=True)
    whatsapp_number = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    call_to_order_instructions = models.TextField(
        help_text=(
            "Instructions shown to customers who want to order/enquire. "
            "e.g. 'Call or WhatsApp us to check stock and arrange delivery.'"
        )
    )
    opening_hours = models.TextField(
        blank=True,
        help_text="Human-readable opening hours, e.g. 'Mon–Sat: 9 AM – 9 PM'.",
    )
    is_active = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Store Info"
        verbose_name_plural = "Store Info"

    def __str__(self):
        return self.store_name
