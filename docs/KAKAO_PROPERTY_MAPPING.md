# Kakao Property Item과 NextAuth Item 매핑 가이드

이 문서는 Kakao OAuth의 Property Item(동의항목)과 NextAuth의 User/Session Item 간의 매핑을 상세히 설명합니다.

## 1. Kakao Property Items (동의항목)

Kakao Developer Console에서 설정하는 동의항목과 API 응답의 매핑:

### 1.1 동의항목 설정

| 동의항목 (Kakao Console) | Scope | API 응답 경로 | 필수 여부 |
|-------------------------|-------|--------------|----------|
| **닉네임** | `profile_nickname` | `kakao_account.profile.nickname` | ✅ 필수 |
| **카카오계정(이메일)** | `account_email` | `kakao_account.email` | ⚠️ 선택 |
| **프로필 사진** | `profile_image` | `kakao_account.profile.profile_image_url` | ⚠️ 선택 |
| **카카오톡 메시지 전송** | `talk_message` | - | ❌ 미사용 |
| **카카오스토리** | `story` | - | ❌ 미사용 |

### 1.2 현재 코드에서 요청하는 Scope

```typescript
// lib/auth.ts - Kakao provider
authorization: {
  params: {
    scope: "profile_nickname",  // 기본: 닉네임만 요청
    response_type: "code",
  },
}
```

**참고:** 이메일이 필요한 경우 `scope: "profile_nickname account_email"`로 변경 가능

## 2. Kakao API 응답 구조

Kakao API (`/v2/user/me`)의 실제 응답 예시:

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
      "profile_image_url": "https://k.kakaocdn.net/dn/.../img_640x640.jpg",
      "thumbnail_image_url": "https://k.kakaocdn.net/dn/.../img_110x110.jpg",
      "is_default_image": false
    },
    "profile_nickname_needs_agreement": false,
    "profile_image_needs_agreement": false
  },
  "connected_at": "2024-01-01T00:00:00Z",
  "properties": {
    "nickname": "홍길동"
  }
}
```

## 3. Property Item → NextAuth User 매핑

### 3.1 Profile 함수에서의 매핑

```typescript
// lib/auth.ts - Kakao provider의 profile 함수
profile(profile: any) {
  const kakaoAccount = profile.kakao_account || {}
  const kakaoProfile = kakaoAccount.profile || {}
  
  // Kakao ID → NextAuth user.id
  const kakaoId = profile.id?.toString() || String(kakaoAccount.id || "")
  
  // Kakao 이메일 → NextAuth user.email (fallback 처리)
  const email = kakaoAccount.email || `${kakaoId}@kakao.com`
  
  // Kakao 닉네임 → NextAuth user.name
  const name = kakaoProfile.nickname || "Kakao User"
  
  // Kakao 프로필 이미지 → NextAuth user.image
  const image = kakaoProfile.profile_image_url
  
  return {
    id: kakaoId,      // NextAuth user.id
    email: email,     // NextAuth user.email
    name: name,       // NextAuth user.name
    image: image,     // NextAuth user.image
  }
}
```

### 3.2 매핑 테이블

| Kakao Property Item | Kakao API 경로 | NextAuth User Property | 타입 | Fallback |
|---------------------|----------------|------------------------|------|----------|
| 사용자 ID | `profile.id` | `user.id` | `string` | `String(kakaoAccount.id)` |
| 이메일 | `kakao_account.email` | `user.email` | `string` | `{id}@kakao.com` |
| 닉네임 | `kakao_account.profile.nickname` | `user.name` | `string` | `"Kakao User"` |
| 프로필 이미지 | `kakao_account.profile.profile_image_url` | `user.image` | `string \| null` | `undefined` |

## 4. NextAuth User → Database User 매핑

### 4.1 SignIn Callback에서의 매핑

```typescript
// lib/auth.ts - signIn callback
async signIn({ user, account, profile }) {
  if (account?.provider === "kakao") {
    // NextAuth user.name → Database firstName/lastName
    let firstName = "User"
    let lastName = ""
    
    if (user.name) {
      // Kakao는 보통 공백 없는 한글 이름 제공
      // 전체 이름을 firstName으로, lastName은 빈 문자열
      firstName = user.name  // 예: "홍길동"
      lastName = ""
    }
    
    // NextAuth user.email → Database email
    const email = user.email  // 예: "user@example.com"
    
    // Database에 저장
    dbUser = await prisma.user.create({
      data: {
        email: email,           // NextAuth user.email
        firstName: firstName,  // NextAuth user.name (전체)
        lastName: lastName,     // 빈 문자열
        role: "patient",        // 기본 역할
        passwordHash: "...",    // 임시 비밀번호
      },
    })
    
    // NextAuth user.id (Kakao ID) → Database user.id (UUID)
    user.id = dbUser.id  // UUID로 교체
    user.role = dbUser.role
  }
}
```

### 4.2 매핑 테이블

| NextAuth User Property | Database User Field | 변환 로직 | 예시 |
|------------------------|---------------------|-----------|------|
| `user.id` (Kakao ID) | - | 사용하지 않음 (DB UUID 사용) | `"123456789"` → 무시 |
| `user.email` | `email` | 직접 매핑 | `"user@example.com"` |
| `user.name` | `firstName` | 전체 이름을 firstName으로 | `"홍길동"` → `firstName: "홍길동"` |
| - | `lastName` | 빈 문자열 | `""` |
| - | `role` | 기본값 "patient" | `"patient"` |
| - | `passwordHash` | 임시 비밀번호 생성 | `"oauth_..."` |

## 5. Database User → JWT Token 매핑

### 5.1 JWT Callback에서의 매핑

```typescript
// lib/auth.ts - jwt callback
async jwt({ token, user, account }) {
  if (user) {
    // Database user.id → JWT token.id
    token.id = user.id  // UUID
    
    // Database user.role → JWT token.role
    token.role = user.role  // "patient" | "parent" | "admin" | "doctor"
    
    // NextAuth user.email → JWT token.email
    token.email = user.email
  }
  return token
}
```

### 5.2 매핑 테이블

| Database User Field | JWT Token Property | 타입 | 예시 |
|---------------------|-------------------|------|------|
| `id` (UUID) | `token.id` | `string` | `"550e8400-e29b-41d4-a716-446655440000"` |
| `role` | `token.role` | `string` | `"patient"` |
| `email` | `token.email` | `string` | `"user@example.com"` |

## 6. JWT Token → Session 매핑

### 6.1 Session Callback에서의 매핑

```typescript
// lib/auth.ts - session callback
async session({ session, token }) {
  if (session.user) {
    // JWT token.id → Session user.id
    session.user.id = token.id as string
    
    // JWT token.role → Session user.role
    session.user.role = token.role as string
    
    // NextAuth user.email → Session user.email (이미 있음)
    // NextAuth user.name → Session user.name (이미 있음)
    // NextAuth user.image → Session user.image (이미 있음)
  }
  return session
}
```

### 6.2 최종 Session 구조

```typescript
{
  user: {
    id: string,           // Database UUID (from token.id)
    email: string,        // Kakao 이메일 (from NextAuth user.email)
    role: string,         // Database role (from token.role)
    name: string | null,  // Kakao 닉네임 (from NextAuth user.name)
    image: string | null  // Kakao 프로필 이미지 (from NextAuth user.image)
  }
}
```

### 6.3 매핑 테이블

| JWT Token Property | Session User Property | 소스 | 예시 |
|-------------------|----------------------|------|------|
| `token.id` | `session.user.id` | Database UUID | `"550e8400-..."` |
| `token.role` | `session.user.role` | Database role | `"patient"` |
| `token.email` | `session.user.email` | Kakao email | `"user@example.com"` |
| - | `session.user.name` | Kakao nickname | `"홍길동"` |
| - | `session.user.image` | Kakao profile image | `"https://..."` |

## 7. 전체 매핑 플로우 다이어그램

```
┌─────────────────────────────────────────────────────────────┐
│ Kakao Developer Console - 동의항목 설정                      │
│ - 닉네임 (profile_nickname) ✅ 필수                          │
│ - 카카오계정(이메일) (account_email) ⚠️ 선택                 │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Kakao API Response (/v2/user/me)                            │
│ {                                                            │
│   id: 123456789,                                            │
│   kakao_account: {                                          │
│     email: "user@example.com",                              │
│     profile: {                                              │
│       nickname: "홍길동",                                    │
│       profile_image_url: "https://..."                      │
│     }                                                       │
│   }                                                         │
│ }                                                           │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Profile Function (lib/auth.ts)                               │
│ Kakao Property → NextAuth User                              │
│                                                             │
│ profile.id → user.id (string)                              │
│ kakao_account.email → user.email                           │
│ kakao_account.profile.nickname → user.name                 │
│ kakao_account.profile.profile_image_url → user.image        │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ NextAuth User Object                                        │
│ {                                                            │
│   id: "123456789",                                          │
│   email: "user@example.com",                               │
│   name: "홍길동",                                            │
│   image: "https://..."                                      │
│ }                                                           │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ SignIn Callback (lib/auth.ts)                               │
│ NextAuth User → Database User                               │
│                                                             │
│ user.email → dbUser.email                                   │
│ user.name → dbUser.firstName (전체 이름)                    │
│ "" → dbUser.lastName (빈 문자열)                            │
│ "patient" → dbUser.role (기본값)                            │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Database User (PostgreSQL)                                   │
│ {                                                            │
│   id: "550e8400-...",  (UUID)                              │
│   email: "user@example.com",                               │
│   firstName: "홍길동",                                       │
│   lastName: "",                                             │
│   role: "patient"                                           │
│ }                                                           │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ JWT Callback (lib/auth.ts)                                  │
│ Database User → JWT Token                                   │
│                                                             │
│ dbUser.id → token.id                                        │
│ dbUser.role → token.role                                    │
│ user.email → token.email                                    │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ JWT Token                                                    │
│ {                                                            │
│   id: "550e8400-...",                                       │
│   role: "patient",                                          │
│   email: "user@example.com"                                 │
│ }                                                           │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Session Callback (lib/auth.ts)                              │
│ JWT Token + NextAuth User → Session                         │
│                                                             │
│ token.id → session.user.id                                 │
│ token.role → session.user.role                              │
│ user.email → session.user.email                             │
│ user.name → session.user.name                               │
│ user.image → session.user.image                             │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Final Session Object                                        │
│ {                                                            │
│   user: {                                                   │
│     id: "550e8400-...",      (Database UUID)               │
│     email: "user@example.com", (Kakao email)               │
│     role: "patient",          (Database role)                │
│     name: "홍길동",            (Kakao nickname)              │
│     image: "https://..."     (Kakao profile image)          │
│   }                                                         │
│ }                                                           │
└─────────────────────────────────────────────────────────────┘
```

## 8. 주요 매핑 포인트 요약

### 8.1 ID 매핑
- **Kakao ID** (`profile.id`): OAuth 인증용으로만 사용, DB에는 저장 안 함
- **Database UUID** (`dbUser.id`): 실제 애플리케이션에서 사용하는 ID
- **매핑**: Kakao ID → NextAuth user.id (임시) → Database UUID → JWT token.id → Session user.id

### 8.2 이름 매핑
- **Kakao 닉네임**: 한글 이름 (공백 없음, 예: "홍길동")
- **Database firstName**: 전체 이름을 저장
- **Database lastName**: 빈 문자열
- **매핑**: `kakao_account.profile.nickname` → `user.name` → `dbUser.firstName`

### 8.3 이메일 매핑
- **Kakao 이메일**: 동의항목 활성화 시 제공
- **Fallback**: 이메일이 없으면 `{kakaoId}@kakao.com` 사용
- **매핑**: `kakao_account.email` → `user.email` → `dbUser.email` → `token.email` → `session.user.email`

### 8.4 역할 매핑
- **기본값**: OAuth 사용자는 항상 `"patient"` 역할로 시작
- **변경**: 관리자가 나중에 역할 변경 가능
- **매핑**: `"patient"` (하드코딩) → `dbUser.role` → `token.role` → `session.user.role`

## 9. 디버깅 및 로깅

개발 환경에서 각 단계의 매핑을 확인할 수 있습니다:

1. **Profile Mapping**: `[Kakao Profile Mapping]` 로그
2. **SignIn**: `[OAuth SignIn]` 로그
3. **User Creation**: `[OAuth User Created]` 로그
4. **JWT Token**: `[JWT Token Created]` 로그
5. **Session**: `[Session Mapped]` 로그

## 10. 주의사항

1. **이메일 동의**: 사용자가 이메일 제공을 거부할 수 있음 → Fallback 이메일 사용
2. **한글 이름**: 공백 없는 한글 이름은 전체를 `firstName`으로 저장
3. **기본 역할**: 모든 OAuth 사용자는 `patient` 역할로 시작
4. **ID 교체**: Kakao ID는 인증 후 Database UUID로 교체됨
