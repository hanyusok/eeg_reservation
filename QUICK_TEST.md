# Quick Test Guide for Phase 3 Admin Portal

## ✅ Admin User Created!

An admin user has been created with these credentials:
- **Email**: `admin@example.com`
- **Password**: `admin123`

## 🚀 Quick Test Steps

### 1. Start the Development Server (if not running)

```bash
npm run dev
```

### 2. Log In as Admin

1. Open http://localhost:3000/auth/login
2. Enter credentials:
   - Email: `admin@example.com`
   - Password: `admin123`
3. Click "Sign in"
4. You should be redirected to `/admin` (admin dashboard)

### 3. Test Admin Dashboard

**URL**: http://localhost:3000/admin

**What to check**:
- ✅ Page loads without errors
- ✅ Statistics cards display (may show 0s if no data)
- ✅ Quick action buttons are visible
- ✅ Today's appointments section shows (may be empty)

### 4. Test Patient Management

**URL**: http://localhost:3000/admin/patients

**What to check**:
- ✅ Patient list page loads
- ✅ Search bar is functional
- ✅ Table displays patient information (if any patients exist)

### 5. Test Appointment Management

**URL**: http://localhost:3000/admin/appointments

**What to check**:
- ✅ Appointment list loads
- ✅ Search and filter options work
- ✅ Can view appointment details

### 6. Test Appointment Detail Page

1. Click on any appointment (or create one first)
2. **URL**: http://localhost:3000/admin/appointments/[id]

**What to check**:
- ✅ Appointment information displays
- ✅ Patient information displays
- ✅ "Edit" button works
- ✅ Can add appointment notes
- ✅ Can upload documents

### 7. Test Document Upload

1. On appointment detail page, click "Upload Document"
2. Select a file (PDF, DOC, or image)
3. Click "Upload"
4. **Expected**: File appears in document list
5. Click "Download" to verify download works

## 🐛 Troubleshooting

### Issue: Redirected to /dashboard instead of /admin

**Solution**: Check that your user role is "admin" in the database. You can verify with:
```bash
npm run db:studio
```
Then check the User model and verify the role field.

### Issue: "Forbidden" error on API calls

**Solution**: Make sure you're logged in and your session is valid. Try logging out and logging back in.

### Issue: Statistics show 0

**Solution**: This is normal if you don't have any patients or appointments. Create some test data first:
1. Create a patient at `/patients/new`
2. Create an appointment at `/appointments/book`

### Issue: Document upload fails

**Solution**: 
- Check browser console for errors
- Verify `uploads/documents/` directory exists (it should be created automatically)
- Check file size (should be reasonable, e.g., < 10MB)

## 📝 Test Checklist

- [ ] Admin dashboard loads
- [ ] Statistics API works (`/api/admin/stats`)
- [ ] Patient list page works
- [ ] Appointment list page works
- [ ] Appointment detail page works
- [ ] Can edit appointments
- [ ] Can add appointment notes
- [ ] Can upload documents
- [ ] Can download documents
- [ ] Search functionality works
- [ ] Filters work correctly
- [ ] Non-admin users are redirected away from `/admin`

## 🎯 Expected Behavior

1. **Admin/Doctor users**: Can access all admin routes
2. **Parent/Patient users**: Redirected to `/dashboard` when trying to access `/admin`
3. **Unauthenticated users**: Redirected to `/auth/login`

## 📊 API Endpoints to Test

Test these endpoints (requires authentication):

- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/patients` - List all patients (admin only)
- `GET /api/appointments` - List all appointments (admin only)
- `GET /api/appointments/[id]` - Get appointment details
- `POST /api/appointments/[id]/notes` - Add appointment note
- `GET /api/documents?patientId=[id]` - List documents
- `POST /api/documents` - Upload document

## ✅ Success Criteria

Phase 3 is working correctly if:
1. Admin can access `/admin` dashboard
2. All statistics load correctly
3. Patient and appointment management pages work
4. Document upload/download works
5. Appointment notes can be added
6. Non-admin users cannot access admin routes

If all these work, Phase 3 is successfully implemented! 🎉


