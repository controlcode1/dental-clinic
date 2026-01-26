import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Button } from '../components/ui/Button'

export const Register = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        full_name: '',
        phone: '',
        clinic_id: '',
    })
    const [clinics, setClinics] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const { signUp } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        fetchClinics()
    }, [])

    const fetchClinics = async () => {
        try {
            const { data, error } = await supabase
                .from('clinics')
                .select('id, name')
                .eq('subscription_status', 'active')
                .order('name')

            if (error) throw error
            setClinics(data || [])
        } catch (err) {
            console.error('Error fetching clinics:', err)
        }
    }

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (formData.password !== formData.confirmPassword) {
            setError('كلمة المرور وتأكيد كلمة المرور غير متطابقتين')
            return
        }

        if (formData.password.length < 6) {
            setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
            return
        }

        if (!formData.clinic_id) {
            setError('الرجاء اختيار العيادة')
            return
        }

        setLoading(true)

        try {
            await signUp(formData.email, formData.password, {
                full_name: formData.full_name,
                phone: formData.phone,
                clinic_id: formData.clinic_id,
                role: 'patient',
            })

            navigate('/patient/appointments')
        } catch (err) {
            setError(err.message || 'حدث خطأ أثناء التسجيل')
            console.error('Registration error:', err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-gradient mb-2">إنشاء حساب جديد</h1>
                    <p className="text-gray-400">سجّل كمريض لحجز المواعيد</p>
                </div>

                {/* Registration Form */}
                <div className="glass rounded-2xl p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <Input
                            label="الاسم الكامل"
                            name="full_name"
                            value={formData.full_name}
                            onChange={handleChange}
                            required
                            placeholder="أدخل اسمك الكامل"
                        />

                        <Input
                            label="رقم الهاتف"
                            name="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                            placeholder="07XX XXX XXXX"
                        />

                        <Input
                            label="البريد الإلكتروني"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="example@email.com"
                        />

                        <Select
                            label="اختر العيادة"
                            name="clinic_id"
                            value={formData.clinic_id}
                            onChange={handleChange}
                            required
                            options={[
                                { value: '', label: '-- اختر العيادة --' },
                                ...clinics.map(clinic => ({
                                    value: clinic.id,
                                    label: clinic.name
                                }))
                            ]}
                        />

                        <Input
                            label="كلمة المرور"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            placeholder="••••••••"
                        />

                        <Input
                            label="تأكيد كلمة المرور"
                            name="confirmPassword"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            placeholder="••••••••"
                        />

                        <Button
                            type="submit"
                            variant="primary"
                            loading={loading}
                            className="w-full"
                        >
                            إنشاء حساب
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-gray-400 text-sm">
                            لديك حساب بالفعل؟{' '}
                            <Link to="/login" className="text-accent-teal hover:underline font-semibold">
                                تسجيل الدخول
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-gray-500 text-sm mt-8">
                    © 2026 نظام إدارة عيادات الأسنان. جميع الحقوق محفوظة.
                </p>
            </div>
        </div>
    )
}
