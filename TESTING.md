# Phase 3: Admin Portal Testing Guide

This guide will help you test the Phase 3 Admin Portal implementation.

## Prerequisites

1. **Development server running**: `npm run dev`
2. **Database connected**: PostgreSQL should be running
3. **Admin user created**: See "Creating Admin User" below

## Step 1: Create an Admin User

You need an admin account to test the admin portal. You have two options:

### Option A: Using Prisma Studio (Recommended)

```bash
npm run db:studio
```

1. Open Prisma Studio (usually at http://localhost:5555)
2. Click on "User" model
3. Click "Add record"
4. Fill in:
   - Email: `admin@example.com`
   - Password Hash: Generate using the script below
   - First Name: `Admin`
   - Last Name: `User`
   - Role: `admin`
   - Created At: (auto)
   - Updated At: (auto)
5. Click "Save 1 change"

### Option B: Using the Script

First, generate a password hash:

```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('admin123', 10).then(hash => console.log(hash))"
```

Then create the user in the database:

```sql
-- Connect to PostgreSQL
psql -U eeg_user -d eeg_reservation

-- Create admin user (replace PASSWORD_HASH with the hash from above)
INSERT INTO users (id, email, password_hash, role, first_name, last_name, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'admin@example.com',
  'PASSWORD_HASH_HERE',
  'admin',
  'Admin',
  'User',
  NOW(),
  NOW()
);
```

### Option C: Using TypeScript Script

```bash
# Install tsx if not already installed
npm install -D tsx

# Run the script
npx tsx scripts/create-admin-user.ts
```

Default credentials:
- Email: `admin@example.com`
- Password: `admin123`

## Step 2: Test Admin Portal

### 2.1 Login as Admin

1. Navigate to http://localhost:3000/auth/login
2. Log in with admin credentials
3. You should be redirected to `/admin` (not `/dashboard`)

### 2.2 Test Admin Dashboard

**URL**: http://localhost:3000/admin

**Expected Features**:
- ✅ Statistics cards showing:
  - Total Patients
  - Total Appointments
  - Today's Appointments
  - Upcoming Appointments
- ✅ Quick action buttons
- ✅ Today's appointments list

**Test Checklist**:
- [ ] Dashboard loads without errors
- [ ] Statistics are displayed correctly
- [ ] Quick action buttons are clickable
- [ ] Today's appointments list shows (even if empty)

### 2.3 Test Patient Management

**URL**: http://localhost:3000/admin/patients

**Expected Features**:
- ✅ Patient list table
- ✅ Search functionality
- ✅ View patient details
- ✅ Edit patient option
- ✅ "Add New Patient" button

**Test Checklist**:
- [ ] Patient list loads
- [ ] Search bar filters patients correctly
- [ ] Click "View" opens patient details
- [ ] Table shows all patient information
- [ ] Can create a new patient (admin)

### 2.4 Test Appointment Management

**URL**: http://localhost:3000/admin/appointments

**Expected Features**:
- ✅ Appointment list with filters
- ✅ Search by patient name/email
- ✅ Status filter dropdown
- ✅ View appointment details
- ✅ Edit appointment option
- ✅ "Create Appointment" button

**Test Checklist**:
- [ ] Appointment list loads
- [ ] Search filters appointments
- [ ] Status filter works
- [ ] Click "View Details" opens appointment detail page
- [ ] Can create a new appointment (admin)

### 2.5 Test Appointment Detail Page

**URL**: http://localhost:3000/admin/appointments/[id]

**Expected Features**:
- ✅ Appointment information display
- ✅ Patient information display
- ✅ Edit appointment functionality
- ✅ Mark appointment completed
- ✅ Cancel appointment
- ✅ Appointment notes section
- ✅ Document management section

**Test Checklist**:
- [ ] Appointment details display correctly
- [ ] Click "Edit" allows editing
- [ ] Can mark appointment completed
- [ ] Can cancel appointment
- [ ] Can add appointment notes
- [ ] Can upload documents
- [ ] Can view/download documents

### 2.6 Test Appointment Notes

**On Appointment Detail Page**:

**Test Checklist**:
- [ ] Notes section displays
- [ ] Can add a new note
- [ ] Notes show timestamp and user
- [ ] Notes persist after page refresh

### 2.7 Test Document Management

**On Appointment Detail Page**:

**Test Checklist**:
- [ ] Document list displays
- [ ] "Upload Document" button works
- [ ] Can select and upload a file (PDF, DOC, images)
- [ ] Uploaded documents appear in list
- [ ] Can download documents
- [ ] Documents are stored in `/uploads/documents`

## Step 3: Test API Endpoints

### 3.1 Admin Stats API

```bash
# Test with curl (requires authentication cookie)
curl http://localhost:3000/api/admin/stats \
  -H "Cookie: your-session-cookie-here"
```

**Expected Response**:
```json
{
  "totalPatients": 0,
  "totalAppointments": 0,
  "todayAppointments": 0,
  "upcomingAppointments": 0,
  "completedAppointments": 0,
  "cancelledAppointments": 0
}
```

### 3.2 Patients API

```bash
curl http://localhost:3000/api/patients \
  -H "Cookie: your-session-cookie-here"
```

### 3.3 Appointments API

```bash
curl http://localhost:3000/api/appointments \
  -H "Cookie: your-session-cookie-here"
```

### 3.4 Appointment Notes API

```bash
# Get notes
curl http://localhost:3000/api/appointments/[id]/notes \
  -H "Cookie: your-session-cookie-here"

# Add note
curl -X POST http://localhost:3000/api/appointments/[id]/notes \
  -H "Cookie: your-session-cookie-here" \
  -H "Content-Type: application/json" \
  -d '{"content": "Test note"}'
```

### 3.5 Documents API

```bash
# List documents
curl http://localhost:3000/api/documents?patientId=[id] \
  -H "Cookie: your-session-cookie-here"

# Upload document (requires base64 encoding)
curl -X POST http://localhost:3000/api/documents \
  -H "Cookie: your-session-cookie-here" \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "...",
    "fileName": "test.pdf",
    "fileType": "application/pdf",
    "fileData": "base64-encoded-file-data"
  }'
```

## Step 4: Test Error Handling

### 4.1 Unauthorized Access

1. Log out
2. Try to access http://localhost:3000/admin
3. **Expected**: Redirected to login page

### 4.2 Non-Admin User

1. Log in as a parent/patient user
2. Try to access http://localhost:3000/admin
3. **Expected**: Redirected to `/dashboard`

## Step 5: Test File Uploads

1. Navigate to an appointment detail page
2. Click "Upload Document"
3. Select a file (PDF, DOC, or image)
4. Click "Upload"
5. **Expected**: File appears in document list
6. Click "Download" on the document
7. **Expected**: File downloads successfully

**Note**: Files are stored in `uploads/documents/` directory. Make sure this directory exists or is created automatically.

## Common Issues & Solutions

### Issue: "Forbidden" error when accessing admin routes

**Solution**: Make sure you're logged in as an admin or doctor user. Check your user role in the database.

### Issue: Statistics show 0 for everything

**Solution**: This is normal if you don't have any patients or appointments yet. Create some test data first.

### Issue: Document upload fails

**Solution**: 
- Check that `uploads/documents/` directory exists
- Check file size limits
- Verify file type is allowed (PDF, DOC, DOCX, JPG, JPEG, PNG)

### Issue: Notes not saving

**Solution**: Check browser console for errors. Verify the API endpoint is working.

## Test Data Creation

To test with data, you can:

1. **Create a patient (admin)**: Use `/admin/patients/new`
2. **Create an appointment (admin)**: Use `/admin/appointments/new`
3. **Or use Prisma Studio**: `npm run db:studio` to manually add test data

## Next Steps

After testing Phase 3:
- ✅ Verify all features work as expected
- ✅ Test error handling
- ✅ Test with different user roles
- ✅ Check responsive design on mobile
- ✅ Verify file uploads work correctly

If everything works, you're ready for **Phase 4: Integrations & Automation**!


