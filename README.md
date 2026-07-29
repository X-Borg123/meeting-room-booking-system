# Meeting Room Booking System

Single-room booking system built for a coding test with role-based access, booking validation, and admin user management.

## Stack

- Frontend: React, Vite, Tailwind CSS, shadcn/ui, React Query, React Hook Form
- Backend: Express, MongoDB, Mongoose, JWT, bcrypt, express-validator
- Testing: Vitest + Testing Library, Jest + Supertest

## Roles

- `User`: create bookings, view bookings, delete own bookings
- `Owner`: everything a user can do, plus delete any booking and view summary pages
- `Admin`: everything an owner can do, plus create users, delete users, and change roles

## Booking Rules

- Start time must be before end time
- Past bookings cannot be created
- End time cannot be earlier than the selected start time
- Overlapping bookings are blocked
- Back-to-back bookings are allowed

## Features

- Authentication with JWT
- Role-based route and API protection
- Booking dashboard and summary pages
- Admin user management
- Search for bookings and users
- Strong admin-side user creation validation
- Cascade delete: deleting a user removes their bookings

## Assumptions

- Only one meeting room exists
- Times are stored and compared in UTC
- JWT is stored in `localStorage` for this test scope

## Run Locally

### Backend

```bash
cd server
cp .env.example .env
npm install
npm run seed
npm run dev
```

### Frontend

```bash
cd client
cp .env.example .env
npm install
npm run dev
```

## Test Accounts

After running `npm run seed` in `server`:

- `admin@test.com` / `Password#123`
- `owner@test.com` / `Password#123`
- `user@test.com` / `Password#123`

## Tests

```bash
cd server && npm test
cd client && npm run test:run
```

## API

- Swagger UI: `/api-docs`
- Main resources:
  - `/api/auth`
  - `/api/bookings`
  - `/api/users`

