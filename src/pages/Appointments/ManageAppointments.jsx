import { useState, useEffect } from 'react'
import { Layout } from '../../components/Layout'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Select } from '../../components/ui/Select'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'

export const ManageAppointments = () => {
    const { profile } = useAuth()
    const [appointments, setAppointments] = useState([])
    const [loading, setLoading] = useState(true)
    const [filterStatus, setFilterStatus] = useState('all')

    useEffect(() => {
        if (profile?.clinic_id) {
            fetchAppointments()
        }
    }, [profile, filterStatus])

    const fetchAppointments = async () => {
        try {
            let query = supabase
                .from('appointments')
                .select(`
          *,
          doctors (full_name),
          services (name, price),
          profiles!appointments_patient_id_fkey (full_name, phone)
        `)
                .eq('clinic_id', profile.clinic_id)
                .order('appointment_date', { ascending: true })
                .order('start_time', { ascending: true })

            if (filterStatus !== 'all') {
                query = query.eq('status', filterStatus)
            }

            const { data, error } = await query

            if (error) throw error
            setAppointments(data || [])
        } catch (error) {
            console.error('Error fetching appointments:', error)
        } finally {
            setLoading(false)
        }
    }

    const updateStatus = async (appointmentId, newStatus) => {
        const confirmMsg = 
            newStatus === 'confirmed' ? 'هل أنت متأكد من تأكيد هذا الموعد؟' :
            newStatus === 'completed' ? 'هل أنت متأكد من إكمال هذا الموعد؟' :
            'هل أنت متأكد من إلغاء هذا الموعد؟'

        if (!window.confirm(confirmMsg)) return

        try {
            const { error } = await supabase
                .from('appointments')
                .update({ status: newStatus })
                .eq('id', appointmentId)

            if (error) throw error
            fetchAppointments()
        } catch (error) {
            console.error('Error updating appointment:', error)
            alert('حدث خطأ أثناء التحديث')
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
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">إدارة المواعيد</h1>
                        <p className="text-gray-400">عرض وإدارة جميع المواعيد</p>
                    </div>

                    <Select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        options={[
                            { value: 'all', label: 'جميع المواعيد' },
                            { value: 'pending', label: 'قيد الانتظار' },
                            { value: 'confirmed', label: 'مؤكدة' },
                            { value: 'cancelled', label: 'ملغاة' },
                            { value: 'completed', label: 'مكتملة' },
                        ]}
                        className="w-48"
                    />
                </div>

                <Card>
                    <div className="overflow-x-auto">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>التاريخ والوقت</th>
                                    <th>المريض</th>
                                    <th>الطبيب</th>
                                    <th>الخدمة</th>
                                    <th>الحالة</th>
                                    <th>الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {appointments.length > 0 ? (
                                    appointments.map((appt) => (
                                        <tr key={appt.id}>
                                            <td className="font-semibold text-white">
                                                {new Date(appt.appointment_date).toLocaleDateString('ar-IQ')}
                                                <br />
                                                <span className="text-sm text-gray-400">{appt.start_time.slice(0, 5)}</span>
                                            </td>
                                            <td className="text-gray-400">
                                                {appt.profiles?.full_name}
                                                <br />
                                                <span className="text-xs">{appt.profiles?.phone}</span>
                                            </td>
                                            <td className="text-gray-400">{appt.doctors?.full_name}</td>
                                            <td className="text-gray-400">{appt.services?.name}</td>
                                            <td>
                                                <span className={`badge ${appt.status === 'confirmed' ? 'badge-success' :
                                                        appt.status === 'pending' ? 'badge-warning' :
                                                            appt.status === 'cancelled' ? 'badge-danger' : 'badge-info'
                                                    }`}>
                                                    {appt.status === 'confirmed' ? 'مؤكد' :
                                                        appt.status === 'pending' ? 'قيد الانتظار' :
                                                            appt.status === 'cancelled' ? 'ملغى' : 'مكتمل'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="flex gap-2">
                                                    {appt.status === 'pending' && (
                                                        <Button
                                                            variant="primary"
                                                            onClick={() => updateStatus(appt.id, 'confirmed')}
                                                            className="text-xs py-2"
                                                        >
                                                            تأكيد
                                                        </Button>
                                                    )}
                                                    {appt.status === 'confirmed' && (
                                                        <Button
                                                            variant="primary"
                                                            onClick={() => updateStatus(appt.id, 'completed')}
                                                            className="text-xs py-2"
                                                        >
                                                            إكمال
                                                        </Button>
                                                    )}
                                                    {appt.status !== 'cancelled' && appt.status !== 'completed' && (
                                                        <Button
                                                            variant="danger"
                                                            onClick={() => updateStatus(appt.id, 'cancelled')}
                                                            className="text-xs py-2"
                                                        >
                                                            إلغاء
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="text-center text-gray-400 py-8">
                                            لا توجد مواعيد
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </Layout>
    )
}
