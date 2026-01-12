# NextAuth v5 업그레이드 가이드

이 문서는 NextAuth v4에서 v5로 업그레이드한 내용을 설명합니다.

## 업그레이드 완료

✅ **NextAuth v5.0.0-beta.30** 설치 완료

## 주요 변경사항

### 1. 패키지 버전
- **이전**: `next-auth@^4.24.13`
- **현재**: `next-auth@^5.0.0-beta.30`

### 2. API 변경사항

#### `auth.ts` 파일
**이전 (v4)**:
```typescript
import NextAuth, { type NextAuthOptions } from "next-auth"
import { getServerSession } from "next-auth/next"

export const authOptions: NextAuthOptions = { ... }
const handler = NextAuth(authOptions)
export const handlers = { GET: handler, POST: handler }
export const auth = async () => await getServerSession(authOptions)
```

**현재 (v5)**:
```typescript
import NextAuth from "next-auth"
import { authConfig } from "@/lib/auth"

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
})
```

#### `app/api/auth/[...nextauth]/route.ts` 파일
**이전 (v4)**:
```typescript
import NextAuth from "next-auth"
import { authOptions } from "@/auth"
const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
```

**현재 (v5)**:
```typescript
import { handlers } from "@/auth"
export const { GET, POST } = handlers
```

#### `middleware.ts` 파일
**변경사항**: 타입 캐스팅 제거
```typescript
// 이전
export default auth((req: NextRequest & { auth?: any }) => { ... })

// 현재
export default auth((req) => { ... })
```

### 3. 제거된 항목
- `getServerSession` import 제거 (v5에서는 `auth()` 함수 직접 사용)
- `NextAuthOptions` 타입 제거 (v5에서는 `NextAuthConfig` 사용)

### 4. 유지된 항목
- ✅ `lib/auth.ts`의 `authConfig` 구조 유지
- ✅ Callbacks (signIn, jwt, session) 유지
- ✅ Providers (Credentials, Google, Kakao) 유지
- ✅ 모든 API routes의 `auth()` 사용 방식 유지
- ✅ Client-side `signIn`, `signOut` 사용 방식 유지

## 호환성 확인

다음 파일들은 변경 없이 v5와 호환됩니다:
- ✅ `lib/auth.ts` - NextAuthConfig 사용
- ✅ `types/next-auth.d.ts` - 타입 정의
- ✅ 모든 API routes (`app/api/**/route.ts`)
- ✅ 모든 페이지 컴포넌트
- ✅ `components/providers/session-provider.tsx`

## 테스트 체크리스트

업그레이드 후 다음을 테스트하세요:

1. **인증 기능**
   - [ ] 로그인 (Credentials)
   - [ ] 로그아웃
   - [ ] Google OAuth (설정된 경우)
   - [ ] Kakao OAuth (설정된 경우)

2. **세션 관리**
   - [ ] 세션 정보 가져오기
   - [ ] 역할(role) 기반 접근 제어
   - [ ] Middleware 동작 확인

3. **API Routes**
   - [ ] 인증이 필요한 API 엔드포인트
   - [ ] 역할 기반 권한 체크

4. **페이지 접근**
   - [ ] `/dashboard` - patient/parent만 접근
   - [ ] `/admin` - admin/doctor만 접근
   - [ ] `/auth/login` - 모든 사용자 접근 가능

## 알려진 이슈

현재 없음. 문제가 발생하면 이슈를 등록해주세요.

## 추가 리소스

- [NextAuth v5 공식 문서](https://authjs.dev/)
- [v4에서 v5로 마이그레이션 가이드](https://authjs.dev/getting-started/migrating-to-v5)

## 롤백 방법

만약 문제가 발생하여 v4로 롤백해야 한다면:

```bash
npm install next-auth@^4.24.13 --legacy-peer-deps
```

그리고 `auth.ts`와 `app/api/auth/[...nextauth]/route.ts`를 이전 버전으로 복원하세요.
