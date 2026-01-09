# Kakao OAuth 환경 변수 설정 가이드

## 오류: "Not exist client_id [null]"

이 오류는 Kakao OAuth의 `clientId`가 제대로 설정되지 않았을 때 발생합니다.

## 해결 방법

### 1. .env 파일 확인

프로젝트 루트 디렉토리에 `.env` 파일이 있는지 확인하고, 다음 변수가 올바르게 설정되어 있는지 확인하세요:

```env
KAKAO_CLIENT_ID="your-kakao-rest-api-key"
KAKAO_CLIENT_SECRET=""  # 보통 비어있음
```

### 2. Kakao REST API 키 확인

1. [Kakao Developers](https://developers.kakao.com/)에 로그인
2. 애플리케이션 선택
3. **"앱 설정"** → **"앱 키"** 메뉴로 이동
4. **"REST API 키"**를 복사

### 3. .env 파일 설정

`.env` 파일을 열고 다음을 확인:

```env
# ❌ 잘못된 예시
KAKAO_CLIENT_ID=""                    # 빈 문자열
KAKAO_CLIENT_ID=" "                   # 공백만 있음
KAKAO_CLIENT_ID=                      # 값이 없음

# ✅ 올바른 예시
KAKAO_CLIENT_ID="1234567890abcdef"   # 실제 REST API 키
```

### 4. 환경 변수 형식 확인

- 따옴표로 감싸야 합니다: `"your-key"`
- 앞뒤 공백이 없어야 합니다
- 빈 문자열이 아니어야 합니다

### 5. 개발 서버 재시작

환경 변수를 변경한 후에는 **반드시 개발 서버를 재시작**해야 합니다:

```bash
# 서버 중지 (Ctrl+C)
# 그 다음 다시 시작
npm run dev
```

**중요**: Next.js는 시작 시 환경 변수를 로드하므로, `.env` 파일을 수정한 후에는 서버를 재시작해야 합니다.

### 6. 환경 변수 확인 스크립트

환경 변수가 제대로 로드되었는지 확인하려면:

```bash
# .env 파일 내용 확인 (민감한 정보는 가려짐)
grep KAKAO .env

# 또는 Node.js로 확인
node -e "console.log('KAKAO_CLIENT_ID:', process.env.KAKAO_CLIENT_ID ? 'SET' : 'NOT SET')"
```

## 일반적인 문제

### 문제 1: 환경 변수가 로드되지 않음

**원인:**
- `.env` 파일이 프로젝트 루트에 없음
- 파일 이름이 `.env`가 아님 (예: `.env.local`, `.env.development`)
- 서버를 재시작하지 않음

**해결:**
- 프로젝트 루트에 `.env` 파일이 있는지 확인
- 파일 이름이 정확히 `.env`인지 확인
- 서버 재시작

### 문제 2: 빈 문자열 또는 공백

**원인:**
- `KAKAO_CLIENT_ID=""` (빈 문자열)
- `KAKAO_CLIENT_ID=" "` (공백만)
- 따옴표 없이 설정

**해결:**
- 실제 REST API 키를 입력
- 앞뒤 공백 제거
- 따옴표로 감싸기

### 문제 3: 잘못된 키

**원인:**
- 다른 애플리케이션의 키 사용
- 키가 만료됨
- 키를 잘못 복사함

**해결:**
- Kakao Developer Console에서 올바른 REST API 키 확인
- 키를 다시 복사하여 설정

## 검증 방법

환경 변수가 올바르게 설정되었는지 확인:

1. **서버 시작 시 로그 확인:**
   - 환경 변수가 없으면 provider가 추가되지 않습니다
   - 에러가 발생하면 즉시 확인 가능

2. **로그인 페이지 확인:**
   - Kakao 로그인 버튼이 표시되는지 확인
   - 버튼이 없으면 환경 변수가 설정되지 않은 것입니다

3. **브라우저 콘솔 확인:**
   - 로그인 시도 시 에러 메시지 확인

## 예시 .env 파일

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/eeg_reservation?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
AUTH_SECRET="your-secret-key-here"

# Kakao OAuth
KAKAO_CLIENT_ID="1234567890abcdefghijklmnopqrstuvwxyz"
KAKAO_CLIENT_SECRET=""

# Google OAuth (선택)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

## 추가 리소스

- [Next.js 환경 변수 문서](https://nextjs.org/docs/basic-features/environment-variables)
- [Kakao Developers 가이드](https://developers.kakao.com/docs/latest/ko/kakaologin/rest-api)
