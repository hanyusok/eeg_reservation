# Patient 테이블 스키마 문서

## Prisma Schema 정의

```prisma
model Patient {
  id                      String    @id @default(uuid())
  userId                  String    @unique @map("user_id")
  parentId                String?   @map("parent_id")
  dateOfBirth             DateTime  @map("date_of_birth")
  medicalRecordNumber     String?   @unique @map("medical_record_number")
  medicalHistory          String?   @map("medical_history") @db.Text
  currentMedications      String?   @map("current_medications") @db.Text
  emergencyContactName    String    @map("emergency_contact_name")
  emergencyContactPhone   String    @map("emergency_contact_phone")
  createdAt               DateTime  @default(now()) @map("created_at")
  updatedAt               DateTime  @updatedAt @map("updated_at")

  // Relations
  user            User                @relation("PatientUser", fields: [userId], references: [id], onDelete: Cascade)
  parent          User?               @relation("ParentUser", fields: [parentId], references: [id], onDelete: SetNull)
  appointments    Appointment[]
  documents       MedicalDocument[]

  @@map("patients")
}
```

## PostgreSQL 테이블 구조

### 테이블명: `patients`

| 컬럼명 (DB) | 컬럼명 (Prisma) | 데이터 타입 | NULL 허용 | 기본값 | 제약조건 | 설명 |
|------------|----------------|-----------|----------|--------|---------|------|
| `id` | `id` | UUID | NOT NULL | `uuid_generate_v4()` | PRIMARY KEY | 환자 고유 ID |
| `user_id` | `userId` | UUID | NOT NULL | - | UNIQUE, FOREIGN KEY → `users.id` | 환자 User 계정 ID (1:1 관계) |
| `parent_id` | `parentId` | UUID | NULL | - | FOREIGN KEY → `users.id` | 부모/보호자 User ID (선택사항) |
| `date_of_birth` | `dateOfBirth` | TIMESTAMP | NOT NULL | - | - | 생년월일 |
| `medical_record_number` | `medicalRecordNumber` | VARCHAR | NULL | - | UNIQUE | 의료 기록 번호 (MRN) |
| `medical_history` | `medicalHistory` | TEXT | NULL | - | - | 과거 병력 |
| `current_medications` | `currentMedications` | TEXT | NULL | - | - | 현재 복용 중인 약물 |
| `emergency_contact_name` | `emergencyContactName` | VARCHAR | NOT NULL | - | - | 비상 연락처 이름 |
| `emergency_contact_phone` | `emergencyContactPhone` | VARCHAR | NOT NULL | - | - | 비상 연락처 전화번호 |
| `created_at` | `createdAt` | TIMESTAMP | NOT NULL | `now()` | - | 생성 일시 |
| `updated_at` | `updatedAt` | TIMESTAMP | NOT NULL | `now()` | - | 수정 일시 (자동 업데이트) |

## 관계 (Relations)

### 1. User (PatientUser) - 1:1 관계
- **필드**: `userId` → `users.id`
- **관계**: 각 Patient는 하나의 User 계정과 연결됨
- **Cascade Delete**: User가 삭제되면 Patient도 자동 삭제

### 2. User (ParentUser) - 다:1 관계 (선택사항)
- **필드**: `parentId` → `users.id`
- **관계**: 여러 Patient가 하나의 부모 User를 가질 수 있음
- **SetNull Delete**: 부모 User가 삭제되면 `parentId`가 NULL로 설정됨
- **용도**: 부모/보호자가 여러 자녀의 환자 프로필을 관리할 때 사용

### 3. Appointment - 1:다 관계
- **관계**: 하나의 Patient는 여러 Appointment를 가질 수 있음
- **필드**: `appointments.patientId` → `patients.id`

### 4. MedicalDocument - 1:다 관계
- **관계**: 하나의 Patient는 여러 MedicalDocument를 가질 수 있음
- **필드**: `documents.patientId` → `patients.id`

## 제약조건 (Constraints)

1. **PRIMARY KEY**: `id`
2. **UNIQUE**: 
   - `user_id` (각 User는 하나의 Patient 프로필만 가질 수 있음)
   - `medical_record_number` (의료 기록 번호는 고유해야 함)
3. **FOREIGN KEY**:
   - `user_id` → `users.id` (ON DELETE CASCADE)
   - `parent_id` → `users.id` (ON DELETE SET NULL)
4. **NOT NULL**: 
   - `id`, `user_id`, `date_of_birth`, `emergency_contact_name`, `emergency_contact_phone`, `created_at`, `updated_at`

## 인덱스 (Indexes)

Prisma가 자동으로 생성하는 인덱스:
- `PRIMARY KEY` 인덱스: `id`
- `UNIQUE` 인덱스: `user_id`, `medical_record_number`
- `FOREIGN KEY` 인덱스: `parent_id` (자동 생성됨)

## 사용 시나리오

### 시나리오 1: 환자가 자신의 프로필 생성
- User (role: "patient") 생성
- Patient 생성 시 `userId`를 해당 User의 ID로 설정
- `parentId`는 NULL

### 시나리오 2: 부모가 자녀의 환자 프로필 생성
- User (role: "parent") 생성
- 자녀를 위한 User (role: "patient") 생성
- Patient 생성 시:
  - `userId`: 자녀 User의 ID
  - `parentId`: 부모 User의 ID

### 시나리오 3: 여러 자녀 관리
- 하나의 부모 User가 여러 Patient를 생성 가능
- 각 Patient는 다른 `userId`를 가지지만 같은 `parentId`를 가짐

## SQL 쿼리 예시

### Patient 테이블 생성 SQL (Prisma가 생성)
```sql
CREATE TABLE "patients" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "parent_id" TEXT,
    "date_of_birth" TIMESTAMP(3) NOT NULL,
    "medical_record_number" TEXT,
    "medical_history" TEXT,
    "current_medications" TEXT,
    "emergency_contact_name" TEXT NOT NULL,
    "emergency_contact_phone" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patients_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "patients_user_id_key" ON "patients"("user_id");
CREATE UNIQUE INDEX "patients_medical_record_number_key" ON "patients"("medical_record_number");
CREATE INDEX "patients_parent_id_idx" ON "patients"("parent_id");

ALTER TABLE "patients" ADD CONSTRAINT "patients_user_id_fkey" 
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    
ALTER TABLE "patients" ADD CONSTRAINT "patients_parent_id_fkey" 
    FOREIGN KEY ("parent_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
```

### 유용한 쿼리

#### 모든 환자 조회 (부모 정보 포함)
```sql
SELECT 
    p.id,
    p.user_id,
    p.parent_id,
    u.first_name || ' ' || u.last_name AS patient_name,
    u.email AS patient_email,
    parent_u.first_name || ' ' || parent_u.last_name AS parent_name,
    p.date_of_birth,
    p.medical_record_number,
    p.created_at
FROM patients p
JOIN users u ON p.user_id = u.id
LEFT JOIN users parent_u ON p.parent_id = parent_u.id
ORDER BY p.created_at DESC;
```

#### 특정 부모의 모든 환자 조회
```sql
SELECT 
    p.*,
    u.first_name || ' ' || u.last_name AS patient_name,
    u.email AS patient_email
FROM patients p
JOIN users u ON p.user_id = u.id
WHERE p.parent_id = 'parent-user-id-here';
```

#### 환자별 예약 수 조회
```sql
SELECT 
    p.id,
    u.first_name || ' ' || u.last_name AS patient_name,
    COUNT(a.id) AS appointment_count
FROM patients p
JOIN users u ON p.user_id = u.id
LEFT JOIN appointments a ON a.patient_id = p.id
GROUP BY p.id, u.first_name, u.last_name
ORDER BY appointment_count DESC;
```

## 주의사항

1. **User와 Patient의 1:1 관계**: 
   - `user_id`가 UNIQUE이므로 각 User는 하나의 Patient 프로필만 가질 수 있음
   - 같은 User에 대해 여러 Patient를 생성하려면 새로운 User 계정을 먼저 생성해야 함

2. **Parent 관계**:
   - `parentId`는 선택사항이므로 NULL 가능
   - 부모가 여러 자녀를 관리하려면 각 자녀마다 별도의 User 계정과 Patient 프로필이 필요

3. **Cascade Delete**:
   - User가 삭제되면 해당 Patient도 자동 삭제됨
   - Patient가 삭제되면 관련 Appointment와 MedicalDocument도 자동 삭제됨

4. **Medical Record Number**:
   - 선택사항이지만 UNIQUE 제약조건이 있음
   - NULL은 여러 개 허용되지만, 값이 있으면 고유해야 함
