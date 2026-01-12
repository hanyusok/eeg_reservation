# Kakao OAuth NextAuth v5 수정 가이드

## 문제

NextAuth v5에서 Kakao 로그인 시 다음 오류 발생:
```
WWWAuthenticateChallengeError: server responded with a challenge in the WWW-Authenticate HTTP Header
error: "invalid_client"
error_description: "Not exist client_id [null]"
```

## 원인

NextAuth v5는 기본적으로 OAuth 2.0의 `client_secret_basic` 인증 방식을 사용하여 `client_id`와 `client_secret`을 HTTP Basic Authentication 헤더로 전송합니다. 하지만 Kakao OAuth API는 `client_id`를 POST body에 포함해야 합니다 (`client_secret_post` 방식).

## 해결 방법

### 핵심 해결책: `token_endpoint_auth_method` 설정

Kakao provider 설정에서 `client.token_endpoint_auth_method`를 `"client_secret_post"`로 설정해야 합니다:

```typescript
function Kakao(options: { clientId: string; clientSecret?: string }) {
  const clientId = options.clientId.trim()
  const clientSecret = (options.clientSecret || "").trim()

  return {
    id: "kakao",
    name: "Kakao",
    type: "oauth" as const,
    clientId: clientId,
    clientSecret: clientSecret || undefined,
    // 핵심: token_endpoint_auth_method를 "client_secret_post"로 설정
    // 이렇게 하면 client_id가 POST body에 포함됩니다
    client: {
      ...(clientSecret ? { client_secret: clientSecret } : {}),
      token_endpoint_auth_method: "client_secret_post" as const,
    },
    authorization: {
      url: "https://kauth.kakao.com/oauth/authorize",
      params: {
        scope: "profile_nickname",
        response_type: "code",
      },
    },
    token: {
      url: "https://kauth.kakao.com/oauth/token",
    },
    userinfo: {
      url: "https://kapi.kakao.com/v2/user/me",
      async request(context: { tokens: { access_token: string } }) {
        const { tokens } = context
        const response = await fetch("https://kapi.kakao.com/v2/user/me", {
          headers: {
            Authorization: `Bearer ${tokens.access_token}`,
          },
        })
        
        if (!response.ok) {
          const errorText = await response.text()
          console.error("[Kakao UserInfo Error]", {
            status: response.status,
            statusText: response.statusText,
            body: errorText,
          })
          throw new Error(`Kakao userinfo request failed: ${response.statusText}`)
        }
        
        return await response.json()
      },
    },
    profile(profile: any) {
      // ... profile mapping logic
    },
  }
}
```

### 환경 변수 설정

`.env` 파일에 다음 변수들을 설정하세요:

```bash
KAKAO_CLIENT_ID="your_kakao_rest_api_key"
KAKAO_CLIENT_SECRET="your_kakao_client_secret"  # 선택사항
```

**주의사항:**
- `KAKAO_CLIENT_ID`는 필수입니다
- `KAKAO_CLIENT_SECRET`은 선택사항이지만, 보안을 위해 설정하는 것을 권장합니다
- 환경 변수 변경 후 개발 서버를 재시작해야 합니다

### 서버 재시작

환경 변수를 변경한 후 반드시 개발 서버를 재시작하세요:

```bash
# 개발 서버 중지 (Ctrl+C)
# 그 다음 재시작
npm run dev
```

## 기술적 세부사항

### NextAuth v5의 OAuth 처리 방식

NextAuth v5는 내부적으로 `oauth4webapi` 라이브러리를 사용하여 OAuth 2.0 플로우를 처리합니다. 

1. **기본 동작**: `client_secret_basic` 방식 사용
   - `client_id`와 `client_secret`을 HTTP Basic Authentication 헤더로 전송
   - 형식: `Authorization: Basic base64(client_id:client_secret)`

2. **Kakao 요구사항**: `client_secret_post` 방식 필요
   - `client_id`와 `client_secret`을 POST body에 포함
   - 형식: `client_id=xxx&client_secret=yyy`

3. **해결책**: `token_endpoint_auth_method` 설정
   - `provider.client.token_endpoint_auth_method: "client_secret_post"` 설정
   - NextAuth v5가 이 설정을 읽어 올바른 방식으로 요청 전송

### 코드 구조

```typescript
// NextAuth v5는 다음과 같이 client 객체를 생성합니다:
const client: o.Client = {
  client_id: provider.clientId,  // provider.clientId에서 가져옴
  ...provider.client,             // provider.client의 속성들을 병합
}

// 따라서 provider.client에 token_endpoint_auth_method를 설정하면
// oauth4webapi가 올바른 인증 방식을 사용합니다
```

## 확인 사항

1. ✅ `.env` 파일에 `KAKAO_CLIENT_ID` 설정됨
2. ✅ `lib/auth.ts`에서 `token_endpoint_auth_method: "client_secret_post"` 설정됨
3. ✅ 개발 서버 재시작 완료
4. ✅ Kakao Developer Console에서 앱 설정 확인
5. ✅ Redirect URI가 올바르게 설정됨: `http://localhost:3000/api/auth/callback/kakao`

## 추가 문제 해결

여전히 문제가 발생하면:

1. **캐시 삭제**:
   ```bash
   rm -rf .next
   npm run dev
   ```

2. **환경 변수 재확인**:
   ```bash
   node -e "require('dotenv').config(); console.log('KAKAO_CLIENT_ID:', process.env.KAKAO_CLIENT_ID)"
   ```

3. **Kakao Developer Console 확인**:
   - 앱 키 (REST API 키) 확인
   - 카카오 로그인 활성화 확인
   - Redirect URI 등록 확인
   - 동의항목 활성화 확인

4. **코드 확인**:
   - `lib/auth.ts`의 Kakao provider 설정 확인
   - `client.token_endpoint_auth_method`가 `"client_secret_post"`로 설정되어 있는지 확인

## 참고 자료

- [NextAuth v5 문서](https://authjs.dev/)
- [Kakao Developers 가이드](https://developers.kakao.com/docs/latest/ko/kakaologin/rest-api)
- [OAuth 2.0 Client Authentication Methods](https://www.rfc-editor.org/rfc/rfc6749#section-2.3)