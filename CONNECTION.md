# Movers User App – Backend & Admin Connection

The Android app is wired to the **same backend** as **fyp_admin**. Use one backend for both.

## 1. Backend

- Run from project root: `cd backend && npm start` (default port **5001**).
- Ensure `.env` has `PORT=5001` and `JWT_SECRET` set.
- API base: `http://localhost:5001/api/`

## 2. Android app → Backend

- **Emulator:** app uses `http://10.0.2.2:5001/api/` (10.0.2.2 = host machine’s localhost).
- **Physical device:** set your computer’s LAN IP in `src/config/api.js`:
  - `const DEVICE_HOST_IP = '192.168.x.x';` (e.g. your WiFi IP).
- Phone and computer must be on the same network; backend must be running.

## 3. Auth (mobile)

- **Login:** `POST /api/auth/login` → `{ email, password }` → `{ token, user }`.
- **Sign up:** `POST /api/auth/signup` → `{ name, email, phone, password, role }` → `{ token, user }`.
- `role`: `'user'` (customer) or `'owner'` (truck owner). Driver is separate.
- Token is sent in `Authorization: Bearer <token>` for protected routes.

## 4. Jobs (mobile)

- **List my jobs:** `GET /api/jobs?userId=<id>` (auth required).
- **Create job:** `POST /api/jobs` (auth) with body: `userId`, `userName`, `title`, `pickup`, `dropoff`, `pickupLocation`, `deliveryLocation`, `goodsType`, `vehicleType`, `date`, etc.
- **Job details:** `GET /api/jobs/:id`.
- **Update job:** `PUT /api/jobs/:id` (e.g. accept bid → set `status`, `truckOwnerId`, `truckOwnerName`).

## 5. Admin panel (fyp_admin)

- Point `VITE_API_BASE_URL` in fyp_admin to `http://localhost:5001/api` (or your backend URL).
- Admin uses `/api/admin/*` and `/api/jobs`, same backend as the app.

## 6. Quick test

1. Start backend: `cd backend && npm start`.
2. Start Android app: `cd Movers-User_App && npx react-native run-android`.
3. Sign up as **user** (customer), then create a job from the app.
4. Open **fyp_admin**, log in as admin; you should see jobs (and users) from the same backend.
