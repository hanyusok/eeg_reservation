# Admin Account Access & Usage Guide

## 🔐 Creating an Admin Account

### Method 1: Using the Script (Recommended)

The easiest way to create an admin account is using the provided script:

```bash
npm run create-admin
```

**Default Credentials:**
- **Email**: `admin@example.com`
- **Password**: `admin123`

**Custom Credentials:**

You can customize the admin credentials using environment variables:

```bash
ADMIN_EMAIL="your-admin@example.com" \
ADMIN_PASSWORD="your-secure-password" \
ADMIN_FIRST_NAME="Your" \
ADMIN_LAST_NAME="Name" \
npm run create-admin
```

Or add to your `.env` file:
```env
ADMIN_EMAIL=your-admin@example.com
ADMIN_PASSWORD=your-secure-password
ADMIN_FIRST_NAME=Your
ADMIN_LAST_NAME=Name
```

### Method 2: Using Prisma Studio

1. Open Prisma Studio:
   ```bash
   npm run db:studio
   ```

2. Navigate to http://localhost:5555
3. Click on the **User** model
4. Click **"Add record"**
5. Fill in the form:
   - **Email**: `admin@example.com`
   - **Password Hash**: Generate using bcrypt (see below)
   - **First Name**: `Admin`
   - **Last Name**: `User`
   - **Role**: `admin` (select from dropdown)
   - **Phone**: (optional)
6. Click **"Save 1 change"**

**Generate Password Hash:**
```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('admin123', 10).then(hash => console.log(hash))"
```

---

## 🚀 Logging In as Admin

### Step 1: Start the Development Server

```bash
npm run dev
```

### Step 2: Navigate to Login Page

Open your browser and go to:
```
http://localhost:3000/auth/login
```

### Step 3: Enter Credentials

- **Email**: `admin@example.com` (or your custom admin email)
- **Password**: `admin123` (or your custom password)

### Step 4: Sign In

Click the **"Sign in"** button. You will be automatically redirected to the admin dashboard at `/admin`.

---

## 📊 Admin Dashboard Overview

Once logged in, you'll have access to the admin portal with the following features:

### Main Dashboard
**URL**: `http://localhost:3000/admin`

**Features:**
- **Statistics Overview**:
  - Total Patients
  - Total Appointments
  - Upcoming Appointments
  - Today's Appointments
- **Today's Appointments List**: View all appointments scheduled for today
- **Quick Actions**: Quick links to common tasks

### Patient Management
**URL**: `http://localhost:3000/admin/patients`

**Features:**
- View all patients in the system
- Search patients by name, email, or medical record number
- View patient details
- Access patient profiles

**Actions Available:**
- Search and filter patients
- View patient information
- Navigate to patient's appointments

### Appointment Management
**URL**: `http://localhost:3000/admin/appointments`

**Features:**
- View all appointments
- Filter by status (scheduled, completed, cancelled)
- Filter by date range
- Search appointments

**Actions Available:**
- View appointment details
- Edit appointments
- Cancel appointments
- Add appointment notes
- Upload medical documents

### Appointment Detail Page
**URL**: `http://localhost:3000/admin/appointments/[id]`

**Features:**
- **Appointment Information**:
  - Patient details
  - Appointment type
  - Scheduled date and time
  - Duration
  - Status
- **Appointment Notes**:
  - View all notes
  - Add new notes
  - Edit notes
- **Medical Documents**:
  - View uploaded documents
  - Upload new documents
  - Download documents
- **Actions**:
  - Edit appointment
  - Change status
  - Cancel appointment

### Settings (Phase 4)
**URL**: `http://localhost:3000/admin/settings`

**Features:**
- Configure Zapier webhook URL
- View email/SMS provider settings
- Configure Calendly integration

---

## 🎯 Common Admin Tasks

### 1. View All Patients

1. Navigate to **Admin Dashboard** → **Patients** (or go to `/admin/patients`)
2. Use the search bar to find specific patients
3. Click on a patient to view their details

### 2. View Today's Appointments

1. Go to **Admin Dashboard** (`/admin`)
2. Scroll to **"Today's Appointments"** section
3. View all appointments scheduled for today

### 3. Manage an Appointment

1. Go to **Appointments** (`/admin/appointments`)
2. Click on any appointment to view details
3. On the appointment detail page:
   - **Edit**: Click "Edit" to modify appointment details
   - **Add Note**: Use the notes section to add appointment notes
   - **Upload Document**: Click "Upload Document" to add medical documents
   - **Change Status**: Update appointment status (scheduled → completed → cancelled)

### 4. Add Appointment Notes

1. Navigate to an appointment detail page
2. Scroll to **"Appointment Notes"** section
3. Enter your note in the text area
4. Click **"Add Note"**
5. The note will be saved with timestamp and your name

### 5. Upload Medical Documents

1. Navigate to an appointment detail page
2. Scroll to **"Medical Documents"** section
3. Click **"Upload Document"**
4. Select a file (PDF, DOC, DOCX, or image)
5. Enter document type and description
6. Click **"Upload"**
7. The document will appear in the list

### 6. Search and Filter

**Patients:**
- Search by name, email, or medical record number
- Results update as you type

**Appointments:**
- Filter by status (All, Scheduled, Completed, Cancelled)
- Filter by date range
- Search by patient name

---

## 🔒 Security & Permissions

### Admin Access Control

- **Admin users** can access all admin routes (`/admin/*`)
- **Doctor users** can also access admin routes
- **Parent/Patient users** are redirected to `/dashboard` if they try to access `/admin`
- **Unauthenticated users** are redirected to `/auth/login`

### What Admins Can Do

✅ **Full Access:**
- View all patients
- View all appointments
- Edit any appointment
- Cancel any appointment
- Add notes to any appointment
- Upload documents for any patient
- View all medical documents
- Access system settings

❌ **What Admins Cannot Do:**
- Cannot delete patients (soft delete only)
- Cannot delete appointments (cancel only)
- Cannot modify user passwords directly (must use password reset)

---

## 🐛 Troubleshooting

### Issue: Can't Log In

**Symptoms**: Invalid email or password error

**Solutions:**
1. Verify the admin user exists:
   ```bash
   npm run db:studio
   ```
   Check the User model for your admin email

2. Verify password hash is correct (if created manually)

3. Try creating a new admin user:
   ```bash
   npm run create-admin
   ```

### Issue: Redirected to `/dashboard` Instead of `/admin`

**Symptoms**: After login, you're sent to `/dashboard` instead of `/admin`

**Solutions:**
1. Check your user role in the database:
   ```bash
   npm run db:studio
   ```
   Verify the `role` field is set to `"admin"`

2. Clear browser cookies and try again

3. Check middleware configuration in `middleware.ts`

### Issue: "Forbidden" Error on Admin Pages

**Symptoms**: 403 Forbidden error when accessing admin routes

**Solutions:**
1. Verify you're logged in (check session)
2. Verify your user role is `admin` or `doctor`
3. Try logging out and logging back in
4. Check browser console for errors

### Issue: Statistics Show 0

**Symptoms**: Dashboard shows all zeros for statistics

**Solutions:**
- This is normal if you don't have any data yet
- Create some test data:
  1. Create a patient at `/patients/new`
  2. Create an appointment at `/appointments/book`
  3. Refresh the admin dashboard

### Issue: Document Upload Fails

**Symptoms**: Error when uploading documents

**Solutions:**
1. Check file size (should be reasonable, e.g., < 10MB)
2. Check file type (PDF, DOC, DOCX, or images)
3. Verify `uploads/documents/` directory exists (created automatically)
4. Check browser console for detailed error messages
5. Check server logs for errors

---

## 📝 Quick Reference

### Admin URLs

- **Login**: `http://localhost:3000/auth/login`
- **Dashboard**: `http://localhost:3000/admin`
- **Patients**: `http://localhost:3000/admin/patients`
- **Appointments**: `http://localhost:3000/admin/appointments`
- **Settings**: `http://localhost:3000/admin/settings`

### Default Admin Credentials

- **Email**: `admin@example.com`
- **Password**: `admin123`

⚠️ **Important**: Change these credentials in production!

### Useful Commands

```bash
# Create admin user
npm run create-admin

# Open database studio
npm run db:studio

# Start development server
npm run dev

# Generate Prisma client
npm run db:generate
```

---

## 🎓 Next Steps

After accessing the admin account:

1. **Explore the Dashboard**: Familiarize yourself with the statistics and layout
2. **Create Test Data**: Create some patients and appointments to see the system in action
3. **Test Features**: Try adding notes, uploading documents, and managing appointments
4. **Configure Settings**: Set up Zapier, email, and SMS integrations (Phase 4)

---

## 📚 Related Documentation

- **Quick Test Guide**: See `QUICK_TEST.md` for testing steps
- **Testing Guide**: See `TESTING.md` for comprehensive testing instructions
- **Setup Guide**: See `SETUP.md` for initial setup instructions

---

**Need Help?** Check the troubleshooting section above or review the error messages in the browser console and server logs.

