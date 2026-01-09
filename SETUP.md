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
AUTH_SECRET="your-secret-key-here-generate-with-openssl-rand-base64-32"

# OAuth Providers (Optional)
# Google OAuth
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Kakao OAuth
KAKAO_CLIENT_ID=""
KAKAO_CLIENT_SECRET=""

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

**Important**: Generate a secure `NEXTAUTH_SECRET` and `AUTH_SECRET`:
```bash
openssl rand -base64 32
```

### OAuth Setup (Optional)

#### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth client ID"
5. Configure the OAuth consent screen:
   - User Type: External (for testing) or Internal (for organization)
   - Add your app name, support email, and developer contact
6. Create OAuth client ID:
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
7. Copy the Client ID and Client Secret to your `.env` file:
   ```env
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   ```

#### Kakao OAuth Setup

1. Go to [Kakao Developers](https://developers.kakao.com/)
2. Create a new application or select an existing one
3. Go to "앱 설정" → "앱 키" and copy your REST API key
4. Go to "제품 설정" → "카카오 로그인" → "활성화 설정" → Enable "카카오 로그인"
5. Go to "카카오 로그인" → "Redirect URI 등록":
   - Add: `http://localhost:3000/api/auth/callback/kakao`
6. **중요**: Go to "카카오 로그인" → "동의항목":
   - **필수**: Enable "닉네임" (profile_nickname) - **반드시 활성화 필요**
   - **선택**: Enable "카카오계정(이메일)" (account_email) - 이메일이 필요한 경우만 활성화
   
   **동의항목 설정 방법:**
   - "동의항목" 메뉴에서 각 항목을 클릭
   - "필수 동의" 또는 "선택 동의"로 설정
   - "저장" 버튼 클릭
   - **주의**: 동의항목을 활성화하지 않으면 KOE205 오류가 발생할 수 있습니다
   
7. Copy the REST API key to your `.env` file:
   ```env
   KAKAO_CLIENT_ID="your-kakao-rest-api-key"
   KAKAO_CLIENT_SECRET=""  # Usually empty for Kakao, but check your app settings
   ```

**KOE205 오류 해결:**
- 오류 메시지: "Authorization codes were requested with unset Kakao Login consent items"
- 해결 방법:
  1. Kakao Developer Console → "카카오 로그인" → "동의항목"으로 이동
  2. 요청한 scope에 해당하는 동의항목이 모두 활성화되어 있는지 확인
  3. 현재 코드는 `profile_nickname`만 요청하므로, 최소한 "닉네임" 동의항목은 활성화되어 있어야 합니다
  4. 이메일이 필요한 경우 `account_email` scope를 추가하고 "카카오계정(이메일)" 동의항목도 활성화하세요

**Note**: For production, update the redirect URIs to your production domain.

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

