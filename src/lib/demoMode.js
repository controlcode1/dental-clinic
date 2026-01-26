// Demo Mode - للتجربة بدون Supabase
export const DEMO_MODE = true // غيرها إلى false عندما تريد استخدام Supabase الحقيقي

export const demoUsers = {
    super_admin: {
        id: 'demo-super-admin-id',
        email: 'admin@demo.com',
        password: 'admin123',
        profile: {
            id: 'demo-super-admin-id',
            clinic_id: null,
            role: 'super_admin',
            full_name: 'المدير العام',
            phone: '07901234567',
            created_at: new Date().toISOString(),
        }
    },
    clinic_admin: {
        id: 'demo-clinic-admin-id',
        email: 'clinic@demo.com',
        password: 'clinic123',
        profile: {
            id: 'demo-clinic-admin-id',
            clinic_id: 'demo-clinic-1',
            role: 'clinic_admin',
            full_name: 'د. أحمد محمد',
            phone: '07901234568',
            created_at: new Date().toISOString(),
        }
    },
    staff: {
        id: 'demo-staff-id',
        email: 'staff@demo.com',
        password: 'staff123',
        profile: {
            id: 'demo-staff-id',
            clinic_id: 'demo-clinic-1',
            role: 'staff',
            full_name: 'موظف الاستقبال',
            phone: '07901234569',
            created_at: new Date().toISOString(),
        }
    },
    patient: {
        id: 'demo-patient-id',
        email: 'patient@demo.com',
        password: 'patient123',
        profile: {
            id: 'demo-patient-id',
            clinic_id: 'demo-clinic-1',
            role: 'patient',
            full_name: 'علي حسن',
            phone: '07901234570',
            created_at: new Date().toISOString(),
        }
    }
}

// البيانات التجريبية
export const demoData = {
    clinics: [
        {
            id: 'demo-clinic-1',
            name: 'عيادة الابتسامة الذكية',
            email: 'smile@clinic.com',
            phone: '07801234567',
            address: 'شارع الكرادة، بغداد',
            city: 'بغداد',
            subscription_status: 'active',
            subscription_plan: 'monthly',
            created_at: new Date().toISOString(),
        },
        {
            id: 'demo-clinic-2',
            name: 'مركز النور لطب الأسنان',
            email: 'noor@clinic.com',
            phone: '07701234567',
            address: 'حي الجامعة، الموصل',
            city: 'الموصل',
            subscription_status: 'active',
            subscription_plan: 'yearly',
            created_at: new Date().toISOString(),
        }
    ],
    doctors: [
        {
            id: 'demo-doctor-1',
            clinic_id: 'demo-clinic-1',
            full_name: 'د. سارة علي',
            specialization: 'تقويم الأسنان',
            phone: '07901111111',
            email: 'sara@clinic.com',
            is_active: true,
        },
        {
            id: 'demo-doctor-2',
            clinic_id: 'demo-clinic-1',
            full_name: 'د. محمد حسين',
            specialization: 'جراحة الفم والوجه',
            phone: '07902222222',
            email: 'mohamed@clinic.com',
            is_active: true,
        }
    ],
    services: [
        {
            id: 'demo-service-1',
            clinic_id: 'demo-clinic-1',
            name: 'تنظيف الأسنان',
            description: 'تنظيف شامل وإزالة الجير',
            price: 50000,
            duration_minutes: 30,
            is_active: true,
        },
        {
            id: 'demo-service-2',
            clinic_id: 'demo-clinic-1',
            name: 'حشوة تجميلية',
            description: 'حشوة ضوئية',
            price: 75000,
            duration_minutes: 45,
            is_active: true,
        },
        {
            id: 'demo-service-3',
            clinic_id: 'demo-clinic-1',
            name: 'تقويم الأسنان',
            description: 'جلسة تقويم',
            price: 100000,
            duration_minutes: 60,
            is_active: true,
        }
    ],
    appointments: [
        {
            id: 'demo-appt-1',
            clinic_id: 'demo-clinic-1',
            patient_id: 'demo-patient-id',
            doctor_id: 'demo-doctor-1',
            service_id: 'demo-service-1',
            appointment_date: new Date().toISOString().split('T')[0],
            start_time: '09:00:00',
            end_time: '09:30:00',
            status: 'pending',
            notes: 'أول زيارة',
            created_at: new Date().toISOString(),
        },
        {
            id: 'demo-appt-2',
            clinic_id: 'demo-clinic-1',
            patient_id: 'demo-patient-id',
            doctor_id: 'demo-doctor-2',
            service_id: 'demo-service-2',
            appointment_date: new Date().toISOString().split('T')[0],
            start_time: '10:00:00',
            end_time: '10:45:00',
            status: 'confirmed',
            notes: null,
            created_at: new Date().toISOString(),
        }
    ]
}

// دالة مساعدة للحصول على بيانات وهمية
export const getDemoData = (table, filter = {}) => {
    const data = demoData[table] || []

    if (Object.keys(filter).length === 0) {
        return data
    }

    return data.filter(item => {
        return Object.keys(filter).every(key => item[key] === filter[key])
    })
}
