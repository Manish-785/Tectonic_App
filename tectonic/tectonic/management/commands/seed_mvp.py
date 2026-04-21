from decimal import Decimal

from django.core.management.base import BaseCommand
from django.db import transaction

from tectonic.models import (
    Brand,
    Category,
    Product,
    ProductImage,
    ProductVariant,
    Sport,
    StoreInfo,
)


class Command(BaseCommand):
    help = "Seed the database with MVP mock catalogue data."

    @transaction.atomic
    def handle(self, *args, **options):
        sports = self._create_sports()
        categories = self._create_categories(sports)
        brands = self._create_brands()
        self._create_store_info()
        self._create_products(brands, categories, sports)
        self.stdout.write(
            self.style.SUCCESS("MVP mock data is ready. You can now browse the catalogue.")
        )

    def _create_sports(self) -> dict[str, Sport]:
        sport_specs = [
            {
                "name": "Gym Fitness",
                "icon_url": "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=256",
            },
            {
                "name": "Cricket",
                "icon_url": "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&q=80&w=256",
            },
            {
                "name": "Football",
                "icon_url": "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&q=80&w=256",
            },
            {
                "name": "Badminton",
                "icon_url": "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&q=80&w=256",
            },
        ]

        sports: dict[str, Sport] = {}
        for spec in sport_specs:
            sport, _ = Sport.objects.get_or_create(
                slug=spec["name"].lower().replace(" ", "-"),
                defaults=spec,
            )
            for field, value in spec.items():
                setattr(sport, field, value)
            sport.is_active = True
            sport.save()
            sports[sport.slug] = sport
        return sports

    def _create_categories(self, sports: dict[str, Sport]) -> dict[str, Category]:
        category_specs = [
            {"name": "Protein", "sports": [sports["gym-fitness"]]},
            {
                "name": "Gear",
                "sports": [sports["gym-fitness"], sports["cricket"], sports["football"]],
            },
            {
                "name": "Footwear",
                "sports": [sports["cricket"], sports["football"], sports["badminton"]],
            },
        ]

        categories: dict[str, Category] = {}
        for spec in category_specs:
            category, _ = Category.objects.get_or_create(name=spec["name"])
            category.is_active = True
            category.save()
            category.sports.set(spec["sports"])
            categories[category.slug] = category
        return categories

    def _create_brands(self) -> dict[str, Brand]:
        brand_specs = [
            {
                "name": "Optimum Nutrition",
                "logo_url": "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&q=80&w=256",
            },
            {
                "name": "Rogue Fitness",
                "logo_url": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=256",
            },
            {
                "name": "Yonex",
                "logo_url": "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&q=80&w=256",
            },
            {
                "name": "Nike",
                "logo_url": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=256",
            },
        ]

        brands: dict[str, Brand] = {}
        for spec in brand_specs:
            brand, _ = Brand.objects.get_or_create(name=spec["name"])
            brand.logo_url = spec["logo_url"]
            brand.is_active = True
            brand.save()
            brands[brand.slug] = brand
        return brands

    def _create_store_info(self) -> None:
        StoreInfo.objects.update_or_create(
            store_name="Tectonic Fitness and Sports",
            defaults={
                "tagline": "Fuel hostel athletes with premium gear, quick support, and campus-friendly fulfilment.",
                "address_line1": "Near IIT Bombay Main Gate",
                "address_line2": "Powai",
                "city": "Mumbai",
                "state": "Maharashtra",
                "pincode": "400076",
                "google_maps_url": "https://maps.google.com/?q=IIT+Bombay+Main+Gate",
                "phone_primary": "9876543210",
                "phone_secondary": "9988776655",
                "whatsapp_number": "919876543210",
                "email": "hello@tectonic.fit",
                "call_to_order_instructions": "Browse online, then call or WhatsApp us to confirm stock and arrange campus delivery.",
                "opening_hours": "Mon-Sat: 9 AM - 9 PM | Sun: 10 AM - 6 PM",
                "is_active": True,
            },
        )

    def _create_products(
        self,
        brands: dict[str, Brand],
        categories: dict[str, Category],
        sports: dict[str, Sport],
    ) -> None:
        product_specs = [
            {
                "name": "Gold Standard Whey 2lb",
                "brand": brands["optimum-nutrition"],
                "category": categories["protein"],
                "sports": [sports["gym-fitness"]],
                "thumbnail_url": "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&q=80&w=900",
                "description": "Fast-mixing whey protein for gym sessions, sports recovery, and hostel-friendly nutrition.",
                "is_featured": True,
                "variants": [
                    {
                        "sku": "ON-WHEY-2LB-DBL",
                        "size": "2 lb",
                        "colour": "Double Rich Chocolate",
                        "mrp": Decimal("4899.00"),
                        "selling_price": Decimal("4299.00"),
                        "in_stock": True,
                    }
                ],
            },
            {
                "name": "Explosive Pre-Workout",
                "brand": brands["optimum-nutrition"],
                "category": categories["protein"],
                "sports": [sports["gym-fitness"]],
                "thumbnail_url": "https://images.unsplash.com/photo-1550345332-09e3ac987658?auto=format&fit=crop&q=80&w=900",
                "description": "A high-energy pre-workout blend built for early lifts and late-night training blocks.",
                "is_featured": True,
                "variants": [
                    {
                        "sku": "ON-PRE-300-BLU",
                        "size": "300 g",
                        "colour": "Blue Raspberry",
                        "mrp": Decimal("2499.00"),
                        "selling_price": Decimal("2199.00"),
                        "in_stock": True,
                    }
                ],
            },
            {
                "name": "Micronized Creatine",
                "brand": brands["optimum-nutrition"],
                "category": categories["protein"],
                "sports": [sports["gym-fitness"]],
                "thumbnail_url": "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=900",
                "description": "Pure creatine monohydrate for better power output, repeated sprint performance, and recovery support.",
                "is_featured": False,
                "variants": [
                    {
                        "sku": "ON-CRT-250-UNF",
                        "size": "250 g",
                        "colour": "Unflavoured",
                        "mrp": Decimal("1499.00"),
                        "selling_price": Decimal("1299.00"),
                        "in_stock": True,
                    }
                ],
            },
            {
                "name": "Recovery Protein Bar Box",
                "brand": brands["optimum-nutrition"],
                "category": categories["protein"],
                "sports": [sports["gym-fitness"], sports["football"], sports["cricket"]],
                "thumbnail_url": "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?auto=format&fit=crop&q=80&w=900",
                "description": "A hostel-drawer staple with balanced protein and carbs for quick post-session refuelling.",
                "is_featured": False,
                "variants": [
                    {
                        "sku": "ON-BAR-BOX-12",
                        "size": "12 Pack",
                        "colour": "Chocolate Peanut",
                        "mrp": Decimal("2199.00"),
                        "selling_price": Decimal("1899.00"),
                        "in_stock": True,
                    }
                ],
            },
            {
                "name": "Pro Grip Lifting Gloves",
                "brand": brands["rogue-fitness"],
                "category": categories["gear"],
                "sports": [sports["gym-fitness"]],
                "thumbnail_url": "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&q=80&w=900",
                "description": "Padded gloves that protect your palms during heavy pulls, presses, and assisted bodyweight work.",
                "is_featured": True,
                "variants": [
                    {
                        "sku": "RG-GLOVE-M-BLK",
                        "size": "M",
                        "colour": "Black",
                        "mrp": Decimal("999.00"),
                        "selling_price": Decimal("849.00"),
                        "in_stock": True,
                    }
                ],
            },
            {
                "name": "Resistance Band Set",
                "brand": brands["rogue-fitness"],
                "category": categories["gear"],
                "sports": [sports["gym-fitness"], sports["football"]],
                "thumbnail_url": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=900",
                "description": "Portable resistance bands for warm-ups, mobility drills, and cramped-room strength sessions.",
                "is_featured": False,
                "variants": [
                    {
                        "sku": "RG-BAND-SET-5",
                        "size": "5 Bands",
                        "colour": "Multi",
                        "mrp": Decimal("1799.00"),
                        "selling_price": Decimal("1499.00"),
                        "in_stock": True,
                    }
                ],
            },
            {
                "name": "Shaker Bottle Pro",
                "brand": brands["rogue-fitness"],
                "category": categories["gear"],
                "sports": [sports["gym-fitness"]],
                "thumbnail_url": "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?auto=format&fit=crop&q=80&w=900",
                "description": "Leak-resistant shaker bottle for protein mixes, hydration, and everyday campus carry.",
                "is_featured": False,
                "variants": [
                    {
                        "sku": "RG-SHK-700-BLK",
                        "size": "700 ml",
                        "colour": "Black",
                        "mrp": Decimal("599.00"),
                        "selling_price": Decimal("449.00"),
                        "in_stock": True,
                    }
                ],
            },
            {
                "name": "Cricket Match Ball",
                "brand": brands["nike"],
                "category": categories["gear"],
                "sports": [sports["cricket"]],
                "thumbnail_url": "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&q=80&w=900",
                "description": "Durable leather cricket ball for net practice and hostel tournament matches.",
                "is_featured": False,
                "variants": [
                    {
                        "sku": "NK-CR-BALL-RED",
                        "size": "Senior",
                        "colour": "Red",
                        "mrp": Decimal("699.00"),
                        "selling_price": Decimal("599.00"),
                        "in_stock": True,
                    }
                ],
            },
            {
                "name": "Cricket Batting Gloves",
                "brand": brands["nike"],
                "category": categories["gear"],
                "sports": [sports["cricket"]],
                "thumbnail_url": "https://images.unsplash.com/photo-1526676037777-05a232554f77?auto=format&fit=crop&q=80&w=900",
                "description": "Lightweight batting gloves with extra palm cushioning for net sessions and weekend tournaments.",
                "is_featured": False,
                "variants": [
                    {
                        "sku": "NK-CR-GLV-M-WHT",
                        "size": "M",
                        "colour": "White",
                        "mrp": Decimal("1799.00"),
                        "selling_price": Decimal("1549.00"),
                        "in_stock": True,
                    }
                ],
            },
            {
                "name": "Astroturf Football Boots",
                "brand": brands["nike"],
                "category": categories["footwear"],
                "sports": [sports["football"]],
                "thumbnail_url": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=900",
                "description": "Lightweight turf boots designed for quick cuts, stable landings, and all-evening hostel fixtures.",
                "is_featured": True,
                "variants": [
                    {
                        "sku": "NK-FT-BOOT-8-BLK",
                        "size": "8",
                        "colour": "Black",
                        "mrp": Decimal("5499.00"),
                        "selling_price": Decimal("4799.00"),
                        "in_stock": True,
                    }
                ],
            },
            {
                "name": "Training Running Shoes",
                "brand": brands["nike"],
                "category": categories["footwear"],
                "sports": [sports["gym-fitness"], sports["football"]],
                "thumbnail_url": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=900",
                "description": "Daily trainers with stable cushioning for track laps, gym circuits, and long campus walks.",
                "is_featured": True,
                "variants": [
                    {
                        "sku": "NK-RUN-9-GRY",
                        "size": "9",
                        "colour": "Grey",
                        "mrp": Decimal("6299.00"),
                        "selling_price": Decimal("5599.00"),
                        "in_stock": True,
                    }
                ],
            },
            {
                "name": "Arcsaber Badminton Racket",
                "brand": brands["yonex"],
                "category": categories["gear"],
                "sports": [sports["badminton"]],
                "thumbnail_url": "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&q=80&w=900",
                "description": "Balanced racket built for controlled clears, confident net play, and solid all-round campus sessions.",
                "is_featured": False,
                "variants": [
                    {
                        "sku": "YX-ARC-4U-G5",
                        "size": "4U G5",
                        "colour": "Red",
                        "mrp": Decimal("6599.00"),
                        "selling_price": Decimal("5999.00"),
                        "in_stock": True,
                    }
                ],
            },
            {
                "name": "Feather Shuttle Tube",
                "brand": brands["yonex"],
                "category": categories["gear"],
                "sports": [sports["badminton"]],
                "thumbnail_url": "https://images.unsplash.com/photo-1613918431703-aa508a48bfc4?auto=format&fit=crop&q=80&w=900",
                "description": "Reliable tournament-style shuttlecocks for competitive rallies and regular court practice.",
                "is_featured": False,
                "variants": [
                    {
                        "sku": "YX-SHUTTLE-12-WHT",
                        "size": "12 Pack",
                        "colour": "White",
                        "mrp": Decimal("1699.00"),
                        "selling_price": Decimal("1499.00"),
                        "in_stock": True,
                    }
                ],
            },
            {
                "name": "Court Badminton Shoes",
                "brand": brands["yonex"],
                "category": categories["footwear"],
                "sports": [sports["badminton"]],
                "thumbnail_url": "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&q=80&w=900",
                "description": "Non-marking court shoes with responsive support for quick directional changes and long rallies.",
                "is_featured": True,
                "variants": [
                    {
                        "sku": "YX-COURT-8-BLU",
                        "size": "8",
                        "colour": "Blue",
                        "mrp": Decimal("5899.00"),
                        "selling_price": Decimal("5299.00"),
                        "in_stock": True,
                    }
                ],
            },
        ]

        for spec in product_specs:
            product, _ = Product.objects.update_or_create(
                slug=f"{spec['brand'].slug}-{spec['name'].lower().replace(' ', '-')}",
                defaults={
                    "name": spec["name"],
                    "brand": spec["brand"],
                    "category": spec["category"],
                    "description": spec["description"],
                    "thumbnail_url": spec["thumbnail_url"],
                    "is_active": True,
                    "is_featured": spec["is_featured"],
                },
            )
            product.sports.set(spec["sports"])

            ProductImage.objects.update_or_create(
                product=product,
                display_order=0,
                defaults={
                    "image_url": spec["thumbnail_url"],
                    "alt_text": spec["name"],
                },
            )

            for variant_spec in spec["variants"]:
                ProductVariant.objects.update_or_create(
                    sku=variant_spec["sku"],
                    defaults={
                        "product": product,
                        **variant_spec,
                        "is_active": True,
                    },
                )
