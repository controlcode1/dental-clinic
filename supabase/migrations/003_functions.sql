-- =====================================================
-- DATABASE FUNCTIONS
-- =====================================================

-- Function: Check for appointment conflicts
CREATE OR REPLACE FUNCTION check_appointment_conflict()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if there's an overlapping appointment for the same doctor on the same date
  IF EXISTS (
    SELECT 1 FROM appointments
    WHERE id != COALESCE(NEW.id, uuid_generate_v4())
      AND doctor_id = NEW.doctor_id
      AND appointment_date = NEW.appointment_date
      AND status NOT IN ('cancelled')
      AND (
        (NEW.start_time >= start_time AND NEW.start_time < end_time) OR
        (NEW.end_time > start_time AND NEW.end_time <= end_time) OR
        (NEW.start_time <= start_time AND NEW.end_time >= end_time)
      )
  ) THEN
    RAISE EXCEPTION 'تعارض في المواعيد: الطبيب لديه موعد آخر في نفس الوقت';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Prevent appointment conflicts
CREATE TRIGGER prevent_appointment_conflict
  BEFORE INSERT OR UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION check_appointment_conflict();

-- Function: Auto-calculate appointment end time based on service duration
CREATE OR REPLACE FUNCTION calculate_appointment_end_time()
RETURNS TRIGGER AS $$
DECLARE
  service_duration INTEGER;
BEGIN
  -- Get service duration
  SELECT duration_minutes INTO service_duration
  FROM services
  WHERE id = NEW.service_id;
  
  -- Calculate end time
  NEW.end_time = NEW.start_time + (service_duration || ' minutes')::INTERVAL;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-calculate end time
CREATE TRIGGER auto_calculate_end_time
  BEFORE INSERT OR UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION calculate_appointment_end_time();

-- Function: Update clinic subscription status
CREATE OR REPLACE FUNCTION update_clinic_subscription_status(
  p_clinic_id UUID,
  p_subscription_status subscription_status,
  p_expires_at TIMESTAMP WITH TIME ZONE
)
RETURNS VOID AS $$
BEGIN
  UPDATE clinics
  SET 
    subscription_status = p_subscription_status,
    subscription_expires_at = p_expires_at,
    updated_at = NOW()
  WHERE id = p_clinic_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get appointments summary for dashboard
CREATE OR REPLACE FUNCTION get_appointments_summary(p_clinic_id UUID, p_date DATE)
RETURNS TABLE (
  total_appointments BIGINT,
  pending_appointments BIGINT,
  confirmed_appointments BIGINT,
  completed_appointments BIGINT,
  cancelled_appointments BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT,
    COUNT(*) FILTER (WHERE status = 'pending')::BIGINT,
    COUNT(*) FILTER (WHERE status = 'confirmed')::BIGINT,
    COUNT(*) FILTER (WHERE status = 'completed')::BIGINT,
    COUNT(*) FILTER (WHERE status = 'cancelled')::BIGINT
  FROM appointments
  WHERE clinic_id = p_clinic_id
    AND appointment_date = p_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get available time slots for a doctor on a specific date
CREATE OR REPLACE FUNCTION get_available_slots(
  p_doctor_id UUID,
  p_date DATE,
  p_slot_duration INTEGER DEFAULT 30
)
RETURNS TABLE (
  slot_time TIME,
  is_available BOOLEAN
) AS $$
DECLARE
  start_hour INTEGER := 8;  -- 8 AM
  end_hour INTEGER := 20;   -- 8 PM
  current_time TIME;
  slot_end_time TIME;
BEGIN
  current_time := (start_hour || ':00:00')::TIME;
  
  WHILE current_time < (end_hour || ':00:00')::TIME LOOP
    slot_end_time := current_time + (p_slot_duration || ' minutes')::INTERVAL;
    
    RETURN QUERY
    SELECT
      current_time,
      NOT EXISTS (
        SELECT 1 FROM appointments
        WHERE doctor_id = p_doctor_id
          AND appointment_date = p_date
          AND status NOT IN ('cancelled')
          AND (
            (current_time >= start_time AND current_time < end_time) OR
            (slot_end_time > start_time AND slot_end_time <= end_time)
          )
      );
    
    current_time := slot_end_time;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
