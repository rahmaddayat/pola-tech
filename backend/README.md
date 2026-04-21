# Pola-Tech Backend API

Backend for the **Pola-Tech** Interactive Fashion Design Platform.

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Auth:** JWT + bcrypt
- **Validation:** Zod

---

## 📁 Folder Structure

```
backend/
├── prisma/
│   ├── schema.prisma          # Database schema (5 tables)
│   └── seed.js                # Seeds components + demo user
├── src/
│   ├── app.js                 # Express app (CORS, routes, error handlers)
│   ├── server.js              # Entry point with DB connection check
│   ├── config/
│   │   └── env.js             # Environment variable config
│   ├── lib/
│   │   └── prisma.js          # Prisma client singleton
│   ├── middlewares/
│   │   ├── auth.js            # JWT authentication middleware
│   │   └── validate.js        # Zod validation middleware factory
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── workspaceController.js
│   │   └── designController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── workspaceRoutes.js
│   │   └── designRoutes.js
│   └── validators/
│       ├── authValidator.js
│       ├── workspaceValidator.js
│       └── designValidator.js
├── .env.example
├── .gitignore
└── package.json
```

---

## ⚙️ Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/polatech?schema=public"
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"
PORT=5000
NODE_ENV=development
FRONTEND_URL="http://localhost:3000"
```

### 3. Generate Prisma client

```bash
npm run db:generate
```

### 4. Push schema to database

```bash
npm run db:push
```

### 5. Seed the database

```bash
npm run db:seed
```

This creates:
- 6 Component types (body, sleeves, necklines, pocket, primaryColor, pattern)
- Demo user: `admin@polatech.id` / `password123`

### 6. Start the server

```bash
# Development (auto-restart on file change)
npm run dev

# Production
npm start
```

Server runs at: `http://localhost:5000`

---

## 📡 API Reference

> All protected routes require `Authorization: Bearer <token>` header.

### Health Check

```
GET /api/health
```

---

### Auth

#### Register
```
POST /api/auth/register

Body:
{
  "nama": "John Doe",
  "email": "john@example.com",
  "password": "securepass"
}

Response 201:
{
  "status": "success",
  "user": { "id_user": 1, "nama": "John Doe", "email": "...", "role": "user" },
  "token": "eyJhbGci..."
}
```

#### Login
```
POST /api/auth/login

Body:
{
  "email": "john@example.com",
  "password": "securepass"
}

Response 200:
{
  "status": "success",
  "user": { "id_user": 1, "nama": "John Doe", "email": "...", "role": "user" },
  "token": "eyJhbGci..."
}
```

---

### Workspaces 🔒

#### Create workspace
```
POST /api/workspaces
Body: { "nama_workspace": "My Collection" }
```

#### List user workspaces
```
GET /api/workspaces
```

#### Get workspace + designs
```
GET /api/workspaces/:id
```
Returns workspace data with `designs` array included (joined).

#### Delete workspace
```
DELETE /api/workspaces/:id
```
Cascades to designs and design details.

---

### Designs 🔒

#### Create design
```
POST /api/designs

Body:
{
  "workspace_id": 1,
  "nama_design": "Casual Shirt",
  "deskripsi": "Weekend look",
  "config": {
    "body": "shirt",
    "sleeves": "short_sleeves",
    "necklines": "round_neck_binding",
    "pocket": "none",
    "primaryColor": "#6366f1",
    "pattern": "p_stripes"
  }
}
```
Auto-generates `Design_Detail` rows from `config`.

#### List designs in workspace (paginated + searchable)
```
GET /api/designs/:workspace_id?page=1&limit=10&search=shirt
```

#### Get single design (with details)
```
GET /api/designs/detail/:id
```

#### Update design
```
PUT /api/designs/:id
Body: { "nama_design": "...", "config": { ... } }  (all fields optional)
```
Re-syncs `Design_Detail` rows if `config` changes.

#### Delete design
```
DELETE /api/designs/:id
```

---

## 🛡️ Error Response Format

```json
{
  "status": "error",
  "message": "Descriptive error message",
  "errors": [
    { "field": "email", "message": "Invalid email format." }
  ]
}
```

---

## 🧪 Quick Test with curl

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"nama":"Test User","email":"test@test.com","password":"test123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'

# Create workspace (replace TOKEN)
curl -X POST http://localhost:5000/api/workspaces \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"nama_workspace":"My First Workspace"}'
```
