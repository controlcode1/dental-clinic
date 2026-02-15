import { useState, useEffect } from 'react'
import { Layout } from '../../components/Layout'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { useNavigate } from 'react-router-dom'

export const BookAppointment = () => {
    const { profile, user } = useAuth()
    const navigate = useNavigate()
    const [step, setStep] = useState(1)
    const [clinics, setClinics] = useState([])
    const [doctors, setDoctors] = useState([])
    const [services, setServices] = useState([])
    const [formData, setFormData] = useState({
        clinic_id: '',
        doctor_id: '',
        service_id: '',
        appointment_date: '',
        start_time: '',
        notes: '',
    })
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        fetchClinics()
    }, [])

    useEffect(() => {
        if (formData.clinic_id) {
            fetchServices()
            fetchDoctors()
        }
    }, [formData.clinic_id])

    const fetchClinics = async () => {
        try {
            const { data, error } = await supabase
                .from('clinics')
                .select('id, name')
                .eq('subscription_status', 'active')
                .order('name')

            if (error) throw error
            setClinics(data || [])

            // If user has a clinic_id (shouldn't for patients, but safe)
            if (profile?.clinic_id && data) {
                const clinicExists = data.find(c => c.id === profile.clinic_id)
                if (clinicExists) {
                    setFormData(prev => ({ ...prev, clinic_id: profile.clinic_id }))
                }
            }
        } catch (error) {
            console.error('Error fetching clinics:', error)
        }
    }

    const fetchDoctors = async () => {
        try {
            const { data, error } = await supabase
                .from('doctors')
                .select('id, full_name, specialization')
                .eq('clinic_id', formData.clinic_id)
                .eq('is_active', true)

            if (error) throw error
            setDoctors(data || [])
        } catch (error) {
            console.error('Error fetching doctors:', error)
        }
    }

    const fetchServices = async () => {
        try {
            const { data, error } = await supabase
                .from('services')
                .select('id, name, price, duration_minutes')
                .eq('clinic_id', formData.clinic_id)
                .eq('is_active', true)

            if (error) throw error
            setServices(data || [])
        } catch (error) {
            console.error('Error fetching services:', error)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            // Calculate end_time based on service duration
            const selectedService = services.find(s => s.id === formData.service_id)
            const duration = selectedService ? selectedService.duration_minutes : 30
            
            const startStr = `${formData.appointment_date}T${formData.start_time}`
            const startDate = new Date(startStr)
            const endDate = new Date(startDate.getTime() + duration * 60000)
            const endTime = endDate.toTimeString().split(' ')[0].slice(0, 5)

            const { error } = await supabase
                .from('appointments')
                .insert([{
                    ...formData,
                    end_time: endTime,
                    patient_id: user.id,
                }])

            if (error) throw error

            alert('تم حجز الموعد بنجاح!')
            navigate('/patient/appointments')
        } catch (error) {
            console.error('Error booking appointment:', error)
            if (error.message.includes('تعارض')) {
                alert('عذراً، هذا الموعد محجوز بالفعل. الرجاء اختيار وقت آخر.')
            } else {
                alert('حدث خطأ أثناء الحجز')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <Layout>
            <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">حجز موعد جديد</h1>
                    <p className="text-gray-400">اتبع الخطوات لحجز موعدك</p>
                </div>

                {/* Progress Steps */}
                <div className="flex justify-between items-center mb-8">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className="flex items-center flex-1">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= s ? 'gradient-primary text-white' : 'bg-dark-card text-gray-400'
                                }`}>
                                {s}
                            </div>
                            {s < 3 && <div className={`flex-1 h-1 mx-2 ${step > s ? 'bg-primary-500' : 'bg-dark-border'
                                }`} />}
                        </div>
                    ))}
                </div>

                <Card>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Step 1: Select Clinic & Service */}
                        {step === 1 && (
                            <div className="space-y-4">
                                <h2 className="text-xl font-bold text-white mb-4">اختر العيادة والخدمة</h2>

                                <Select
                                    label="العيادة"
                                    value={formData.clinic_id}
                                    onChange={(e) => setFormData({ ...formData, clinic_id: e.target.value })}
                                    required
                                    options={[
                                        { value: '', label: '-- اختر العيادة --' },
                                        ...clinics.map(c => ({ value: c.id, label: c.name }))
                                    ]}
                                />

                                {formData.clinic_id && services.length > 0 && (
                                    <Select
                                        label="الخدمة المطلوبة"
                                        value={formData.service_id}
                                        onChange={(e) => setFormData({ ...formData, service_id: e.target.value })}
                                        required
                                        options={[
                                            { value: '', label: '-- اختر الخدمة --' },
                                            ...services.map(s => ({
                                                value: s.id,
                                                label: `${s.name} - ${s.price} IQD (${s.duration_minutes} دقيقة)`
                                            }))
                                        ]}
                                    />
                                )}

                                <Button
                                    type="button"
                                    onClick={() => setStep(2)}
                                    disabled={!formData.clinic_id || !formData.service_id}
                                    className="w-full"
                                >
                                    التالي
                                </Button>
                            </div>
                        )}

                        {/* Step 2: Select Doctor */}
                        {step === 2 && (
                            <div className="space-y-4">
                                <h2 className="text-xl font-bold text-white mb-4">اختر الطبيب</h2>

                                <Select
                                    label="الطبيب"
                                    value={formData.doctor_id}
                                    onChange={(e) => setFormData({ ...formData, doctor_id: e.target.value })}
                                    required
                                    options={[
                                        { value: '', label: '-- اختر الطبيب --' },
                                        ...doctors.map(d => ({
                                            value: d.id,
                                            label: d.specialization ? `${d.full_name} - ${d.specialization}` : d.full_name
                                        }))
                                    ]}
                                />

                                <div className="flex gap-4">
                                    <Button type="button" variant="secondary" onClick={() => setStep(1)} className="flex-1">
                                        السابق
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={() => setStep(3)}
                                        disabled={!formData.doctor_id}
                                        className="flex-1"
                                    >
                                        التالي
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Select Date & Time */}
                        {step === 3 && (
                            <div className="space-y-4">
                                <h2 className="text-xl font-bold text-white mb-4">اختر التاريخ والوقت</h2>

                                <Input
                                    label="التاريخ"
                                    type="date"
                                    value={formData.appointment_date}
                                    onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                                    min={new Date().toISOString().split('T')[0]}
                                    required
                                />

                                <Input
                                    label="الوقت"
                                    type="time"
                                    value={formData.start_time}
                                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                                    required
                                />

                                <div>
                                    <label className="block text-sm font-semibold text-gray-300 mb-2">ملاحظات إضافية</label>
                                    <textarea
                                        className="input-field min-h-[100px]"
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        placeholder="أي معلومات إضافية تود إضافتها..."
                                    />
                                </div>

                                <div className="flex gap-4">
                                    <Button type="button" variant="secondary" onClick={() => setStep(2)} className="flex-1">
                                        السابق
                                    </Button>
                                    <Button type="submit" loading={loading} className="flex-1">
                                        تأكيد الحجز
                                    </Button>
                                </div>
                            </div>
                        )}
                    </form>
                </Card>
            </div>
        </Layout>
    )
}
