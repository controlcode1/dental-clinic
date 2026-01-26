import { useState, useEffect } from 'react'
import { Layout } from '../../components/Layout'
import { Card } from '../../components/ui/Card'
import { supabase } from '../../lib/supabase'

export const SuperAdminDashboard = () => {
    const [stats, setStats] = useState({
        totalClinics: 0,
        activeClinics: 0,
        totalRevenue: 0,
        activeSubscriptions: 0,
    })
    const [recentClinics, setRecentClinics] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchDashboardData()
    }, [])

    const fetchDashboardData = async () => {
        try {
            // Fetch clinics stats
            const { data: clinics, error: clinicsError } = await supabase
                .from('clinics')
                .select('*')

            if (clinicsError) throw clinicsError

            // Fetch subscriptions
            const { data: subscriptions, error: subsError } = await supabase
                .from('subscriptions')
                .select('*')
                .eq('status', 'active')

            if (subsError) throw subsError

            // Fetch recent payments
            const { data: payments, error: paymentsError } = await supabase
                .from('payments')
                .select('amount')
                .eq('status', 'paid')

            if (paymentsError) throw paymentsError

            const totalRevenue = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0)
            const activeClinics = clinics.filter(c => c.subscription_status === 'active')

            setStats({
                totalClinics: clinics.length,
                activeClinics: activeClinics.length,
                totalRevenue,
                activeSubscriptions: subscriptions.length,
            })

            setRecentClinics(clinics.slice(0, 5))
        } catch (error) {
            console.error('Error fetching dashboard data:', error)
        } finally {
            setLoading(false)
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
            <div className="space-y-8 animate-fade-in">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">لوحة تحكم المدير العام</h1>
                    <p className="text-gray-400">مرحباً بك في لوحة التحكم الرئيسية</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="gradient-primary">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-sm mb-1">إجمالي العيادات</p>
                                <p className="text-4xl font-bold text-white">{stats.totalClinics}</p>
                            </div>
                            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-green-600">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100 text-sm mb-1">العيادات النشطة</p>
                                <p className="text-4xl font-bold text-white">{stats.activeClinics}</p>
                            </div>
                            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </Card>

                    <Card className="gradient-accent">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-purple-100 text-sm mb-1">الاشتراكات النشطة</p>
                                <p className="text-4xl font-bold text-white">{stats.activeSubscriptions}</p>
                            </div>
                            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-yellow-600">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-yellow-100 text-sm mb-1">إجمالي الإيرادات</p>
                                <p className="text-4xl font-bold text-white">${stats.totalRevenue.toFixed(2)}</p>
                            </div>
                            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Recent Clinics */}
                <Card>
                    <h2 className="text-xl font-bold text-white mb-6">العيادات المسجلة حديثاً</h2>
                    <div className="overflow-x-auto">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>اسم العيادة</th>
                                    <th>البريد الإلكتروني</th>
                                    <th>الهاتف</th>
                                    <th>حالة الاشتراك</th>
                                    <th>تاريخ التسجيل</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentClinics.map((clinic) => (
                                    <tr key={clinic.id}>
                                        <td className="font-semibold text-white">{clinic.name}</td>
                                        <td className="text-gray-400">{clinic.email}</td>
                                        <td className="text-gray-400">{clinic.phone || '-'}</td>
                                        <td>
                                            <span className={`badge ${clinic.subscription_status === 'active' ? 'badge-success' :
                                                    clinic.subscription_status === 'inactive' ? 'badge-danger' :
                                                        'badge-warning'
                                                }`}>
                                                {clinic.subscription_status === 'active' ? 'نشط' :
                                                    clinic.subscription_status === 'inactive' ? 'غير نشط' : 'معلق'}
                                            </span>
                                        </td>
                                        <td className="text-gray-400">
                                            {new Date(clinic.created_at).toLocaleDateString('ar-IQ')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </Layout>
    )
}
