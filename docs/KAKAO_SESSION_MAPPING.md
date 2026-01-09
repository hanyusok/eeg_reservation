# Kakao 로그인 세션 매핑 가이드

이 문서는 Kakao OAuth 로그인 프로세스에서 세션 항목이 어떻게 매핑되는지 설명합니다.

## 전체 플로우

```
Kakao OAuth → Profile Mapping → SignIn Callback → JWT Token → Session
```

## 1. Kakao API 응답 구조

Kakao API (`/v2/user/me`)는 다음과 같은 구조로 응답합니다:

```json
{
  "id": 123456789,
  "kakao_account": {
    "email": "user@example.com",
    "email_needs_agreement": false,
    "is_email_valid": true,
    "is_email_verified": true,
    "profile": {
      "nickname": "홍길동",
      "profile_image_url": "https://...",
      "thumbnail_image_url": "https://..."
    }
  }
}
```

## 2. Profile 함수 매핑 (`lib/auth.ts`)

Kakao API 응답을 NextAuth User 형식으로 변환:

```typescript
profile(profile: any) {
  const kakaoAccount = profile.kakao_account || {}
  const kakaoProfile = kakaoAccount.profile || {}
  
  return {
    id: profile.id?.toString(),           // Kakao 사용자 ID → NextAuth user.id
    email: kakaoAccount.email,           // Kakao 이메일 → NextAuth user.email
    name: kakaoProfile.nickname,          // Kakao 닉네임 → NextAuth user.name
    image: kakaoProfile.profile_image_url // Kakao 프로필 이미지 → NextAuth user.image
  }
}
```

**매핑 결과:**
- `profile.id` → `user.id` (문자열로 변환)
- `kakao_account.email` → `user.email`
- `kakao_account.profile.nickname` → `user.name`
- `kakao_account.profile.profile_image_url` → `user.image`

## 3. SignIn Callback (`signIn`)

OAuth 사용자를 데이터베이스에 저장하고 사용자 정보를 업데이트:

```typescript
async signIn({ user, account, profile }) {
  // 1. 기존 사용자 확인
  let dbUser = await prisma.user.findUnique({
    where: { email: user.email! }
  })

  // 2. 새 사용자 생성 (없는 경우)
  if (!dbUser) {
    // 한글 이름 처리: 공백이 없으므로 전체를 firstName으로 사용
    const firstName = user.name || "User"
    const lastName = ""

    dbUser = await prisma.user.create({
      data: {
        email: user.email!,
        passwordHash: "...", // OAuth 사용자는 임시 비밀번호
        firstName,
        lastName,
        role: "patient" // 기본 역할
      }
    })
  }

  // 3. user 객체에 DB 정보 매핑
  user.id = dbUser.id        // DB UUID → user.id
  user.role = dbUser.role     // DB role → user.role
}
```

**매핑 결과:**
- `user.name` (Kakao 닉네임) → `dbUser.firstName` (한글 이름은 전체를 firstName으로)
- `user.email` → `dbUser.email`
- `dbUser.id` → `user.id` (JWT에 사용)
- `dbUser.role` → `user.role` (JWT에 사용)

## 4. JWT Callback (`jwt`)

사용자 정보를 JWT 토큰에 저장:

```typescript
async jwt({ token, user, account }) {
  if (user) {
    token.id = user.id        // DB UUID
    token.role = user.role     // DB role (patient/parent/admin/doctor)
    token.email = user.email   // 이메일
  }
  return token
}
```

**매핑 결과:**
- `user.id` → `token.id`
- `user.role` → `token.role`
- `user.email` → `token.email`

## 5. Session Callback (`session`)

JWT 토큰의 정보를 세션 객체에 매핑:

```typescript
async session({ session, token }) {
  if (session.user) {
    session.user.id = token.id      // JWT token.id → session.user.id
    session.user.role = token.role   // JWT token.role → session.user.role
  }
  return session
}
```

**최종 세션 구조:**

```typescript
{
  user: {
    id: string,           // DB UUID (from token.id)
    email: string,        // Kakao 이메일
    role: string,         // DB role: "patient" | "parent" | "admin" | "doctor"
    name: string | null,  // Kakao 닉네임
    image: string | null  // Kakao 프로필 이미지 URL
  }
}
```

## 전체 매핑 체인

```
Kakao API Response
  ↓
Profile Function
  ↓
user: { id, email, name, image }
  ↓
SignIn Callback
  ↓
DB User: { id (UUID), email, firstName, lastName, role }
  ↓
user: { id (UUID), email, role }
  ↓
JWT Token: { id, role, email }
  ↓
Session: { user: { id, email, role, name, image } }
```

## 타입 정의

세션 타입은 `types/next-auth.d.ts`에 정의되어 있습니다:

```typescript
interface Session {
  user: {
    id: string
    email: string
    role: string
    name?: string | null
  }
}
```

## 디버깅

개발 환경에서는 각 단계에서 로그가 출력됩니다:

1. **Profile Mapping**: Kakao API 응답과 매핑된 결과
2. **SignIn**: OAuth 로그인 시작 및 사용자 생성
3. **JWT Token**: 토큰 생성 시 사용자 정보
4. **Session**: 세션 매핑 완료 시 최종 정보

로그를 확인하려면 개발 서버를 실행하고 Kakao 로그인을 시도하세요.

## 주의사항

1. **한글 이름 처리**: Kakao는 보통 공백 없는 한글 이름을 제공하므로, 전체 이름을 `firstName`으로 저장하고 `lastName`은 빈 문자열로 설정합니다.

2. **이메일 동의**: Kakao 사용자가 이메일 제공에 동의하지 않은 경우, `kakao_account.email`이 `null`일 수 있습니다. 이 경우 fallback 이메일(`{id}@kakao.com`)을 사용합니다.

3. **기본 역할**: OAuth로 가입한 사용자는 기본적으로 `patient` 역할로 설정됩니다. 필요시 관리자가 역할을 변경할 수 있습니다.

4. **비밀번호**: OAuth 사용자는 임시 비밀번호가 생성되지만, 실제로는 OAuth 로그인만 사용할 수 있습니다.
