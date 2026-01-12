# Navigation Flow Documentation

이 문서는 애플리케이션의 네비게이션 플로우와 Back Button 사용 패턴을 설명합니다.

## Back Button 컴포넌트

공통 Back Button 컴포넌트가 `components/ui/back-button.tsx`에 구현되어 있습니다.

### 사용 방법

```tsx
import { BackButton } from "@/components/ui/back-button"

// 특정 경로로 이동
<BackButton href="/dashboard" label="Back to Dashboard" />

// 브라우저 히스토리로 뒤로 가기
<BackButton label="Back" />
```

### Props

- `href?`: 특정 경로로 이동할 때 사용 (지정하지 않으면 `router.back()` 사용)
- `label?`: 버튼 텍스트 (기본값: "Back")
- `variant?`: 버튼 스타일 (기본값: "outline")
- `size?`: 버튼 크기 (기본값: "default")
- `className?`: 추가 CSS 클래스

## 페이지별 네비게이션 플로우

### 1. Dashboard (`/dashboard`)

**진입 경로:**
- 로그인 후 기본 리다이렉트
- 메인 페이지 (`/`)

**출구 경로:**
- `/profile` - 프로필 편집
- `/appointments` - 예약 목록
- `/patients` - 환자 목록 (parent/admin/doctor만)
- `/admin` - 관리자 대시보드 (admin/doctor만)

**Back Button:** 없음 (메인 페이지)

---

### 2. Profile (`/profile`)

**진입 경로:**
- `/dashboard` - "Edit Profile" 버튼
- User Profile 컴포넌트의 "Edit Profile" 버튼

**출구 경로:**
- `/dashboard` - Back Button

**Back Button:** ✅ `/dashboard`로 이동

---

### 3. Patients List (`/patients`)

**진입 경로:**
- `/dashboard` - "View Patients" 버튼 (parent만)
- `/admin` - "Patients" 메뉴 (admin/doctor만)

**출구 경로:**
- `/patients/new` - "Add New Patient" 버튼
- `/patients/[id]` - 환자 상세 (구현 예정)

**Back Button:** 없음 (대시보드에서 직접 접근)

---

### 4. New Patient (`/patients/new`)

**진입 경로:**
- `/patients` - "Add New Patient" 버튼

**출구 경로:**
- `/patients` - Back Button
- Patient Form의 "Cancel" 버튼 (`router.back()`)

**Back Button:** ✅ `/patients`로 이동

**추가:** Patient Form 내부에도 "Cancel" 버튼이 있어 `router.back()` 사용

---

### 5. Appointments List (`/appointments`)

**진입 경로:**
- `/dashboard` - "View Appointments" 버튼

**출구 경로:**
- `/appointments/book` - "Book New Appointment" 버튼
- `/appointments/[id]` - 예약 상세 (구현 예정)

**Back Button:** 없음 (대시보드에서 직접 접근)

---

### 6. Book Appointment (`/appointments/book`)

**진입 경로:**
- `/appointments` - "Book New Appointment" 버튼

**출구 경로:**
- `/appointments` - Back Button
- Booking Form의 "Cancel" 버튼 (`router.back()`)

**Back Button:** ✅ `/appointments`로 이동

**추가:** Booking Form 내부에도 "Cancel" 버튼이 있어 `router.back()` 사용

---

### 7. Admin Dashboard (`/admin`)

**진입 경로:**
- `/dashboard` - 자동 리다이렉트 (admin/doctor만)
- 직접 URL 접근

**출구 경로:**
- `/admin/appointments` - 예약 관리
- `/admin/patients` - 환자 관리
- `/admin/settings` - 설정

**Back Button:** 없음 (메인 관리 페이지)

---

### 8. Admin Appointment Detail (`/admin/appointments/[id]`)

**진입 경로:**
- `/admin/appointments` - 예약 목록에서 클릭

**출구 경로:**
- `/admin/appointments` - "Back to List" 버튼

**Back Button:** ✅ "Back to List" 링크로 `/admin/appointments` 이동

---

## 네비게이션 패턴

### 패턴 1: 명시적 경로 지정 (권장)

특정 페이지로 돌아가야 할 때:

```tsx
<BackButton href="/dashboard" label="Back to Dashboard" />
```

**사용 예시:**
- Profile → Dashboard
- New Patient → Patients List
- Book Appointment → Appointments List

### 패턴 2: 브라우저 히스토리 사용

이전 페이지로 돌아갈 때:

```tsx
<BackButton label="Back" />
// 또는
const router = useRouter()
router.back()
```

**사용 예시:**
- Form 내부의 Cancel 버튼
- 모달이나 드로어에서 닫기

### 패턴 3: 직접 링크

특정 경로로 이동하는 링크:

```tsx
<Button asChild variant="outline">
  <Link href="/admin/appointments">Back to List</Link>
</Button>
```

**사용 예시:**
- Admin Appointment Detail의 "Back to List"

## 네비게이션 플로우 다이어그램

```
Login
  ↓
Dashboard
  ├─→ Profile ──→ (Back) ──→ Dashboard
  ├─→ Appointments
  │     ├─→ Book Appointment ──→ (Back) ──→ Appointments
  │     └─→ Appointment Detail ──→ (Back) ──→ Appointments
  ├─→ Patients (parent/admin/doctor)
  │     ├─→ New Patient ──→ (Back) ──→ Patients
  │     └─→ Patient Detail ──→ (Back) ──→ Patients
  └─→ Admin (admin/doctor)
        ├─→ Appointments
        │     └─→ Appointment Detail ──→ (Back to List) ──→ Appointments
        ├─→ Patients
        └─→ Settings
```

## Best Practices

1. **일관성 유지**: 같은 레벨의 페이지는 같은 패턴 사용
2. **명확한 경로**: 사용자가 어디로 돌아가는지 명확히 표시
3. **접근성**: Back Button은 항상 페이지 상단에 배치
4. **반응형**: 모바일에서도 쉽게 접근 가능하도록

## 향후 개선 사항

- [ ] 환자 상세 페이지 (`/patients/[id]`) 구현 및 Back Button 추가
- [ ] 예약 상세 페이지 (`/appointments/[id]`) 구현 및 Back Button 추가
- [ ] Breadcrumb 네비게이션 추가 검토
- [ ] 모바일 네비게이션 바 추가 검토
