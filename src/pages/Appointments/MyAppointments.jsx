import { useState, useEffect } from 'react'
import { Layout } from '../../components/Layout'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'

export const MyAppointments = () => {
    const { user } = useAuth()
    const [appointments, setAppointments] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (user) {
            fetchAppointments()
        }
    }, [user])

    const fetchAppointments = async () => {
        try {
            const { data, error } = await supabase
                .from('appointments')
                .select(`
          *,
          clinics (name),
          doctors (full_name),
          services (name, price)
        `)
                .eq('patient_id', user.id)
                .order('appointment_date', { ascending: false })

            if (error) throw error
            setAppointments(data || [])
        } catch (error) {
            console.error('Error fetching appointments:', error)
        } finally {
            setLoading(false)
        }
    }

    const cancelAppointment = async (appointmentId) => {
        if (!confirm('هل أنت متأكد من إلغاء هذا الموعد؟')) return

        try {
            const { error } = await supabase
                .from('appointments')
                .update({ status: 'cancelled' })
                .eq('id', appointmentId)

            if (error) throw error
            fetchAppointments()
            alert('تم إلغاء الموعد بنجاح')
        } catch (error) {
            console.error('Error cancelling appointment:', error)
            alert('حدث خطأ أثناء الإلغاء')
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
                    <h1 className="text-3xl font-bold text-white mb-2">مواعيدي</h1>
                    <p className="text-gray-400">عرض وإدارة مواعيدك الطبية</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {appointments.length > 0 ? (
                        appointments.map((appt) => (
                            <Card key={appt.id} hover>
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-white">{appt.clinics?.name}</h3>
                                        <p className="text-sm text-gray-400">{appt.doctors?.full_name}</p>
                                    </div>
                                    <span className={`badge ${appt.status === 'confirmed' ? 'badge-success' :
                                            appt.status === 'pending' ? 'badge-warning' :
                                                appt.status === 'cancelled' ? 'badge-danger' : 'badge-info'
                                        }`}>
                                        {appt.status === 'confirmed' ? 'مؤكد' :
                                            appt.status === 'pending' ? 'قيد الانتظار' :
                                                appt.status === 'cancelled' ? 'ملغى' : 'مكتمل'}
                                    </span>
                                </div>

                                <div className="space-y-2 mb-4">
                                    <p className="text-white">
                                        <span className="text-gray-400">الخدمة:</span> {appt.services?.name}
                                    </p>
                                    <p className="text-white">
                                        <span className="text-gray-400">التاريخ:</span> {new Date(appt.appointment_date).toLocaleDateString('ar-IQ')}
                                    </p>
                                    <p className="text-white">
                                        <span className="text-gray-400">الوقت:</span> {appt.start_time.slice(0, 5)}
                                    </p>
                                    <p className="text-white">
                                        <span className="text-gray-400">السعر:</span> {appt.services?.price} IQD
                                    </p>
                                    {appt.notes && (
                                        <p className="text-gray-400 text-sm mt-2">
                                            <span className="text-gray-500">ملاحظات:</span> {appt.notes}
                                        </p>
                                    )}
                                </div>

                                {appt.status === 'pending' && (
                                    <Button
                                        variant="danger"
                                        onClick={() => cancelAppointment(appt.id)}
                                        className="w-full text-sm"
                                    >
                                        إلغاء الموعد
                                    </Button>
                                )}
                            </Card>
                        ))
                    ) : (
                        <div className="col-span-2">
                            <Card>
                                <div className="text-center py-12">
                                    <svg className="w-16 h-16 text-gray-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <p className="text-gray-400 mb-4">ليس لديك أي مواعيد بعد</p>
                                    <Button onClick={() => window.location.href = '/patient/book'}>
                                        احجز موعدك الأول
                                    </Button>
                                </div>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    )
}
