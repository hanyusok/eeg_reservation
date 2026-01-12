# Appointment 생성 UI 및 Navigation Flow

## 개요

새로운 Appointment(예약) 생성 UI와 네비게이션 흐름에 대한 문서입니다.

## 페이지 구조

### 1. Book Appointment 페이지 (`/appointments/book`)

**파일**: `app/appointments/book/page.tsx`

**컴포넌트**: `BookingForm` (`components/appointments/booking-form.tsx`)

**접근 권한**: 모든 로그인한 사용자

**UI 구성**:
- Back Button: `/appointments`로 이동
- 페이지 제목: "Book Appointment"
- 설명: "Schedule a new EEG monitoring appointment"

## Navigation Flow

### 진입 경로 (Entry Points)

1. **Dashboard** (`/dashboard`)
   - "Book New" 버튼 클릭
   - 모든 사용자에게 표시됨

2. **Appointments List** (`/appointments`)
   - "Book New Appointment" 버튼 클릭
   - 헤더 우측에 위치

3. **Patients List** (`/patients`)
   - 각 환자 카드의 "Book Appointment" 버튼 클릭
   - URL 파라미터로 `patientId` 전달: `/appointments/book?patientId=xxx`
   - 해당 환자가 자동으로 선택됨

### 출구 경로 (Exit Points)

1. **성공 시**
   - `/appointments`로 리다이렉트
   - 예약 목록 페이지로 이동

2. **취소 시**
   - Back Button: `/appointments`로 이동
   - Cancel 버튼: `router.back()` (이전 페이지로)

## Booking Form UI

### 폼 필드

#### 1. Select Patient (필수)
- **타입**: Select dropdown
- **필드명**: `patientId`
- **검증**: UUID 형식
- **기능**:
  - 사용자가 관리할 수 있는 환자 목록 표시
  - URL 파라미터로 `patientId`가 전달되면 자동 선택
  - 환자 이름과 생년월일 표시
  - 예: "홍길동 (DOB: 1/15/2010)"

#### 2. Appointment Type (필수)
- **타입**: Select dropdown
- **필드명**: `appointmentType`
- **옵션**:
  - `initial_consultation`: Initial Consultation
  - `eeg_monitoring`: EEG Monitoring (기본값)
  - `follow_up`: Follow-up

#### 3. Date & Time (필수)
- **타입**: `datetime-local` input
- **필드명**: `scheduledAt`
- **검증**: 미래 날짜/시간만 허용
- **제약**: `min={new Date().toISOString().slice(0, 16)}`

#### 4. Duration (필수)
- **타입**: Number input
- **필드명**: `durationMinutes`
- **기본값**: 60분
- **제약**: 최소 15분, 15분 단위 증가

#### 5. Notes (선택사항)
- **타입**: Textarea
- **필드명**: `notes`
- **용도**: 추가 정보 입력

### 액션 버튼

1. **Book Appointment** (주요 버튼)
   - 폼 제출
   - 로딩 중: "Booking..." 표시
   - 성공 시 `/appointments`로 이동

2. **Cancel** (보조 버튼)
   - `router.back()` 호출
   - 이전 페이지로 돌아감

## 상태 관리

### 로딩 상태

1. **Patients 로딩**
   - `loadingPatients` 상태
   - "Loading patients..." 메시지 표시

2. **폼 제출 로딩**
   - `loading` 상태
   - 버튼 비활성화 및 "Booking..." 표시

### 에러 처리

1. **환자 목록 로드 실패**
   - 에러 메시지 표시
   - 재시도 가능

2. **폼 제출 실패**
   - 에러 메시지를 빨간색 배경으로 표시
   - 폼은 유지되어 재시도 가능

3. **환자 없음**
   - "No patients found" 메시지
   - "Create Patient Profile" 버튼 표시
   - `/patients/new`로 링크

## API 통신

### 환자 목록 조회

```typescript
GET /api/patients
```

**응답**:
```json
{
  "patients": [
    {
      "id": "uuid",
      "user": {
        "firstName": "홍",
        "lastName": "길동"
      },
      "dateOfBirth": "2010-01-15T00:00:00.000Z"
    }
  ]
}
```

### 예약 생성

```typescript
POST /api/appointments
Content-Type: application/json

{
  "patientId": "uuid",
  "appointmentType": "eeg_monitoring",
  "scheduledAt": "2024-01-20T10:00:00.000Z",
  "durationMinutes": 60,
  "notes": "Optional notes"
}
```

**성공 응답**: 201 Created
**실패 응답**: 400/403/500 with error message

## 사용자 경험 (UX)

### 1. 환자 선택 개선

- URL 파라미터 지원으로 특정 환자로 바로 이동 가능
- 환자 목록에서 "Book Appointment" 클릭 시 해당 환자 자동 선택

### 2. 폼 검증

- 실시간 검증 (react-hook-form + zod)
- 필수 필드 명확히 표시 (*)
- 에러 메시지 즉시 표시

### 3. 피드백

- 로딩 상태 명확히 표시
- 성공/실패 메시지 제공
- 취소 옵션 제공

## 코드 구조

### BookingForm 컴포넌트

```typescript
// 주요 상태
- patients: Patient[]          // 환자 목록
- loading: boolean             // 폼 제출 로딩
- loadingPatients: boolean     // 환자 목록 로딩
- error: string | null         // 에러 메시지

// 주요 함수
- fetchPatients()              // 환자 목록 조회
- onSubmit()                   // 폼 제출 처리
```

### URL 파라미터 처리

```typescript
useEffect(() => {
  fetchPatients()
  
  // URL에서 patientId 파라미터 확인
  const urlParams = new URLSearchParams(window.location.search)
  const patientIdParam = urlParams.get("patientId")
  if (patientIdParam) {
    setValue("patientId", patientIdParam)
  }
}, [setValue])
```

## Navigation Flow 다이어그램

```
Dashboard
  └─ "Book New" 버튼
      └─> /appointments/book

Appointments List
  └─ "Book New Appointment" 버튼
      └─> /appointments/book

Patients List
  └─ "Book Appointment" 버튼 (각 환자별)
      └─> /appointments/book?patientId=xxx
          └─> 환자 자동 선택됨

/appointments/book
  ├─ Back Button → /appointments
  ├─ Cancel 버튼 → router.back()
  └─ Book Appointment 버튼
      └─> 성공 시 → /appointments
      └─> 실패 시 → 에러 메시지 표시
```

## 개선 사항

### 현재 구현된 기능

✅ 환자 선택 드롭다운
✅ 예약 유형 선택
✅ 날짜/시간 선택 (미래만 허용)
✅ 예약 시간 설정
✅ 메모 입력
✅ URL 파라미터로 환자 자동 선택
✅ 에러 처리
✅ 로딩 상태 표시

### 향후 개선 가능 사항

- [ ] 캘린더 UI로 날짜 선택 개선
- [ ] 시간 슬롯 선택 (예: 9:00, 10:00, 11:00...)
- [ ] 예약 가능한 시간대 표시
- [ ] 중복 예약 방지
- [ ] 예약 전 확인 모달
- [ ] 예약 생성 후 상세 페이지로 이동

## 관련 파일

- `app/appointments/book/page.tsx` - 예약 생성 페이지
- `components/appointments/booking-form.tsx` - 예약 생성 폼
- `app/api/appointments/route.ts` - 예약 생성 API
- `app/api/patients/route.ts` - 환자 목록 API
- `app/dashboard/page.tsx` - 대시보드 (진입점)
- `app/appointments/page.tsx` - 예약 목록 (진입점)
- `components/patients/patients-list.tsx` - 환자 목록 (진입점)
