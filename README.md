# Tectonic App

This repository contains a full-stack catalogue app with:

- `frontend/`: a Next.js 16 app
- `tectonic/`: a Django 6 + Django REST Framework API

The frontend is wired to the backend catalogue API by default. On a fresh clone, you can run both locally with two terminals.

## Repo Structure

```text
Tectonic_App/
├── frontend/   Next.js frontend
└── tectonic/   Django backend
```

## What Works Today

The full-stack path currently covers the product catalogue:

- home page featured products
- catalogue listing
- product detail API consumption
- Django admin for managing products, brands, sports, categories, variants, and store info

Some frontend features are still mock-only and do not depend on the backend yet:

- login/register flow
- classes data
- cart persistence/checkout

Also note:

- the frontend falls back to mock product data if the backend is unavailable
- the backend now includes a `seed_mvp` command so a fresh clone can be populated quickly

## Prerequisites

Install these before starting:

- Node.js 20+ and `npm`
- Python 3.12+ recommended
- PowerShell on Windows

## 1. Start The Django Backend

Open a terminal in `tectonic/`.

### Create and activate a virtual environment

```powershell
cd tectonic
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

If PowerShell blocks activation, run:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned
```

### Install backend dependencies

```powershell
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

This installs the Django packages already used by the backend, including `django-cors-headers`.

### Apply migrations

```powershell
python manage.py migrate
```

### Create an admin user

```powershell
python manage.py createsuperuser
```

### Run the backend

```powershell
python manage.py runserver
```

Backend URLs:

- API root: `http://127.0.0.1:8000/api/v1/`
- Admin: `http://127.0.0.1:8000/admin/`

## 2. Seed The MVP Database

After migrations, load the included MVP mock catalogue:

```powershell
python manage.py seed_mvp
```

This creates:

- store info
- sports
- brands
- categories
- products
- product images
- product variants

You can still edit or extend the data afterwards in Django admin.

### Optional manual admin flow

If you want to create your own catalogue instead, sign in to Django admin and create records in roughly this order:

1. `Sports`
2. `Brands`
3. `Categories`
4. `Products`
5. product `Variants` and `Images`
6. `Store Info`

Important details:

- products appear in the frontend catalogue only after you create at least one active `Product`
- price and stock are driven by `ProductVariant`
- featured cards on the home page come from products with `is_featured = True`
- if you skip both seeding and manual entry, the frontend may still render because it falls back to mock data when API calls fail, but that is not true backend-backed content

## 3. Start The Next.js Frontend

Open a second terminal in `frontend/`.

### Install frontend dependencies

```powershell
cd frontend
npm install
```

### Optional environment variable

The frontend already defaults to the local Django API:

- `http://localhost:8000/api/v1`

If you want to set it explicitly, create `frontend/.env.local` with:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### Run the frontend

```powershell
npm run dev
```

Frontend URL:

- App: `http://localhost:3000`
- Admin dashboard: `http://localhost:3000/admin/dashboard`

## Local Run Checklist

For the full local stack to work end-to-end:

1. Django server running on port `8000`
2. Next.js server running on port `3000`
3. Django migrations applied
4. `python manage.py seed_mvp` has been run, or you created at least one product and one product variant in admin

## Useful Commands

### Backend

```powershell
cd tectonic
.\.venv\Scripts\Activate.ps1
python manage.py runserver
python manage.py test
python manage.py test tectonic
python manage.py seed_mvp
```

### Frontend

```powershell
cd frontend
npm run dev
npm run build
npm run lint
```

## Key API Endpoints

The frontend is built around these backend routes:

- `GET /api/v1/store/`
- `GET /api/v1/sports/`
- `GET /api/v1/brands/`
- `GET /api/v1/categories/`
- `GET /api/v1/products/`
- `GET /api/v1/products/featured/`
- `GET /api/v1/products/<slug>/`

Admin dashboard management routes:

- `GET/PUT /api/v1/admin-dashboard/store/`
- `GET/POST /api/v1/admin-dashboard/sports/`
- `GET/POST /api/v1/admin-dashboard/brands/`
- `GET/POST /api/v1/admin-dashboard/categories/`
- `GET/POST /api/v1/admin-dashboard/products/`
- `PUT /api/v1/admin-dashboard/products/<id>/`

## Troubleshooting

### Frontend shows fallback products instead of your backend data

Check:

- Django is running on `localhost:8000`
- `NEXT_PUBLIC_API_URL` points to `http://localhost:8000/api/v1`
- you created products and active variants in Django admin

### `ModuleNotFoundError` for `corsheaders`

Install the missing package:

```powershell
python -m pip install django-cors-headers
```

### Frontend loads but catalogue is empty

That usually means the backend is reachable, but the database has no product records yet. Run `python manage.py seed_mvp` or add them through `/admin/`.

### Product exists but price or stock looks wrong

`ProductVariant` controls:

- `selling_price`
- `mrp`
- `in_stock`

The product list uses variant data to compute minimum price and availability.

## Current Limitations

This repo can be run locally as a full-stack catalogue app, but not every screen is fully backend-driven yet. A few frontend flows still use placeholders or mocked behavior. In particular, auth is not connected to Django.
