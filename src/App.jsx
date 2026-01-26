import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'

// Auth Pages
import { Login } from './pages/Login'
import { Register } from './pages/Register'

// Super Admin Pages
import { SuperAdminDashboard } from './pages/SuperAdmin/Dashboard'
import { Clinics } from './pages/SuperAdmin/Clinics'
import { Subscriptions } from './pages/SuperAdmin/Subscriptions'

// Clinic Admin Pages
import { ClinicDashboard } from './pages/ClinicAdmin/Dashboard'
import { Doctors } from './pages/ClinicAdmin/Doctors'
import { Services } from './pages/ClinicAdmin/Services'
import { Settings } from './pages/ClinicAdmin/Settings'

// Appointment Pages
import { ManageAppointments } from './pages/Appointments/ManageAppointments'
import { BookAppointment } from './pages/Appointments/BookAppointment'
import { MyAppointments } from './pages/Appointments/MyAppointments'

// Root redirect component
const RootRedirect = () => {
    const { profile, loading } = useAuth()

    if (loading) {
        return (
            <div className="min-h-screen bg-dark-bg flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500"></div>
            </div>
        )
    }

    if (!profile) {
        return <Navigate to="/login" replace />
    }

    // Redirect based on role
    switch (profile.role) {
        case 'super_admin':
            return <Navigate to="/super-admin/dashboard" replace />
        case 'clinic_admin':
            return <Navigate to="/clinic/dashboard" replace />
        case 'staff':
            return <Navigate to="/staff/appointments" replace />
        case 'patient':
            return <Navigate to="/patient/appointments" replace />
        default:
            return <Navigate to="/login" replace />
    }
}

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Super Admin Routes */}
                    <Route
                        path="/super-admin/dashboard"
                        element={
                            <ProtectedRoute allowedRoles={['super_admin']}>
                                <SuperAdminDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/super-admin/clinics"
                        element={
                            <ProtectedRoute allowedRoles={['super_admin']}>
                                <Clinics />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/super-admin/subscriptions"
                        element={
                            <ProtectedRoute allowedRoles={['super_admin']}>
                                <Subscriptions />
                            </ProtectedRoute>
                        }
                    />

                    {/* Clinic Admin Routes */}
                    <Route
                        path="/clinic/dashboard"
                        element={
                            <ProtectedRoute allowedRoles={['clinic_admin']}>
                                <ClinicDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/clinic/appointments"
                        element={
                            <ProtectedRoute allowedRoles={['clinic_admin', 'staff']}>
                                <ManageAppointments />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/clinic/doctors"
                        element={
                            <ProtectedRoute allowedRoles={['clinic_admin']}>
                                <Doctors />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/clinic/services"
                        element={
                            <ProtectedRoute allowedRoles={['clinic_admin']}>
                                <Services />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/clinic/settings"
                        element={
                            <ProtectedRoute allowedRoles={['clinic_admin']}>
                                <Settings />
                            </ProtectedRoute>
                        }
                    />

                    {/* Staff Routes */}
                    <Route
                        path="/staff/appointments"
                        element={
                            <ProtectedRoute allowedRoles={['staff']}>
                                <ManageAppointments />
                            </ProtectedRoute>
                        }
                    />

                    {/* Patient Routes */}
                    <Route
                        path="/patient/book"
                        element={
                            <ProtectedRoute allowedRoles={['patient']}>
                                <BookAppointment />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/patient/appointments"
                        element={
                            <ProtectedRoute allowedRoles={['patient']}>
                                <MyAppointments />
                            </ProtectedRoute>
                        }
                    />

                    {/* Default Routes */}
                    <Route path="/" element={<RootRedirect />} />
                    <Route path="/unauthorized" element={
                        <div className="min-h-screen bg-dark-bg flex items-center justify-center">
                            <div className="text-center">
                                <h1 className="text-4xl font-bold text-white mb-4">غير مصرح</h1>
                                <p className="text-gray-400 mb-6">ليس لديك صلاحية للوصول إلى هذه الصفحة</p>
                                <a href="/login" className="btn-primary">العودة إلى تسجيل الدخول</a>
                            </div>
                        </div>
                    } />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    )
}

export default App
