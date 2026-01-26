# 🦷 Dental Clinic SaaS Platform

A complete **Multi-Tenant SaaS platform** for dental clinic management, built with modern technologies and ready for production deployment.

![Arabic First](https://img.shields.io/badge/Arabic-First-success)
![Multi Tenant](https://img.shields.io/badge/Multi--Tenant-Architecture-blue)
![Stripe](https://img.shields.io/badge/Payments-Stripe-purple)

## 📋 Overview

This is a **production-ready** dental clinic management system that supports:
- ✅ **Multi-Tenancy**: Multiple clinics with complete data isolation
- ✅ **4 User Roles**: Super Admin, Clinic Admin, Staff, Patient
- ✅ **Advanced Booking System**: Conflict prevention & service scheduling
- ✅ **Subscription Management**: Stripe-powered monthly/yearly plans
- ✅ **Arabic RTL Interface**: Premium dark medical UI
- ✅ **Row-Level Security**: Complete data protection with Supabase RLS

---

## 🏗️ Architecture

### Multi-Tenancy Model
```
┌─────────────────────────────────────┐
│         Supabase Database           │
│  ┌─────────────────────────────┐   │
│  │  Clinic 1 Data (clinic_id)  │   │
│  │  └─ RLS Policies            │   │
│  ├─────────────────────────────┤   │
│  │  Clinic 2 Data (clinic_id)  │   │
│  │  └─ RLS Policies            │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

Each clinic's data is completely isolated using:
- `clinic_id` foreign keys
- Row Level Security (RLS) policies
- JWT claims with `role` and `clinic_id`

### User Roles & Permissions

| Role           | Description             | Permissions                                    |
|----------------|-------------------------|------------------------------------------------|
| **Super Admin**| Platform Manager        | Full access to all clinics, subscriptions      |
| **Clinic Admin**| Clinic Owner           | Manage clinic, doctors, services, appointments |
| **Staff**      | Clinic Employee         | View and manage appointments only              |
| **Patient**    | End User                | Book appointments, view own appointments       |

---

## 🛠️ Tech Stack

### Frontend
- **React 18** with Vite
- **Tailwind CSS** (RTL optimized)
- **React Router v6** for routing
- **Context API** for state management
- **Arabic fonts** (Cairo, Tajawal)

### Backend
- **Supabase**
  - PostgreSQL database
  - Authentication (JWT)
  - Row Level Security
  - Edge Functions (Deno)

### Payments
- **Stripe**
  - Checkout Sessions
  - Webhooks
  - Subscription management

---

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- Stripe account

### 1. Clone & Install
```bash
cd "dental clinic"
npm install
```

### 2. Environment Setup
Create a `.env` file in the root directory:
```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_secret

# App
VITE_APP_URL=http://localhost:3000
```

### 3. Database Setup

#### Run Migrations
```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

Or manually run SQL files in Supabase Dashboard:
1. Navigate to SQL Editor
2. Execute files in order:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_rls_policies.sql`
   - `supabase/migrations/003_functions.sql`

#### Create First Super Admin
```sql
-- In Supabase SQL Editor
-- 1. Create auth user (use Supabase Dashboard Auth)
-- 2. Add to profiles table:
INSERT INTO profiles (id, role, full_name, phone)
VALUES (
  'user-uuid-from-auth',
  'super_admin',
  'Admin Name',
  '07XXXXXXXXX'
);
```

### 4. Deploy Stripe Webhook (Supabase Edge Function)
```bash
# Deploy webhook function
supabase functions deploy stripe-webhook

# Set environment variables
supabase secrets set STRIPE_SECRET_KEY=sk_test_your_key
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_your_secret
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_key
```

### 5. Configure Stripe Webhook
1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-project.supabase.co/functions/v1/stripe-webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`

---

## 🚀 Running Locally

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📱 Features

### 🔐 Authentication
- Email/Password authentication
- JWT with role & clinic_id claims
- Protected routes by role

### 👨‍⚕️ Clinic Management
- Add/edit doctors with specializations
- Create services with pricing & duration
- Manage clinic information
- Subscription status tracking

### 📅 Appointment System
- **Multi-step booking flow**:
  1. Select clinic & service
  2. Choose doctor
  3. Pick date & time
- **Conflict prevention**: Database-level checks
- **Auto-calculation**: End time based on service duration
- **Status management**: Pending → Confirmed → Completed
- **Cancellation**: Patients can cancel pending appointments

### 💳 Subscription & Payments
- **Monthly Plan**: $29/month
- **Yearly Plan**: $279/year (save 20%)
- Stripe Checkout integration
- Automatic subscription status updates via webhooks
- Access control based on active subscription

### 🎨 UI/UX
- **RTL (Right-to-Left)** Arabic layout
- **Dark medical luxury theme**:
  - Deep navy backgrounds
  - Purple/teal gradients
  - Glass-morphism effects
- **Fully responsive** (mobile, tablet, desktop)
- **Smooth animations** and transitions

---

## 📂 Project Structure

```
dental-clinic/
├── src/
│   ├── components/
│   │   ├── ui/              # Reusable UI components
│   │   ├── Layout.jsx       # Main layout
│   │   ├── Navbar.jsx       # Top navigation
│   │   ├── Sidebar.jsx      # Role-based sidebar
│   │   └── ProtectedRoute.jsx
│   ├── context/
│   │   └── AuthContext.jsx  # Authentication context
│   ├── lib/
│   │   ├── supabase.js      # Supabase client
│   │   └── stripe.js        # Stripe client
│   ├── pages/
│   │   ├── SuperAdmin/      # Super admin dashboards
│   │   ├── ClinicAdmin/     # Clinic admin pages
│   │   ├── Appointments/    # Booking & management
│   │   ├── Login.jsx
│   │   └── Register.jsx
│   ├── App.jsx              # Routing configuration
│   ├── main.jsx             # React entry point
│   └── index.css            # Global styles
├── supabase/
│   ├── migrations/          # Database migrations
│   └── functions/           # Edge Functions
│       └── stripe-webhook/
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

---

## 🔒 Security

### Row Level Security (RLS)
All tables have RLS enabled with policies based on:
- User's `role` from JWT
- User's `clinic_id` from JWT
- Prevents cross-tenant data access

### JWT Claims
User metadata includes:
```json
{
  "role": "clinic_admin",
  "clinic_id": "uuid-here"
}
```

### Supabase Policies Example
```sql
-- Clinic Admin can only see their clinic's doctors
CREATE POLICY "clinic_admin_read_doctors" ON doctors
  FOR SELECT
  USING (
    get_user_role() = 'clinic_admin' AND
    clinic_id = get_user_clinic_id()
  );
```

---

## 🌐 Deployment

### Frontend (Vercel/Netlify)
```bash
# Build
npm run build

# Deploy dist/ folder
# Set environment variables in dashboard
```

### Backend (Supabase)
- Already hosted on Supabase
- Deploy Edge Functions using Supabase CLI
- No additional hosting needed

### Environment Variables (Production)
Update all environment variables with production values:
- Supabase production URL & keys
- Stripe live keys (not test keys)
- Update webhook URL to production

---

## 📊 Database Schema

### Core Tables
- `clinics`: Tenant records with subscription info
- `profiles`: User profiles (extends auth.users)
- `doctors`: Doctor information per clinic
- `services`: Medical services with pricing
- `appointments`: Booking records
- `subscriptions`: Stripe subscription tracking
- `payments`: Payment transaction history

### Key Relationships
```
clinics (1) ──< (N) doctors
clinics (1) ──< (N) services
clinics (1) ──< (N) appointments
appointments (N) ──> (1) doctors
appointments (N) ──> (1) services
appointments (N) ──> (1) patients (profiles)
```

---

## 🧪 Testing

### Manual Testing Checklist
- [ ] Register as patient
- [ ] Login as different roles
- [ ] Book appointment (full flow)
- [ ] Clinic admin manages doctors/services
- [ ] Staff confirms appointments
- [ ] Super admin views all clinics
- [ ] Stripe subscription flow (test mode)
- [ ] Webhook receives events
- [ ] RLS prevents cross-clinic access

---

## 🐛 Troubleshooting

### Common Issues

**1. Supabase RLS Errors**
- Ensure JWT claims are set correctly
- Check if user profile exists
- Verify RLS policies match user role

**2. Stripe Webhook Not Working**
- Check webhook signature verification
- Ensure environment variables are set
- Test with Stripe CLI: `stripe listen --forward-to localhost:54321/functions/v1/stripe-webhook`

**3. Appointment Conflicts**
- Database function `check_appointment_conflict()` prevents overlaps
- Ensure service duration is set correctly

---

## 📝 TODO (Optional Enhancements)
- [ ] Email notifications (appointment confirmations)
- [ ] SMS reminders via Twilio
- [ ] Patient medical records
- [ ] Invoice generation
- [ ] Analytics dashboard
- [ ] Mobile app (React Native)

---

## 📄 License
This project is provided as-is for commercial use.

---

## 👨‍💻 Support
For questions or issues, please create an issue in the repository.

---

## 📞 Contact
Built with ❤️ for dental clinics

**Happy Coding! 🚀**
