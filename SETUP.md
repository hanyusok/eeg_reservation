# Setup Instructions

## Quick Start Guide

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/eeg_reservation?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-generate-with-openssl-rand-base64-32"

# Calendly (to be configured in Phase 2)
CALENDLY_API_KEY=""
CALENDLY_WEBHOOK_SIGNING_KEY=""

# Email (to be configured in Phase 2)
EMAIL_FROM=""
EMAIL_SERVER_HOST=""
EMAIL_SERVER_PORT=""
EMAIL_SERVER_USER=""
EMAIL_SERVER_PASSWORD=""

# Zapier (to be configured in Phase 4)
ZAPIER_WEBHOOK_URL=""
```

**Important**: Generate a secure `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

### 3. Database Setup

#### Option A: Using Docker (Recommended for Development)

```bash
# Run PostgreSQL in Docker
docker run --name eeg-postgres \
  -e POSTGRES_USER=eeg_user \
  -e POSTGRES_PASSWORD=eeg_password \
  -e POSTGRES_DB=eeg_reservation \
  -p 5432:5432 \
  -d postgres:15

# Update DATABASE_URL in .env:
# DATABASE_URL="postgresql://eeg_user:eeg_password@localhost:5432/eeg_reservation?schema=public"
```

#### Option B: Local PostgreSQL Installation

1. Install PostgreSQL 15+ on your system
2. Create a database:
   ```sql
   CREATE DATABASE eeg_reservation;
   ```
3. Update `DATABASE_URL` in `.env` with your credentials

### 4. Initialize Database Schema

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database (for development)
npm run db:push

# OR run migrations (for production)
npm run db:migrate
```

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Creating Your First User

1. Navigate to `/auth/register`
2. Create a user account (role: parent or patient)
3. Log in at `/auth/login`

## Creating Admin/Doctor Users

Admin and doctor accounts must be created directly in the database or via a seed script:

```sql
-- Example: Create admin user (password: admin123 - change this!)
-- Password hash for "admin123" (you should generate your own)
INSERT INTO users (id, email, password_hash, role, first_name, last_name, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'admin@example.com',
  '$2a$10$YourHashedPasswordHere',
  'admin',
  'Admin',
  'User',
  NOW(),
  NOW()
);
```

Or use Prisma Studio to create users:
```bash
npm run db:studio
```

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check `DATABASE_URL` format
- Ensure database exists

### Authentication Issues
- Verify `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches your app URL
- Clear browser cookies if session issues persist

### Build Errors
- Run `npm run db:generate` after schema changes
- Delete `.next` folder and rebuild: `rm -rf .next && npm run build`

## Next Steps

After completing Phase 1 setup:
- ✅ Authentication system is ready
- ✅ Database schema is initialized
- ✅ Basic UI components are available
- ✅ Role-based routing is configured

Proceed to **Phase 2: Core Booking System** to add Calendly integration and appointment booking.

