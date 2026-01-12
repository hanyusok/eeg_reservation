# Navigation Bar 및 Flow 문서

## 개요

애플리케이션에 전역 Navigation Bar가 추가되어 모든 페이지에서 일관된 네비게이션을 제공합니다.

## Navigation Bar 구조

### 위치
- 모든 인증된 페이지 상단에 표시
- Auth 페이지(`/auth/*`)와 홈 페이지(`/`)에서는 숨김

### 구성 요소

#### 1. 로고/브랜드 (왼쪽)
- **텍스트**: "EEG Reservation"
- **아이콘**: Home 아이콘
- **링크**: `/dashboard`로 이동

#### 2. 네비게이션 링크 (중앙)
- **Dashboard**: 모든 사용자
- **Appointments**: 모든 사용자
- **Patients**: `parent`, `admin`, `doctor` 역할만
- **Admin**: `admin`, `doctor` 역할만

#### 3. 사용자 메뉴 (오른쪽)
- **Profile**: 프로필 편집 페이지
- **Sign Out**: 로그아웃

### 활성 상태 표시
- 현재 경로에 따라 버튼 스타일이 변경됨
- 활성 링크: `default` variant
- 비활성 링크: `ghost` variant

## Navigation Flow

### 전체 Flow 다이어그램

```
┌─────────────────────────────────────────────────────────┐
│                    Navigation Bar                        │
│  [Logo]  [Dashboard] [Appointments] [Patients] [Admin] │
│                                    [Profile] [Sign Out] │
└─────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
   Dashboard            Appointments            Patients
        │                     │                     │
        ├─→ Profile           ├─→ Book New          ├─→ New Patient
        │   (Back)            │   (Back)            │   (Back)
        │                     │                     │
        └─→ Appointments      └─→ Detail            └─→ Detail
        └─→ Patients           (Back)                (Back)
        └─→ Admin
```

### 페이지별 Navigation

#### 1. Dashboard (`/dashboard`)
**Navigation Bar 표시**: ✅
- **활성 링크**: Dashboard
- **접근 가능 링크**: 
  - Appointments
  - Patients (parent/admin/doctor)
  - Admin (admin/doctor)
  - Profile
  - Sign Out

**내부 링크**:
- Appointments 카드 → `/appointments`, `/appointments/book`
- Patients 카드 → `/patients`, `/patients/new`
- Profile 카드 → `/profile`

#### 2. Appointments (`/appointments`)
**Navigation Bar 표시**: ✅
- **활성 링크**: Appointments
- **Back Button**: 없음 (Navigation Bar로 대체)

**내부 링크**:
- "Book New Appointment" 버튼 → `/appointments/book`

#### 3. Book Appointment (`/appointments/book`)
**Navigation Bar 표시**: ✅
- **활성 링크**: Appointments (부모 경로)
- **Back Button**: `/appointments`로 이동

**Navigation Bar 활용**:
- Appointments 링크 클릭 → `/appointments`로 이동 가능

#### 4. Patients (`/patients`)
**Navigation Bar 표시**: ✅
- **활성 링크**: Patients
- **Back Button**: 없음 (Navigation Bar로 대체)

**내부 링크**:
- "Add New Patient" 버튼 → `/patients/new`
- 각 환자 카드의 "Book Appointment" → `/appointments/book?patientId=xxx`

#### 5. New Patient (`/patients/new`)
**Navigation Bar 표시**: ✅
- **활성 링크**: Patients (부모 경로)
- **Back Button**: `/patients`로 이동

**Navigation Bar 활용**:
- Patients 링크 클릭 → `/patients`로 이동 가능

#### 6. Profile (`/profile`)
**Navigation Bar 표시**: ✅
- **활성 링크**: Profile
- **Back Button**: `/dashboard`로 이동

**Navigation Bar 활용**:
- Dashboard 링크 클릭 → `/dashboard`로 이동 가능

#### 7. Admin Dashboard (`/admin`)
**Navigation Bar 표시**: ✅
- **활성 링크**: Admin
- **Back Button**: 없음 (Navigation Bar로 대체)

**Navigation Bar 활용**:
- 다른 섹션으로 쉽게 이동 가능

## Navigation Bar의 장점

### 1. 일관성
- 모든 페이지에서 동일한 네비게이션 구조
- 사용자가 항상 현재 위치를 파악 가능

### 2. 접근성
- 주요 페이지로 빠른 이동
- Back Button 없이도 Navigation Bar로 이동 가능

### 3. 역할 기반 표시
- 사용자 역할에 따라 적절한 링크만 표시
- 불필요한 링크 숨김으로 UI 간소화

### 4. 활성 상태 표시
- 현재 페이지를 시각적으로 표시
- 사용자가 어디에 있는지 명확히 인지

## Back Button과의 조화

### Back Button이 있는 페이지
- **Book Appointment**: `/appointments`로 Back
- **New Patient**: `/patients`로 Back
- **Profile**: `/dashboard`로 Back

### Navigation Bar 활용
- Back Button과 Navigation Bar 모두 사용 가능
- 사용자가 선호하는 방식 선택 가능
- Navigation Bar는 항상 접근 가능하므로 더 유연함

## 개선 사항

### 현재 구현
✅ 전역 Navigation Bar 추가
✅ 역할 기반 링크 표시
✅ 활성 상태 표시
✅ 반응형 디자인

### 향후 개선 가능 사항
- [ ] 모바일에서 햄버거 메뉴 추가
- [ ] Breadcrumb 네비게이션 추가
- [ ] 사용자 아바타/드롭다운 메뉴
- [ ] 알림/알림 배지 추가
- [ ] 검색 기능 추가

## 코드 구조

### 파일 위치
- `components/layout/navbar.tsx`: Navigation Bar 컴포넌트
- `app/layout.tsx`: Root Layout에 Navigation Bar 추가

### 주요 기능
```typescript
// 활성 경로 확인
const isActive = (path: string) => {
  if (path === "/dashboard") {
    return pathname === "/dashboard"
  }
  return pathname?.startsWith(path)
}

// 역할 기반 링크 표시
{(userRole === "parent" || userRole === "admin" || userRole === "doctor") && (
  <Button>Patients</Button>
)}
```

## 사용자 경험 개선

### Before (Navigation Bar 없음)
- 각 페이지에서 Back Button으로만 이동
- Dashboard로 돌아가려면 여러 번 뒤로 가기
- 다른 섹션으로 이동하려면 Dashboard를 거쳐야 함

### After (Navigation Bar 추가)
- 모든 페이지에서 주요 섹션으로 즉시 이동 가능
- 현재 위치를 항상 확인 가능
- 더 직관적이고 빠른 네비게이션

## 테스트 시나리오

### 시나리오 1: Appointments에서 Patients로 이동
1. `/appointments` 페이지 접속
2. Navigation Bar의 "Patients" 클릭
3. `/patients` 페이지로 이동 ✅

### 시나리오 2: Profile에서 Dashboard로 이동
1. `/profile` 페이지 접속
2. Navigation Bar의 "Dashboard" 클릭
3. `/dashboard` 페이지로 이동 ✅

### 시나리오 3: 역할별 링크 표시
1. `parent` 역할로 로그인
2. Navigation Bar에 "Patients" 링크 표시됨 ✅
3. `patient` 역할로 로그인
4. Navigation Bar에 "Patients" 링크 숨김 ✅

### 시나리오 4: 활성 상태 표시
1. `/appointments` 페이지 접속
2. Navigation Bar의 "Appointments" 버튼이 활성 상태로 표시됨 ✅
3. 다른 링크는 비활성 상태로 표시됨 ✅
