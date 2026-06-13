# LIBBAAS - Luxury Lingerie E-commerce

## Project Structure

```
E-comerance women brand/
├── backend/            # Node.js backend server
│   ├── data/        # Data files
│   ├── middleware/  # Authentication & auth middleware
│   ├── routes/      # API routes
│   ├── utils/       # Business logic & repositories
│   └── server.js   # Main server file
│
├── frontend/          # React + Vite frontend
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── pages/       # App pages (including Admin & User)
│   │   └── utils/       # API & utilities
│
└── package.json    # Root package.json with scripts
```

## Connecting Postgres to Backend

The backend already has full Postgres support! Follow these steps:

### Step 1: Get Postgres Connection String
- **Local Postgres**: Install Postgres locally, create a database
- **Managed Postgres**: Use services like Neon, Supabase, Render, etc.

### Step 2: Configure Environment Variables
1. Copy the env example: `cp backend/.env.example backend/.env`
2. Open `backend/.env` and set:
   ```
   DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/luxury_lingerie
   # Or use POSTGRES_URL for services like Vercel
   ```
   - For managed services (Neon/Supabase/Render), you might need to add `?sslmode=require` or set `PGSSL=true`
3. Also set other env vars like `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`

### Step 3: Start the Backend
- The backend automatically initializes the Postgres tables (products, orders, users, categories, reviews) on startup!
- It also seeds default products if the table is empty

## Frontend Display & Filter Criteria

The frontend already displays all products and has comprehensive filtering! Here's what's included:

### Filter Features on Shop Page:
- **Category Filter**: Quick filter by product category (All, Bra, etc.)
- **Type/Style Filter**: Subcategory filter for selected category
- **Price Range**: Under Rs 1,000, Rs 1,000-2,000, Over Rs 2,000
- **Color Filter**: Visual color swatch filter
- **Size Filter**: Size options filter
- **Custom Variations Filter**: Filters for custom product variations (like Cup Size)
- **Search**: Search by product name, description, category, or type
- **Sorting**: Curation, New Arrivals, Price Ascending/Descending

## Getting Started

### Backend
1. `cd backend`
2. `npm install`
3. `cp .env.example .env` and configure env vars (especially DATABASE_URL)
4. `npm start` (runs on :5000)

### Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev` (runs on :4000)
