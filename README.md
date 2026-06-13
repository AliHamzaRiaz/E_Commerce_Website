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

## Getting Started

### Backend
1. `cd backend`
2. `npm install`
3. `cp .env.example .env` and configure env vars
4. `npm start` (runs on :5000)

### Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev` (runs on :4003)
