# Kakao 로그인 문제 해결 가이드

## KOE205 오류: "Authorization codes were requested with unset Kakao Login consent items"

### 오류 원인

이 오류는 Kakao 로그인에서 요청한 scope(권한)에 해당하는 동의항목이 Kakao Developer Console에서 활성화되지 않았을 때 발생합니다.

### 해결 방법

#### 1. Kakao Developer Console에서 동의항목 확인 및 활성화

1. [Kakao Developers](https://developers.kakao.com/)에 로그인
2. 해당 애플리케이션 선택
3. **"제품 설정"** → **"카카오 로그인"** → **"동의항목"** 메뉴로 이동
4. 다음 항목들이 활성화되어 있는지 확인:

   **필수 항목:**
   - ✅ **닉네임** (profile_nickname) - **반드시 활성화 필요**
   
   **선택 항목:**
   - ⚠️ **카카오계정(이메일)** (account_email) - 이메일이 필요한 경우만 활성화

5. 각 동의항목을 클릭하여:
   - "필수 동의" 또는 "선택 동의"로 설정
   - "저장" 버튼 클릭

#### 2. 현재 코드의 Scope 확인

현재 코드는 기본적으로 다음 scope만 요청합니다:

```typescript
scope: "profile_nickname"  // 닉네임만 요청
```

따라서 최소한 **"닉네임"** 동의항목은 반드시 활성화되어 있어야 합니다.

#### 3. 이메일이 필요한 경우

이메일을 받으려면:

1. **Kakao Developer Console에서 동의항목 활성화:**
   - "카카오 로그인" → "동의항목" → "카카오계정(이메일)" 활성화

2. **코드에서 scope 추가:**
   ```typescript
   scope: "profile_nickname account_email"
   ```

3. **주의사항:**
   - 사용자가 이메일 제공에 동의하지 않을 수 있습니다
   - 이메일이 없는 경우 fallback 이메일(`{kakaoId}@kakao.com`)이 사용됩니다

### 동의항목 설정 단계별 가이드

#### Step 1: 동의항목 메뉴 접근
```
Kakao Developers → 내 애플리케이션 → [앱 선택]
→ 제품 설정 → 카카오 로그인 → 동의항목
```

#### Step 2: 닉네임 동의항목 설정
1. "닉네임" 항목 클릭
2. "필수 동의" 또는 "선택 동의" 선택
3. "저장" 클릭

#### Step 3: 이메일 동의항목 설정 (선택)
1. "카카오계정(이메일)" 항목 클릭
2. "필수 동의" 또는 "선택 동의" 선택
3. "저장" 클릭

### 확인 방법

동의항목이 제대로 설정되었는지 확인:

1. **동의항목 목록에서 확인:**
   - 각 항목 옆에 "필수" 또는 "선택" 표시가 있어야 합니다
   - 활성화되지 않은 항목은 표시되지 않거나 비활성화 상태입니다

2. **테스트 로그인:**
   - 로그인 시도 후 동의 화면에서 요청한 항목들이 표시되는지 확인
   - 오류 없이 로그인이 완료되면 성공

### 일반적인 문제

#### 문제 1: "닉네임" 동의항목이 활성화되지 않음
**증상:** KOE205 오류 발생
**해결:** "동의항목" 메뉴에서 "닉네임"을 활성화하세요

#### 문제 2: 이메일이 null로 반환됨
**증상:** `kakao_account.email`이 `null`
**해결:** 
- "카카오계정(이메일)" 동의항목이 활성화되어 있는지 확인
- 사용자가 이메일 제공에 동의했는지 확인
- 코드에서 fallback 이메일이 사용됩니다

#### 문제 3: 동의항목을 저장했는데도 오류 발생
**해결:**
- 변경사항이 반영되기까지 몇 분이 걸릴 수 있습니다
- 브라우저 캐시를 지우고 다시 시도
- Kakao Developer Console에서 동의항목 상태를 다시 확인

### 코드 수정 (이메일 선택적 처리)

현재 코드는 이메일이 없어도 작동하도록 수정되어 있습니다:

```typescript
// 이메일이 없으면 fallback 사용
const email = kakaoAccount.email || `${kakaoId}@kakao.com`
```

따라서 이메일 동의항목이 활성화되지 않아도 로그인은 가능합니다.

### 추가 리소스

- [Kakao Developers 공식 문서](https://developers.kakao.com/docs/latest/ko/kakaologin/rest-api)
- [Kakao 로그인 동의항목 가이드](https://developers.kakao.com/docs/latest/ko/kakaologin/prerequisite)
