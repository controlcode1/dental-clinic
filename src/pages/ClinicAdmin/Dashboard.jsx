import { useState, useEffect } from 'react'
import { Layout } from '../../components/Layout'
import { Card } from '../../components/ui/Card'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'

export const ClinicDashboard = () => {
    const { profile } = useAuth()
    const [stats, setStats] = useState({
        todayAppointments: 0,
        pendingAppointments: 0,
        confirmedAppointments: 0,
        totalDoctors: 0,
    })
    const [appointments, setAppointments] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (profile?.clinic_id) {
            fetchDashboardData()
        }
    }, [profile])

    const fetchDashboardData = async () => {
        try {
            const today = new Date().toISOString().split('T')[0]

            // Fetch today's appointments
            const { data: todayAppts, error: apptsError } = await supabase
                .from('appointments')
                .select(`
          *,
          doctors (full_name),
          services (name),
          profiles!appointments_patient_id_fkey (full_name, phone)
        `)
                .eq('clinic_id', profile.clinic_id)
                .eq('appointment_date', today)
                .order('start_time')

            if (apptsError) throw apptsError

            // Fetch doctors count
            const { count: doctorsCount } = await supabase
                .from('doctors')
                .select('*', { count: 'exact', head: true })
                .eq('clinic_id', profile.clinic_id)
                .eq('is_active', true)

            const pending = todayAppts.filter(a => a.status === 'pending').length
            const confirmed = todayAppts.filter(a => a.status === 'confirmed').length

            setStats({
                todayAppointments: todayAppts.length,
                pendingAppointments: pending,
                confirmedAppointments: confirmed,
                totalDoctors: doctorsCount || 0,
            })

            setAppointments(todayAppts || [])
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
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">لوحة تحكم العيادة</h1>
                    <p className="text-gray-400">مرحباً بك، {profile?.full_name}</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="gradient-primary">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-sm mb-1">مواعيد اليوم</p>
                                <p className="text-4xl font-bold text-white">{stats.todayAppointments}</p>
                            </div>
                            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-yellow-600">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-yellow-100 text-sm mb-1">قيد الانتظار</p>
                                <p className="text-4xl font-bold text-white">{stats.pendingAppointments}</p>
                            </div>
                            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-green-600">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100 text-sm mb-1">مؤكدة</p>
                                <p className="text-4xl font-bold text-white">{stats.confirmedAppointments}</p>
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
                                <p className="text-purple-100 text-sm mb-1">الأطباء</p>
                                <p className="text-4xl font-bold text-white">{stats.totalDoctors}</p>
                            </div>
                            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Today's Appointments */}
                <Card>
                    <h2 className="text-xl font-bold text-white mb-6">مواعيد اليوم</h2>
                    <div className="overflow-x-auto">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>الوقت</th>
                                    <th>المريض</th>
                                    <th>الطبيب</th>
                                    <th>الخدمة</th>
                                    <th>الحالة</th>
                                    <th>ملاحظات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {appointments.length > 0 ? (
                                    appointments.map((appt) => (
                                        <tr key={appt.id}>
                                            <td className="font-semibold text-white">{appt.start_time.slice(0, 5)}</td>
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
                                                            appt.status === 'cancelled' ? 'badge-danger' :
                                                                'badge-info'
                                                    }`}>
                                                    {appt.status === 'confirmed' ? 'مؤكد' :
                                                        appt.status === 'pending' ? 'قيد الانتظار' :
                                                            appt.status === 'cancelled' ? 'ملغى' : 'مكتمل'}
                                                </span>
                                            </td>
                                            <td className="text-gray-400 text-sm">{appt.notes || '-'}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="text-center text-gray-400 py-8">
                                            لا توجد مواعيد لهذا اليوم
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
