"""
views.py — Tectonic Fitness and Sports
Views are intentionally thin: they handle HTTP concerns only and
delegate every query/business decision to services.py.
"""

from django.http import Http404
from django.db.models import QuerySet
from typing import cast
from rest_framework import filters, generics, status
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.views import APIView

from . import services
from .models import Brand, Category, Product, Sport, StoreInfo
from .serializers import (
    AdminBrandSerializer,
    AdminCategorySerializer,
    AdminProductUpsertSerializer,
    AdminSportSerializer,
    AdminStoreInfoSerializer,
    BrandSerializer,
    CategorySerializer,
    ProductDetailSerializer,
    ProductListSerializer,
    SportSerializer,
    StoreInfoSerializer,
)


# ---------------------------------------------------------------------------
# Pagination
# ---------------------------------------------------------------------------


class CataloguePagination(PageNumberPagination):
    """Standard paginator: 20 items per page, configurable up to 100."""

    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100


# ---------------------------------------------------------------------------
# Sport endpoints
# ---------------------------------------------------------------------------


class SportListView(generics.ListAPIView[Sport]):
    """GET /sports/ — list all active sports."""

    serializer_class = SportSerializer
    queryset = cast(QuerySet[Sport], services.get_active_sports())
    filter_backends = [filters.SearchFilter]
    search_fields = ["name"]


# ---------------------------------------------------------------------------
# Brand endpoints
# ---------------------------------------------------------------------------


class BrandListView(generics.ListAPIView[Brand]):
    """GET /brands/ — list all active brands."""

    serializer_class = BrandSerializer
    queryset = cast(QuerySet[Brand], services.get_active_brands())
    filter_backends = [filters.SearchFilter]
    search_fields = ["name"]


# ---------------------------------------------------------------------------
# Category endpoints
# ---------------------------------------------------------------------------


class CategoryListView(generics.ListAPIView[Category]):
    """GET /categories/ — list all active categories."""

    serializer_class = CategorySerializer
    queryset = cast(QuerySet[Category], services.get_active_categories())
    filter_backends = [filters.SearchFilter]
    search_fields = ["name"]


# ---------------------------------------------------------------------------
# Product endpoints
# ---------------------------------------------------------------------------


class ProductListView(generics.ListAPIView[Product]):
    """
    GET /products/
    Optional query params:
      sport    — filter by sport slug
      brand    — filter by brand slug
      category — filter by category slug
      in_stock — '1' to show only in-stock items
      search   — full-text search on name / description
    """

    serializer_class = ProductListSerializer
    pagination_class = CataloguePagination
    queryset = cast(QuerySet[Product], services.get_active_products())
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name", "description", "brand__name", "category__name"]
    ordering_fields = ["name", "created_at"]
    ordering = ["name"]

    def get(self, request, *args, **kwargs):
        qs = cast(QuerySet[Product], services.get_active_products())
        qs = self._apply_filters(qs)
        qs = self.filter_queryset(qs)
        page = self.paginate_queryset(qs)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def _apply_filters(self, qs: QuerySet[Product]) -> QuerySet[Product]:
        """Apply optional query-param filters. Single responsibility per call."""
        params = self.request.GET

        sport = params.get("sport")
        if sport:
            qs = services.filter_products_by_sport(qs, sport)

        brand = params.get("brand")
        if brand:
            qs = services.filter_products_by_brand(qs, brand)

        category = params.get("category")
        if category:
            qs = services.filter_products_by_category(qs, category)

        if params.get("in_stock") == "1":
            qs = services.filter_products_in_stock(qs)

        return qs.distinct()


class ProductDetailView(APIView):
    """GET /products/<slug>/ — full product detail with variants and images."""

    def get(self, request, slug: str):
        try:
            product = services.get_product_by_slug(slug)
        except Exception:
            raise Http404("Product not found.")
        serializer = ProductDetailSerializer(product, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class FeaturedProductListView(generics.ListAPIView[Product]):
    """GET /products/featured/ — active featured products (no pagination)."""

    serializer_class = ProductListSerializer
    queryset = cast(QuerySet[Product], services.get_featured_products())


# ---------------------------------------------------------------------------
# Store info endpoint
# ---------------------------------------------------------------------------


class StoreInfoView(APIView):
    """
    GET /store/
    Returns dynamic store contact details and call-to-order instructions.
    Returns 503 if no active StoreInfo record has been configured.
    """

    def get(self, request):
        store = services.get_store_info()
        if store is None:
            return Response(
                {"detail": "Store information is not yet configured."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        serializer = StoreInfoSerializer(store)
        return Response(serializer.data, status=status.HTTP_200_OK)


# ---------------------------------------------------------------------------
# Admin dashboard endpoints
# ---------------------------------------------------------------------------


class AdminSportListCreateView(generics.ListCreateAPIView[Sport]):
    serializer_class = AdminSportSerializer
    queryset = Sport.objects.all().order_by("name")


class AdminBrandListCreateView(generics.ListCreateAPIView[Brand]):
    serializer_class = AdminBrandSerializer
    queryset = Brand.objects.all().order_by("name")


class AdminCategoryListCreateView(generics.ListCreateAPIView[Category]):
    serializer_class = AdminCategorySerializer
    queryset = Category.objects.all().prefetch_related("sports").order_by("name")


class AdminProductListCreateView(APIView):
    def get(self, request):
        products = Product.objects.all().select_related("brand", "category").prefetch_related(
            "sports", "images", "variants"
        )
        serializer = ProductDetailSerializer(products, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = AdminProductUpsertSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        product = serializer.save()
        return Response(
            ProductDetailSerializer(product).data,
            status=status.HTTP_201_CREATED,
        )


class AdminProductDetailView(APIView):
    def put(self, request, pk: int):
        product = Product.objects.get(pk=pk)
        serializer = AdminProductUpsertSerializer(product, data=request.data)
        serializer.is_valid(raise_exception=True)
        product = serializer.save()
        return Response(ProductDetailSerializer(product).data, status=status.HTTP_200_OK)


class AdminStoreInfoView(APIView):
    def get(self, request):
        store = StoreInfo.objects.order_by("-updated_at").first()
        if store is None:
            return Response(
                {
                    "id": None,
                    "store_name": "",
                    "tagline": "",
                    "address_line1": "",
                    "address_line2": "",
                    "city": "",
                    "state": "",
                    "pincode": "",
                    "google_maps_url": "",
                    "phone_primary": "",
                    "phone_secondary": "",
                    "whatsapp_number": "",
                    "email": "",
                    "call_to_order_instructions": "",
                    "opening_hours": "",
                    "is_active": True,
                },
                status=status.HTTP_200_OK,
            )
        return Response(AdminStoreInfoSerializer(store).data, status=status.HTTP_200_OK)

    def put(self, request):
        store = StoreInfo.objects.order_by("-updated_at").first()
        serializer = AdminStoreInfoSerializer(instance=store, data=request.data)
        serializer.is_valid(raise_exception=True)
        saved = serializer.save()
        return Response(AdminStoreInfoSerializer(saved).data, status=status.HTTP_200_OK)
