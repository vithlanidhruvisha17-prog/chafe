# ARABISTA — Artisanal Café & Kitchen (Surat, Gujarat)

A full-stack web application for **ARABISTA**, an artisanal specialty café and kitchen located in Surat, Gujarat. The application provides an interactive customer experience—including an arch-hero homepage, visual menu, table QR-code ordering, real-time live kitchen status tracking via Server-Sent Events (SSE)—alongside a complete administrative operations portal for recipe catalog management, live kitchen ticket dispatching, hero banners, and café space photography.

---

## 1. Tech Stack

- **Frontend**: React (Vite) + Tailwind CSS + React Router v6 + Axios + Lucide Icons
- **Backend**: Node.js + Express.js (REST API architecture)
- **Database**: Supabase (PostgreSQL)
- **ORM**: Prisma ORM (Connection pooling via Supabase PgBouncer, Direct URL for migrations)
- **Image Storage**: Supabase Storage (`arabista-images` public bucket)
- **Authentication**: JWT (JSON Web Tokens) with bcrypt password hashing
- **Live Updates**: Server-Sent Events (SSE) with resilient polling fallback

---

## 2. Design System & Strict Palette

Arabista is styled with an organic, warm editorial aesthetic using **only** five core tones and their semantic opacities:

| Tone | Hex Code | Role |
| :--- | :--- | :--- |
| **Forest Green** | `#173D32` | Primary brand tone, deep headers, key action pill buttons |
| **Warm Ivory** | `#F6F1E7` | Canvas background, card containers, high-contrast text |
| **Sage** | `#A5AF96` | Subtle dividing lines, tag borders, badges, background frames |
| **Coffee Tan** | `#B78B59` | Price displays, culinary accents, active icons, status highlights |
| **Charcoal** | `#242321` | Readable typography, secondary iconography, deep overlays |

- **Headings**: *Playfair Display* serif typography
- **Body & Controls**: *DM Sans* / *Poppins* sans-serif typography
- **Geometry**: Pill buttons (`rounded-pill`), arch containers (`arch-frame`), soft ambient shadows (`shadow-soft`)

---

## 3. Project Structure

```
arabista/
├── client/                      # Frontend Application (React + Vite + Tailwind)
│   ├── public/
│   │   └── favicon.svg          # Arabista brand seal favicon
│   ├── src/
│   │   ├── assets/              # Static media assets
│   │   ├── components/
│   │   │   ├── admin/           # Admin route guards and staff modals
│   │   │   ├── cart/            # Slide-over order bag drawer
│   │   │   ├── common/          # Button, Card, Container, Loader, Skeletons
│   │   │   ├── layout/          # MainLayout, MenuLayout, AdminLayout, Navbar, Footer
│   │   │   ├── menu/            # BannerCarousel
│   │   │   └── tracking/        # ChefArabitoMascot, LiveStatusStepper
│   │   ├── context/             # CartContext, ToastContext
│   │   ├── pages/               # Public pages (Home, Menu, SubCategory, Cart, Checkout, Track, Story, 404)
│   │   │   └── admin/           # Staff pages (Login, Dashboard, Orders, Menu, Banners, Gallery)
│   │   ├── services/            # Axios instance and API configuration
│   │   ├── utils/               # Formatting and local storage helpers
│   │   ├── App.jsx              # Central router and provider setup
│   │   ├── index.css            # Base Tailwind and brand palette definitions
│   │   └── main.jsx             # React DOM root entry
│   ├── index.html               # Semantic HTML with complete social meta tags
│   ├── package.json
│   ├── tailwind.config.js       # Palette definitions and design tokens
│   └── vite.config.js
│
├── server/                      # Backend REST API (Node.js + Express + Prisma)
│   ├── prisma/
│   │   ├── schema.prisma        # Database schema (Models: Admin, Category, MenuItem, Order, etc.)
│   │   └── seed.js              # Database seed script with default categories and admin
│   ├── src/
│   │   ├── config/              # Prisma client and Supabase storage clients
│   │   ├── controllers/         # HTTP request handlers for all resources
│   │   ├── middleware/          # CORS, Helmet, Rate limiter, JWT auth, Multer upload, Error handler
│   │   ├── routes/              # Public and protected Express API routes
│   │   ├── services/            # Business logic and database query layer
│   │   ├── utils/               # SSE connection manager, API response wrappers, order code generator
│   │   ├── app.js               # Express application initialization
│   │   └── server.js            # Server entrypoint and port binding
│   ├── .env.example
│   └── package.json
└── README.md
```

---

## 4. Local Setup Guide

### Prerequisites
- Node.js (v18.x or later)
- npm or pnpm
- A free [Supabase](https://supabase.com) project

### Step 1: Set up Supabase
1. Create a new Supabase project.
2. In project settings under **Database**:
   - Copy the **Connection pooling (Transaction/Session mode)** URI (port 6543) for `DATABASE_URL`.
   - Copy the **Direct connection** URI (port 5432) for `DIRECT_URL`.
3. In project settings under **Storage**:
   - Create a new public bucket named `arabista-images`.
   - Set public bucket access to **Enabled**.
   - Copy your Supabase Project URL and Service Role Key (or Anon Key).

---

### Step 2: Configure and Seed the Backend

1. Navigate to the server folder:
   ```bash
   cd arabista/server
   npm install
   ```

2. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

3. Fill in the values in `server/.env`:
   ```env
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:5173

   # Supabase Database URLs
   DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
   DIRECT_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

   # Admin JWT Secret
   JWT_SECRET="arabista_super_secret_jwt_key_2026_change_in_production"
   JWT_EXPIRES_IN="7d"

   # Supabase Storage Configuration
   SUPABASE_URL="https://[PROJECT_REF].supabase.co"
   SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOi..."
   SUPABASE_BUCKET_NAME="arabista-images"

   # Initial Seed Credentials
   DEFAULT_ADMIN_EMAIL="admin@arabista.in"
   DEFAULT_ADMIN_PASSWORD="Admin@Arabista2026!"
   DEFAULT_ADMIN_NAME="Head Barista"
   ```

4. Push migrations to Supabase and seed initial menu collections:
   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   npm run seed
   ```

5. (Optional) Bulk upload menu & promotional imagery:
   Populate `server/seed-images/` according to the catalog structure:
   - `server/seed-images/categories/<category-slug>.(jpg|jpeg|png|webp)`
   - `server/seed-images/subcategories/<subcategory-slug>.(jpg|jpeg|png|webp)`
   - `server/seed-images/items/<item-slug>.(jpg|jpeg|png|webp)`
   - `server/seed-images/banners/<anything>.(jpg|jpeg|png|webp)`
   - `server/seed-images/gallery/<anything>.(jpg|jpeg|png|webp)`

   Then execute:
   ```bash
   npm run upload-images
   # Or to overwrite existing images:
   npm run upload-images -- --force
   ```

6. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The API will start at `http://localhost:5000/api`.*

---

### Step 3: Configure and Run the Frontend

1. In a new terminal window, navigate to the client folder:
   ```bash
   cd arabista/client
   npm install
   ```

2. Create a `.env` file:
   ```bash
   cp .env.example .env
   ```

3. Ensure `client/.env` contains the backend API endpoint:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

4. Start Vite development server:
   ```bash
   npm run dev
   ```
   *Open `http://localhost:5173` in your browser.*

---

## 5. Scripts Reference

### Backend (`arabista/server`)
- `npm run dev`: Starts the server with Nodemon live-reloading.
- `npm start`: Starts production Node server.
- `npm run seed`: Seeds default categories, signature items, and initial admin credentials into Supabase.
- `npm run upload-images`: Bulk uploads images from `server/seed-images/` to Supabase Storage and maps them to database rows. Use `--force` to re-upload existing images.
- `npx prisma studio`: Launches interactive web UI to inspect database rows.
- `npx prisma migrate dev`: Creates and applies new database migrations.

### Frontend (`arabista/client`)
- `npm run dev`: Launches Vite local dev server with Hot Module Replacement (HMR).
- `npm run build`: Compiles production build into `client/dist`.
- `npm run preview`: Locally previews production build.

---

## 6. Production Deployment Guide

### Deploying Frontend (Vercel)
1. Push your repository to GitHub.
2. In the Vercel Dashboard, select **Add New Project** and import the repository.
3. Configure the project settings:
   - **Root Directory**: `arabista/client`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add Environment Variable:
   - `VITE_API_URL`: `https://your-server-domain.railway.app/api` (or Render URL)
5. Deploy. Configure a rewrite in `vercel.json` for React Router client routing:
   ```json
   {
     "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
   }
   ```

### Deploying Backend (Render or Railway)
1. In Render or Railway, create a new **Web Service** from your repository.
2. Configure settings:
   - **Root Directory**: `arabista/server`
   - **Build Command**: `npm install && npx prisma generate`
   - **Start Command**: `npm start`
3. Add Environment Variables:
   - `PORT`: `5000` (or leave default assigned by platform)
   - `NODE_ENV`: `production`
   - `CLIENT_URL`: `https://your-client-app.vercel.app`
   - `DATABASE_URL`: `[Supabase Pooled URL on port 6543]`
   - `DIRECT_URL`: `[Supabase Direct URL on port 5432]`
   - `JWT_SECRET`: `[High-entropy secure string]`
   - `SUPABASE_URL`: `https://[PROJECT_REF].supabase.co`
   - `SUPABASE_SERVICE_ROLE_KEY`: `[Supabase service role secret]`
   - `SUPABASE_BUCKET_NAME`: `arabista-images`
4. Run migrations on the production database:
   ```bash
   npx prisma migrate deploy
   ```

---

## 7. End-to-End Testing Checklist

### Public Café Customer Flow
- [x] **Homepage (`/`)**:
  - Arch-shaped hero image renders with dual pill buttons (*Explore Menu*, *Our Story*).
  - Welcome section displays green background (`#173D32`).
  - *Our Space* gallery displays photos fetched from `/api/gallery`.
  - *Signature Specials* displays items with prices in ₹ and active *Add to Order* buttons.
  - *Meet Chef Arabito* section features *See Order Tracking* linking to `/track`.
- [x] **Visual Menu (`/menu`)**:
  - Promotional banner carousel auto-slides, pauses on hover, and allows dot navigation.
  - Category filter chips (*All*, *The Pour*, *Food*, *Pasta Lab*, *Dessert*, *Salad*) filter cards dynamically.
  - Live search debounces and displays instant item cards with prices and Add to Cart.
- [x] **Sub-Category Browsing (`/menu/category/:slug`)**:
  - `← Menu` returns to the visual menu.
  - 4-column grid renders for *The Pour*, *Food*, and *Pasta Lab*; 3-column grid renders for *Dessert*.
  - Sub-category cards navigate to item listings (`/menu/sub/:slug`).
- [x] **Sub-Category Items (`/menu/sub/:slug`)**:
  - Items show title, price, description, and availability badge (*Available* vs *Sold Out*).
  - Add to Cart updates quantity and opens slide-out order bag.
- [x] **Order Bag & Cart (`/cart` and Drawer)**:
  - Slide-in `CartDrawer` accessible from top navigation and sidebar.
  - Quantity steppers (`-`, `+`, trash) update subtotal.
  - Item notes field saves custom preparation requests.
  - Sold-out items are disabled with an alert and 1-click removal.
- [x] **Checkout (`/checkout`)**:
  - Visiting with QR parameter `?table=5` auto-selects *Dine-In* and pre-fills *Table 05*.
  - Switching to *Takeaway* clears table and shows front counter pickup notice.
  - Form validates customer name, phone number, and table number.
  - Submitting order sends verified item IDs to backend, returns order code (e.g. `ARB-7492`), and triggers auto-redirect to `/track/:orderNumber`.
- [x] **Live Order Tracking (`/track` & `/track/:orderNumber`)**:
  - `/track` allows typing any order number with auto-uppercase and displays recent order chips.
  - Live status stepper updates from *Placed* to *Preparing* to *Ready* in real time via Server-Sent Events (SSE).
  - *Chef Arabito* mascot illustration reacts with speech dialogue tailored to each status.
  - Order summary displays itemized selections, prices, and timestamps.

### Staff Operations Portal (`/admin`)
- [x] **Staff Authentication (`/admin/login`)**:
  - Protects all `/admin/*` routes; unauthenticated users redirect to login.
  - Login stores JWT token and directs to station dashboard.
  - Sign-out clears credentials and returns to login.
- [x] **Operational Dashboard (`/admin/dashboard`)**:
  - Displays live metrics for today's orders, revenue, and pending kitchen orders.
  - Live queue snapshot provides 1-click status advancing (*Start Prep*, *Mark Ready*).
- [x] **Live Orders Management (`/admin/orders`)**:
  - Filters by status (*All*, *Placed*, *Preparing*, *Ready*, *Completed*, *Cancelled*) and dining type.
  - Search by order code, guest name, or phone.
  - Advancing status immediately pushes updates to customer screens via SSE.
- [x] **Menu Catalog Manager (`/admin/menu`)**:
  - Tabbed CRUD for Menu Items, Categories, and Subcategories.
  - Availability toggle updates kitchen stock instantly.
  - Add/Edit dialogs upload images directly to Supabase Storage.
- [x] **Hero Banners & Gallery (`/admin/banners`, `/admin/gallery`)**:
  - Upload promotional images, modify sort order, and toggle carousel visibility.
  - Manage café photography with delete confirmations.
```
