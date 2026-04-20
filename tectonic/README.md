# Tectonic Fitness and Sports

Django REST Framework backend for the Tectonic Fitness and Sports mobile app. The project is already wired as a backend workspace with the Django project in `config/` and the app in `tectonic/`.

---

## Current Workspace

```
manage.py            Django entry point
config/              Project settings and root URL routing
tectonic/            Main app: models, serializers, services, views, admin, tests
db.sqlite3           Local SQLite database
.venv/               Local Python virtual environment
```

---

## Backend Setup

### 1. Activate the virtual environment

```powershell
.\.venv\Scripts\Activate.ps1
```

If PowerShell blocks script execution, run:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned
```

### 2. Install dependencies

```powershell
python -m pip install django djangorestframework
```

### 3. Apply database migrations

```powershell
python manage.py migrate
```

### 4. Create an admin user

```powershell
python manage.py createsuperuser
```

### 5. Start the development server

```powershell
python manage.py runserver
```

The API will be available at `http://127.0.0.1:8000/api/v1/` and the admin at `http://127.0.0.1:8000/admin/`.

---

## App Structure

```
tectonic/
├── admin.py         Django admin configuration
├── apps.py          App config
├── models.py        Database models
├── serializers.py   DRF serializers
├── services.py      Query and business-logic helpers
├── tests.py         Models, serializers, and API tests
├── urls.py          App URL routing
└── views.py         Thin API views
```

---

## API Endpoints

| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/v1/store/` | Store contact info and call-to-order instructions |
| GET | `/api/v1/sports/` | List active sports |
| GET | `/api/v1/brands/` | List active brands |
| GET | `/api/v1/categories/` | List active categories |
| GET | `/api/v1/products/` | Paginated product catalogue |
| GET | `/api/v1/products/featured/` | Featured products |
| GET | `/api/v1/products/<slug>/` | Full product detail |

### Product list filters

| Param | Type | Example |
|-------|------|---------|
| `sport` | slug | `?sport=cricket` |
| `brand` | slug | `?brand=yonex` |
| `category` | slug | `?category=rackets` |
| `in_stock` | `1` | `?in_stock=1` |
| `search` | string | `?search=arcsaber` |
| `ordering` | field | `?ordering=name` |
| `page_size` | int, max 100 | `?page_size=10` |

---

## Running Tests

```powershell
python manage.py test tectonic
```

Or run the full suite with:

```powershell
python manage.py test
```

Test coverage includes:
- Model creation, slug auto-generation, and validation
- Serializer computed fields like `discount_percent`, `min_price`, and `in_stock`
- API endpoint status codes, response shapes, filters, search, and edge cases
