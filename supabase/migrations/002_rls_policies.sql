-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- Complete Multi-Tenant Data Isolation
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- HELPER FUNCTION: Get user role from JWT
-- =====================================================

CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
BEGIN
  RETURN (auth.jwt() -> 'user_metadata' ->> 'role')::user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_user_clinic_id()
RETURNS UUID AS $$
BEGIN
  RETURN (auth.jwt() -> 'user_metadata' ->> 'clinic_id')::UUID;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- CLINICS POLICIES
-- =====================================================

-- Super Admin: Full access
CREATE POLICY "super_admin_all_clinics" ON clinics
  FOR ALL
  USING (get_user_role() = 'super_admin')
  WITH CHECK (get_user_role() = 'super_admin');

-- Clinic Admin/Staff: Read their own clinic
CREATE POLICY "clinic_users_read_own_clinic" ON clinics
  FOR SELECT
  USING (
    get_user_role() IN ('clinic_admin', 'staff') AND
    id = get_user_clinic_id()
  );

-- Clinic Admin: Update their own clinic
CREATE POLICY "clinic_admin_update_own_clinic" ON clinics
  FOR UPDATE
  USING (
    get_user_role() = 'clinic_admin' AND
    id = get_user_clinic_id()
  )
  WITH CHECK (
    get_user_role() = 'clinic_admin' AND
    id = get_user_clinic_id()
  );

-- Patients: Read any clinic (for booking)
CREATE POLICY "patients_read_all_clinics" ON clinics
  FOR SELECT
  USING (get_user_role() = 'patient');

-- =====================================================
-- PROFILES POLICIES
-- =====================================================

-- Super Admin: Full access
CREATE POLICY "super_admin_all_profiles" ON profiles
  FOR ALL
  USING (get_user_role() = 'super_admin')
  WITH CHECK (get_user_role() = 'super_admin');

-- Users: Read their own profile
CREATE POLICY "users_read_own_profile" ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Users: Update their own profile
CREATE POLICY "users_update_own_profile" ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Clinic Admin: Read profiles in their clinic
CREATE POLICY "clinic_admin_read_clinic_profiles" ON profiles
  FOR SELECT
  USING (
    get_user_role() = 'clinic_admin' AND
    clinic_id = get_user_clinic_id()
  );

-- =====================================================
-- DOCTORS POLICIES
-- =====================================================

-- Super Admin: Full access
CREATE POLICY "super_admin_all_doctors" ON doctors
  FOR ALL
  USING (get_user_role() = 'super_admin')
  WITH CHECK (get_user_role() = 'super_admin');

-- Clinic Admin: Full access to their clinic's doctors
CREATE POLICY "clinic_admin_all_doctors" ON doctors
  FOR ALL
  USING (
    get_user_role() = 'clinic_admin' AND
    clinic_id = get_user_clinic_id()
  )
  WITH CHECK (
    get_user_role() = 'clinic_admin' AND
    clinic_id = get_user_clinic_id()
  );

-- Staff/Patients: Read doctors in any clinic
CREATE POLICY "users_read_doctors" ON doctors
  FOR SELECT
  USING (
    get_user_role() IN ('staff', 'patient')
  );

-- =====================================================
-- SERVICES POLICIES
-- =====================================================

-- Super Admin: Full access
CREATE POLICY "super_admin_all_services" ON services
  FOR ALL
  USING (get_user_role() = 'super_admin')
  WITH CHECK (get_user_role() = 'super_admin');

-- Clinic Admin: Full access to their clinic's services
CREATE POLICY "clinic_admin_all_services" ON services
  FOR ALL
  USING (
    get_user_role() = 'clinic_admin' AND
    clinic_id = get_user_clinic_id()
  )
  WITH CHECK (
    get_user_role() = 'clinic_admin' AND
    clinic_id = get_user_clinic_id()
  );

-- Staff/Patients: Read services
CREATE POLICY "users_read_services" ON services
  FOR SELECT
  USING (
    get_user_role() IN ('staff', 'patient')
  );

-- =====================================================
-- APPOINTMENTS POLICIES
-- =====================================================

-- Super Admin: Full access
CREATE POLICY "super_admin_all_appointments" ON appointments
  FOR ALL
  USING (get_user_role() = 'super_admin')
  WITH CHECK (get_user_role() = 'super_admin');

-- Clinic Admin: Full access to their clinic's appointments
CREATE POLICY "clinic_admin_all_appointments" ON appointments
  FOR ALL
  USING (
    get_user_role() = 'clinic_admin' AND
    clinic_id = get_user_clinic_id()
  )
  WITH CHECK (
    get_user_role() = 'clinic_admin' AND
    clinic_id = get_user_clinic_id()
  );

-- Staff: Read and update appointments in their clinic
CREATE POLICY "staff_read_appointments" ON appointments
  FOR SELECT
  USING (
    get_user_role() = 'staff' AND
    clinic_id = get_user_clinic_id()
  );

CREATE POLICY "staff_update_appointments" ON appointments
  FOR UPDATE
  USING (
    get_user_role() = 'staff' AND
    clinic_id = get_user_clinic_id()
  )
  WITH CHECK (
    get_user_role() = 'staff' AND
    clinic_id = get_user_clinic_id()
  );

-- Patients: Read their own appointments
CREATE POLICY "patients_read_own_appointments" ON appointments
  FOR SELECT
  USING (
    get_user_role() = 'patient' AND
    patient_id = auth.uid()
  );

-- Patients: Create appointments for themselves
CREATE POLICY "patients_create_appointments" ON appointments
  FOR INSERT
  WITH CHECK (
    get_user_role() = 'patient' AND
    patient_id = auth.uid()
  );

-- Patients: Cancel their own pending appointments
CREATE POLICY "patients_cancel_own_appointments" ON appointments
  FOR UPDATE
  USING (
    get_user_role() = 'patient' AND
    patient_id = auth.uid() AND
    status = 'pending'
  )
  WITH CHECK (
    get_user_role() = 'patient' AND
    patient_id = auth.uid() AND
    status IN ('pending', 'cancelled')
  );

-- =====================================================
-- SUBSCRIPTIONS POLICIES
-- =====================================================

-- Super Admin: Full access
CREATE POLICY "super_admin_all_subscriptions" ON subscriptions
  FOR ALL
  USING (get_user_role() = 'super_admin')
  WITH CHECK (get_user_role() = 'super_admin');

-- Clinic Admin: Read their clinic's subscription
CREATE POLICY "clinic_admin_read_subscription" ON subscriptions
  FOR SELECT
  USING (
    get_user_role() = 'clinic_admin' AND
    clinic_id = get_user_clinic_id()
  );

-- =====================================================
-- PAYMENTS POLICIES
-- =====================================================

-- Super Admin: Full access
CREATE POLICY "super_admin_all_payments" ON payments
  FOR ALL
  USING (get_user_role() = 'super_admin')
  WITH CHECK (get_user_role() = 'super_admin');

-- Clinic Admin: Read their clinic's payments
CREATE POLICY "clinic_admin_read_payments" ON payments
  FOR SELECT
  USING (
    get_user_role() = 'clinic_admin' AND
    clinic_id = get_user_clinic_id()
  );
