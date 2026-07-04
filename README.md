# Aura — Jewellery E-Commerce

A full-stack jewellery store with a **customer storefront** (browse → cart → checkout → mock payment)
and an **admin panel** (add/edit/delete products with image upload, view & manage orders),
protected by a single master password.

- **Frontend:** React (Vite) + React Router
- **Backend:** Node.js + Express + Mongoose
- **Database:** MongoDB
- **Images:** uploaded to the backend's `/uploads` folder
- **Payment:** simulated (always succeeds) — swap in Razorpay/Stripe later

```
ReactJS/
├── backend/     Express API + MongoDB models
└── frontend/    React storefront + admin (one app)
```

---

## Prerequisites

- **Node.js** 18+ (you have v22 ✔)
- **MongoDB** running locally on `mongodb://127.0.0.1:27017`
  (a MongoDB service was already detected on this machine ✔)

### Installing MongoDB locally (if it isn't already)

1. Download **MongoDB Community Server** for Windows:
   https://www.mongodb.com/try/download/community
2. Run the installer → choose **Complete** → tick **"Install MongoDB as a Service"**
   (this makes it start automatically on `127.0.0.1:27017`).
3. Optionally install **MongoDB Compass** (a GUI) to view your data.

> Prefer the cloud? Create a free **MongoDB Atlas** cluster, copy its connection
> string, and set `MONGODB_URI` in `backend/.env` to it.

---

## Setup & Run

Open **two terminals** — one for the backend, one for the frontend.

### 1. Backend

```bash
cd backend
npm install                # install dependencies
# create your .env from the template (the real .env is git-ignored):
#   cp .env.sample .env     (or copy it in Explorer)
npm run seed               # optional: load 4 sample products
npm run dev                # starts API on http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
npm install                # already done
npm run dev                # starts storefront on http://localhost:5173
```

Then open **http://localhost:5173** in your browser.

---

## Using the app

### Customer
- Browse products on the home page, search by name.
- Open a product, **Add to cart** or **Buy now**.
- Go to **Cart**, adjust quantities, **Proceed to checkout**.
- Fill in shipping details and click **Pay** — the mock payment succeeds and the
  order is saved (stock is reduced automatically).

### Admin
- Click **Admin** in the navbar (or go to `/admin`).
- Log in with the master password.
  - Default: **`admin123`** — change it in `backend/.env` (`ADMIN_PASSWORD`).
- **Products tab:** add a product (name, description, price, stock, category, image),
  edit or delete existing ones.
- **Orders tab:** see every order with customer details, and update the fulfilment
  status (placed → shipped → delivered).

---

## Configuration (`backend/.env`)

| Variable         | Meaning                                             | Default                                   |
|------------------|-----------------------------------------------------|-------------------------------------------|
| `PORT`           | API port                                            | `5000`                                    |
| `MONGODB_URI`    | MongoDB connection string                           | `mongodb://127.0.0.1:27017/jewellery`     |
| `JWT_SECRET`     | Secret for signing admin login tokens               | *(change this)*                           |
| `ADMIN_PASSWORD` | The single master password for the admin panel      | `admin123`                                |
| `CLIENT_URL`     | Frontend URL, used for CORS                         | `http://localhost:5173`                   |

> **Before deploying:** change `ADMIN_PASSWORD` and `JWT_SECRET` to strong values,
> and never commit your real `.env` (it's already git-ignored).

---

## API reference

Public:
- `GET  /api/products` — list products (`?search=` to filter by name)
- `GET  /api/products/:id` — one product
- `POST /api/orders` — place an order (mock payment)

Admin (require `Authorization: Bearer <token>`):
- `POST   /api/admin/login` — exchange master password for a token
- `POST   /api/products` — create (multipart form, field `image` for the file)
- `PUT    /api/products/:id` — update
- `DELETE /api/products/:id` — delete
- `GET    /api/orders` — list all orders
- `PATCH  /api/orders/:id/status` — update fulfilment status

---

## What's mocked / next steps

- **Payment** is simulated in `POST /api/orders` (always marked `paid`). To go live,
  integrate Razorpay or Stripe: create a payment intent/order, verify the signature
  on the server, then mark the order `paid`.
- **Admin auth** uses one shared master password (as requested). For multiple staff
  accounts you'd add a proper user model.
- **Images** are stored on local disk. For production, use Cloudinary/S3.
```
