import { useState, useEffect } from 'react'
import { Layout } from '../../components/Layout'
import { Card } from '../../components/ui/Card'
import { supabase } from '../../lib/supabase'

export const Subscriptions = () => {
    const [subscriptions, setSubscriptions] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchSubscriptions()
    }, [])

    const fetchSubscriptions = async () => {
        try {
            const { data, error } = await supabase
                .from('subscriptions')
                .select(`
          *,
          clinics (name, email)
        `)
                .order('created_at', { ascending: false })

            if (error) throw error
            setSubscriptions(data || [])
        } catch (error) {
            console.error('Error fetching subscriptions:', error)
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
            <div className="space-y-6 animate-fade-in">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">إدارة الاشتراكات</h1>
                    <p className="text-gray-400">عرض وإدارة اشتراكات العيادات</p>
                </div>

                {/* Subscriptions List */}
                <Card>
                    <div className="overflow-x-auto">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>العيادة</th>
                                    <th>البريد الإلكتروني</th>
                                    <th>الخطة</th>
                                    <th>الحالة</th>
                                    <th>بداية الفترة</th>
                                    <th>نهاية الفترة</th>
                                    <th>إلغاء عند الانتهاء</th>
                                </tr>
                            </thead>
                            <tbody>
                                {subscriptions.map((sub) => (
                                    <tr key={sub.id}>
                                        <td className="font-semibold text-white">{sub.clinics?.name}</td>
                                        <td className="text-gray-400">{sub.clinics?.email}</td>
                                        <td className="text-gray-400">
                                            {sub.plan === 'monthly' ? 'شهري' : 'سنوي'}
                                        </td>
                                        <td>
                                            <span className={`badge ${sub.status === 'active' ? 'badge-success' :
                                                    sub.status === 'cancelled' ? 'badge-danger' :
                                                        'badge-warning'
                                                }`}>
                                                {sub.status === 'active' ? 'نشط' :
                                                    sub.status === 'cancelled' ? 'ملغى' : 'معلق'}
                                            </span>
                                        </td>
                                        <td className="text-gray-400">
                                            {new Date(sub.current_period_start).toLocaleDateString('ar-IQ')}
                                        </td>
                                        <td className="text-gray-400">
                                            {new Date(sub.current_period_end).toLocaleDateString('ar-IQ')}
                                        </td>
                                        <td>
                                            <span className={sub.cancel_at_period_end ? 'text-red-400' : 'text-green-400'}>
                                                {sub.cancel_at_period_end ? 'نعم' : 'لا'}
                                            </span>
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
