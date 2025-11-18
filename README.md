# EEG Reservation System

Online reservation system for pediatric epilepsy EEG monitoring appointments.

## Technology Stack

- **Framework**: Next.js 14+ (App Router)
- **Database**: PostgreSQL 15+
- **ORM**: Prisma
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Authentication**: NextAuth.js (Auth.js)
- **Forms**: React Hook Form + Zod validation

## Getting Started

### Prerequisites

- Node.js 20+ installed
- PostgreSQL 15+ installed and running
- npm or yarn package manager

### Installation

1. **Clone the repository** (if applicable) or navigate to the project directory:
   ```bash
   cd eeg_reservation
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env` file in the root directory:
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
   - `NEXTAUTH_URL`: Your application URL (e.g., `http://localhost:3000`)

4. **Set up the database**:
   ```bash
   # Generate Prisma Client
   npm run db:generate
   
   # Push schema to database
   npm run db:push
   
   # Or run migrations
   npm run db:migrate
   ```

5. **Run the development server**:
   ```bash
   npm run dev
   ```

6. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
eeg_reservation/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard pages
│   └── layout.tsx         # Root layout
├── components/            # React components
│   └── ui/                # shadcn/ui components
├── lib/                   # Utility libraries
│   ├── auth.ts            # NextAuth configuration
│   ├── prisma.ts          # Prisma client
│   └── utils.ts           # Utility functions
├── prisma/                # Prisma schema and migrations
│   └── schema.prisma      # Database schema
├── types/                 # TypeScript type definitions
└── middleware.ts          # Next.js middleware for auth
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma Client
- `npm run db:push` - Push schema changes to database
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio

## User Roles

The system supports four user roles:

- **patient**: Child patient account
- **parent**: Parent/guardian account
- **doctor**: Medical staff account
- **admin**: System administrator account

## Development Phases

### Phase 1: Foundation ✅
- [x] Project setup (Next.js, PostgreSQL, Tailwind)
- [x] Database schema implementation
- [x] Authentication system (NextAuth.js)
- [x] Basic UI components (shadcn/ui)
- [x] User registration and login
- [x] Role-based routing

### Phase 2: Core Booking System ✅
- [x] Calendly API integration
- [x] Appointment booking interface
- [x] Appointment CRUD operations
- [x] Patient profile management
- [x] Parent-child account linking
- [x] Basic email notifications

### Phase 3: Admin Portal ✅
- [x] Admin dashboard
- [x] Patient management interface
- [x] Appointment management for admin
- [x] Medical documents upload/view
- [x] Appointment notes system

### Phase 4: Integrations & Automation ✅
- [x] Zapier webhook setup
- [x] Automation workflows implementation
- [x] Email template system
- [x] SMS integration (optional)
- [x] Calendar sync (optional)

## Quick Start: Admin Account

### Create Admin User

```bash
npm run create-admin
```

**Default Credentials:**
- Email: `admin@example.com`
- Password: `admin123`

### Log In

1. Start server: `npm run dev`
2. Go to: `http://localhost:3000/auth/login`
3. Enter admin credentials
4. You'll be redirected to `/admin` dashboard

📖 **See `ADMIN_GUIDE.md` for complete admin usage guide**

## Security Considerations

- Passwords are hashed using bcrypt
- JWT-based session management
- Role-based access control (RBAC)
- Audit logging for all user actions
- Input validation with Zod schemas

## License

Private project - All rights reserved

