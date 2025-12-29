# 🎓 Bharat Vidya LMS - Demo Setup Guide

## 📋 Quick Setup (5 Minutes)

### Step 1: Disable Email Confirmation in Supabase
1. Go to **Supabase Dashboard** → **Authentication** → **Providers**
2. Click on **Email** provider
3. **Disable** "Confirm email"
4. Click **Save**

### Step 2: Create Demo Accounts in Supabase

Go to **Supabase Dashboard** → **Authentication** → **Users** and create these accounts:

#### Admin Account
- **Email:** `admin@school.com`
- **Password:** `admin123`
- **Auto Confirm:** ✅ Yes

#### Teacher Account
- **Email:** `teacher@school.com`
- **Password:** `teacher123`
- **Auto Confirm:** ✅ Yes

#### Parent Account (Optional)
- **Email:** `parent@school.com`
- **Password:** `parent123`
- **Auto Confirm:** ✅ Yes

### Step 3: Set Roles in Supabase SQL Editor

Run this SQL in **Supabase Dashboard** → **SQL Editor**:

```sql
-- Update roles for demo accounts
UPDATE profiles SET role = 'admin', name = 'Admin User' WHERE email = 'admin@school.com';
UPDATE profiles SET role = 'teacher', name = 'Teacher User' WHERE email = 'teacher@school.com';
UPDATE profiles SET role = 'parent', name = 'Parent User' WHERE email = 'parent@school.com';

-- If profiles don't exist yet, insert them (get user IDs from Authentication tab)
-- INSERT INTO profiles (id, email, name, role) VALUES 
-- ('USER_ID_FROM_AUTH', 'admin@school.com', 'Admin User', 'admin'),
-- ('USER_ID_FROM_AUTH', 'teacher@school.com', 'Teacher User', 'teacher'),
-- ('USER_ID_FROM_AUTH', 'parent@school.com', 'Parent User', 'parent');
```

### Step 4: Add Sample Data (Optional)

```sql
-- Add sample students
INSERT INTO students (roll_no, name, class, section, parent_email, phone) VALUES
('101', 'Rahul Sharma', '10', 'A', 'parent@school.com', '9876543210'),
('102', 'Priya Patel', '10', 'A', 'parent2@example.com', '9876543211'),
('103', 'Amit Kumar', '10', 'B', 'parent3@example.com', '9876543212');

-- Link parent to student (get student ID from students table)
UPDATE profiles 
SET linked_student_id = (SELECT id FROM students WHERE roll_no = '101') 
WHERE email = 'parent@school.com';
```

### Step 5: Configure Resend API (For Email Features)

1. Sign up at [resend.com](https://resend.com)
2. Get your API key
3. Add to Vercel Environment Variables:
   ```
   RESEND_API_KEY=re_your_api_key_here
   ```
4. Verify a domain or use Resend's test mode

---

## 🎯 Demo Workflow

### As Admin (`admin@school.com`)
1. **Promote Users:** Admin Panel → Teacher Onboarding
2. **Link Parents:** Admin Panel → Parent-Student Link
3. **Send Notices:** Admin Panel → School Notices → Send to All/Class
4. **View History:** Admin Panel → Message History

### As Teacher (`teacher@school.com`)
1. **Add Students:** Students → Add Student (auto-backfills assignments)
2. **Mark Attendance:** Attendance → Mark Daily → Select Date
3. **Send Reports:** Attendance → Monthly Report → Send Reports to Parents
4. **Create Assignments:** Assignments → Create Assignment (auto-enrolls students)
5. **Track Progress:** Assignments → View Details (per-student tracking)
6. **Manage Fees:** Fees → Mark Paid / Send Fee Reminders

### As Parent (`parent@school.com`)
1. **View Child's Attendance:** Attendance → See history
2. **Track Assignments:** Assignments → Mark as Completed
3. **Check Fees:** Fees → View pending/paid status
4. **Receive Emails:** Attendance reports, Fee reminders, School notices

---

## 📧 Email Features (Manual Triggers)

All emails are **manually triggered** by Admin/Teacher:

| Feature | Trigger Location | Persona |
|---------|-----------------|---------|
| **School Notices** | Admin Panel → Notices → Send Notice | Admin |
| **Attendance Reports** | Attendance → Monthly Report → Send Reports | Teacher |
| **Fee Reminders** | Fees → Send Fee Reminders | Teacher |

---

## ✅ Verification Checklist

- [ ] Email confirmation disabled in Supabase
- [ ] Demo accounts created (admin, teacher, parent)
- [ ] Roles assigned via SQL
- [ ] Sample students added
- [ ] Parent linked to student
- [ ] Resend API key configured
- [ ] All three personas can log in

---

## 🚀 Ready to Demo!

Your LMS is now fully configured for demonstration with:
- ✅ Working login credentials
- ✅ Role-based access (Admin, Teacher, Parent)
- ✅ Manual email triggers
- ✅ Complete attendance, assignment, and fee tracking
- ✅ Automated backfilling and data integrity

**Demo Credentials:**
- Admin: `admin@school.com` / `admin123`
- Teacher: `teacher@school.com` / `teacher123`
- Parent: `parent@school.com` / `parent123`
