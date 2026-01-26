import { useState, useEffect } from 'react'
import { Layout } from '../../components/Layout'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { stripePromise } from '../../lib/stripe'

export const Settings = () => {
    const { profile } = useAuth()
    const [clinic, setClinic] = useState(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        city: '',
    })

    useEffect(() => {
        if (profile?.clinic_id) {
            fetchClinicData()
        }
    }, [profile])

    const fetchClinicData = async () => {
        try {
            const { data, error } = await supabase
                .from('clinics')
                .select('*')
                .eq('id', profile.clinic_id)
                .single()

            if (error) throw error
            setClinic(data)
            setFormData({
                name: data.name,
                phone: data.phone || '',
                address: data.address || '',
                city: data.city || '',
            })
        } catch (error) {
            console.error('Error fetching clinic data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async (e) => {
        e.preventDefault()
        setSaving(true)

        try {
            const { error } = await supabase
                .from('clinics')
                .update(formData)
                .eq('id', profile.clinic_id)

            if (error) throw error
            alert('تم حفظ التغييرات بنجاح')
            fetchClinicData()
        } catch (error) {
            console.error('Error saving settings:', error)
            alert('حدث خطأ أثناء الحفظ')
        } finally {
            setSaving(false)
        }
    }

    const handleSubscribe = async (plan) => {
        try {
            // This would call your backend to create a Stripe Checkout session
            // For now, showing the concept
            alert(`سيتم توجيهك إلى صفحة الدفع للاشتراك في الخطة: ${plan}`)

            // TODO: Implement Stripe Checkout
            // const response = await fetch('/api/create-checkout-session', {
            //   method: 'POST',
            //   headers: { 'Content-Type': 'application/json' },
            //   body: JSON.stringify({ clinicId: profile.clinic_id, plan })
            // })
            // const session = await response.json()
            // const stripe = await stripePromise
            // const { error } = await stripe.redirectToCheckout({ sessionId: session.id })
            // if (error) console.error(error)
        } catch (error) {
            console.error('Error:', error)
        }
    }

    if (loading) {
        return (
            <Layout>
                <div className="text-center py-20">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500 mx-auto"></div>
                </div>
            </Layout>
        )
    }

    return (
        <Layout>
            <div className="space-y-6 animate-fade-in">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">إعدادات العيادة</h1>
                    <p className="text-gray-400">إدارة بيانات العيادة والاشتراك</p>
                </div>

                {/* Clinic Information */}
                <Card>
                    <h2 className="text-xl font-bold text-white mb-6">بيانات العيادة</h2>
                    <form onSubmit={handleSave} className="space-y-4">
                        <Input
                            label="اسم العيادة"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                        <Input
                            label="رقم الهاتف"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                        <Input
                            label="المدينة"
                            value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        />
                        <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-2">العنوان</label>
                            <textarea
                                className="input-field min-h-[100px]"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            />
                        </div>
                        <Button type="submit" loading={saving}>
                            حفظ التغييرات
                        </Button>
                    </form>
                </Card>

                {/* Subscription Info */}
                <Card>
                    <h2 className="text-xl font-bold text-white mb-6">حالة الاشتراك</h2>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">حالة الاشتراك:</span>
                            <span className={`badge ${clinic?.subscription_status === 'active' ? 'badge-success' :
                                    clinic?.subscription_status === 'inactive' ? 'badge-danger' : 'badge-warning'
                                }`}>
                                {clinic?.subscription_status === 'active' ? 'نشط' :
                                    clinic?.subscription_status === 'inactive' ? 'غير نشط' : 'معلق'}
                            </span>
                        </div>

                        {clinic?.subscription_plan && (
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">الخطة الحالية:</span>
                                <span className="text-white font-semibold">
                                    {clinic.subscription_plan === 'monthly' ? 'شهري' : 'سنوي'}
                                </span>
                            </div>
                        )}

                        {clinic?.subscription_expires_at && (
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">تاريخ انتهاء الاشتراك:</span>
                                <span className="text-white">
                                    {new Date(clinic.subscription_expires_at).toLocaleDateString('ar-IQ')}
                                </span>
                            </div>
                        )}
                    </div>

                    {clinic?.subscription_status !== 'active' && (
                        <div className="mt-6">
                            <h3 className="text-lg font-bold text-white mb-4">اختر خطة الاشتراك</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="glass border-2 border-primary-500 rounded-xl p-6">
                                    <h4 className="text-xl font-bold text-white mb-2">الخطة الشهرية</h4>
                                    <p className="text-4xl font-bold text-gradient mb-4">$29<span className="text-lg">/شهر</span></p>
                                    <ul className="space-y-2 mb-6">
                                        <li className="text-gray-300">✓ جميع الميزات</li>
                                        <li className="text-gray-300">✓ دعم فني</li>
                                        <li className="text-gray-300">✓ تحديثات مجانية</li>
                                    </ul>
                                    <Button onClick={() => handleSubscribe('monthly')} className="w-full">
                                        اشترك الآن
                                    </Button>
                                </div>

                                <div className="glass border-2 border-accent-teal rounded-xl p-6">
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="text-xl font-bold text-white">الخطة السنوية</h4>
                                        <span className="badge badge-success">وفّر 20%</span>
                                    </div>
                                    <p className="text-4xl font-bold text-gradient mb-4">$279<span className="text-lg">/سنة</span></p>
                                    <ul className="space-y-2 mb-6">
                                        <li className="text-gray-300">✓ جميع الميزات</li>
                                        <li className="text-gray-300">✓ دعم فني مميز</li>
                                        <li className="text-gray-300">✓ تحديثات مجانية</li>
                                        <li className="text-gray-300">✓ توفير شهرين مجاناً</li>
                                    </ul>
                                    <Button onClick={() => handleSubscribe('yearly')} className="w-full">
                                        اشترك الآن
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </Layout>
    )
}
