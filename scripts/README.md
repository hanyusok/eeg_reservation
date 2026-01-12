# Scripts 폴더 사용 가이드

이 폴더에는 TypeScript로 작성된 유틸리티 스크립트들이 있습니다.

## TypeScript 파일 실행 방법

### 방법 1: npm 스크립트 사용 (권장)

프로젝트의 `package.json`에 이미 스크립트가 설정되어 있습니다:

```bash
# 관리자 사용자 생성
npm run create-admin

# 샘플 사용자 10명 생성
npm run create-sample-users
```

### 방법 2: npx tsx 사용

`tsx`는 TypeScript 파일을 직접 실행할 수 있는 도구입니다:

```bash
# 관리자 사용자 생성
npx tsx scripts/create-admin-user.ts

# 샘플 사용자 생성
npx tsx scripts/create-sample-users.ts
```

### 방법 3: tsx 직접 사용 (전역 설치된 경우)

```bash
# tsx 전역 설치 (한 번만)
npm install -g tsx

# 스크립트 실행
tsx scripts/create-admin-user.ts
tsx scripts/create-sample-users.ts
```

## 환경 변수 설정

스크립트 실행 시 환경 변수를 설정할 수 있습니다:

### create-admin-user.ts

```bash
# 기본값 사용
npm run create-admin

# 환경 변수로 커스터마이징
ADMIN_EMAIL="myadmin@example.com" \
ADMIN_PASSWORD="mypassword123" \
ADMIN_FIRST_NAME="My" \
ADMIN_FIRST_NAME="Admin" \
npx tsx scripts/create-admin-user.ts
```

기본값:
- `ADMIN_EMAIL`: `admin@example.com`
- `ADMIN_PASSWORD`: `admin123`
- `ADMIN_FIRST_NAME`: `Admin`
- `ADMIN_LAST_NAME`: `User`

### create-sample-users.ts

```bash
# 기본값 사용 (10명 생성, 비밀번호: password123)
npm run create-sample-users

# 환경 변수로 커스터마이징
USER_COUNT=20 \
DEFAULT_PASSWORD="test123" \
npx tsx scripts/create-sample-users.ts
```

기본값:
- `USER_COUNT`: `10`
- `DEFAULT_PASSWORD`: `password123`

## 실행 전 확인사항

1. **데이터베이스 연결 확인**
   ```bash
   # PostgreSQL이 실행 중인지 확인
   pg_isready -h localhost -p 5432
   ```

2. **환경 변수 파일 확인**
   - `.env` 파일에 `DATABASE_URL`이 올바르게 설정되어 있는지 확인

3. **Prisma Client 생성**
   ```bash
   npm run db:generate
   ```

4. **데이터베이스 스키마 초기화** (처음 한 번만)
   ```bash
   npm run db:push
   ```

## 사용 예시

### 예시 1: 관리자 계정 생성

```bash
# 기본 관리자 계정 생성
npm run create-admin

# 출력:
# ✅ Admin user created successfully!
# 
# Login credentials:
# Email: admin@example.com
# Password: admin123
```

### 예시 2: 테스트용 샘플 사용자 생성

```bash
# 10명의 랜덤 사용자 생성
npm run create-sample-users

# 20명의 사용자를 다른 비밀번호로 생성
USER_COUNT=20 DEFAULT_PASSWORD="test456" npx tsx scripts/create-sample-users.ts
```

### 예시 3: 커스텀 관리자 계정 생성

```bash
ADMIN_EMAIL="superadmin@hospital.com" \
ADMIN_PASSWORD="SecurePass123!" \
ADMIN_FIRST_NAME="Super" \
ADMIN_LAST_NAME="Admin" \
npx tsx scripts/create-admin-user.ts
```

## 문제 해결

### 오류: "Cannot find module '@prisma/client'"

```bash
# Prisma Client 재생성
npm run db:generate
```

### 오류: "P1001: Can't reach database server"

1. PostgreSQL이 실행 중인지 확인:
   ```bash
   pg_isready -h localhost -p 5432
   ```

2. `.env` 파일의 `DATABASE_URL` 확인

3. 데이터베이스가 생성되었는지 확인:
   ```bash
   psql -U eeg_user -d eeg_reservation -c "SELECT 1;"
   ```

### 오류: "User already exists"

- 이미 존재하는 사용자입니다. 다른 이메일을 사용하거나 기존 계정을 사용하세요.

## 스크립트 목록

| 파일 | 설명 | 실행 방법 |
|------|------|-----------|
| `create-admin-user.ts` | 관리자 사용자 생성 | `npm run create-admin` |
| `create-sample-users.ts` | 테스트용 샘플 사용자 생성 | `npm run create-sample-users` |
| `setup-database.sh` | 데이터베이스 설정 (Bash) | `./scripts/setup-database.sh` |
| `test-admin-api.sh` | Admin API 테스트 (Bash) | `./scripts/test-admin-api.sh` |

## 추가 정보

- 모든 TypeScript 스크립트는 `tsx`를 사용하여 실행됩니다
- `tsx`는 프로젝트의 `devDependencies`에 포함되어 있습니다
- 스크립트는 Prisma Client를 사용하여 데이터베이스에 접근합니다
- 모든 스크립트는 실행 후 자동으로 데이터베이스 연결을 종료합니다
