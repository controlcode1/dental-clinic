import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { user, profile, loading } = useAuth()

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-dark-bg">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500 mx-auto"></div>
                    <p className="mt-4 text-gray-400">جاري التحميل...</p>
                </div>
            </div>
        )
    }

    if (!user) {
        return <Navigate to="/login" replace />
    }

    if (!profile) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-dark-bg">
                <div className="text-center">
                    <p className="text-red-400">خطأ في تحميل بيانات المستخدم</p>
                </div>
            </div>
        )
    }

    // Check if user's role is allowed
    if (allowedRoles.length > 0 && !allowedRoles.includes(profile.role)) {
        return <Navigate to="/unauthorized" replace />
    }

    // Check subscription status for non-super-admins
    if (profile.role !== 'super_admin' && profile.clinic_id) {
        // TODO: Check clinic subscription status
        // This will be implemented when we fetch clinic data
    }

    return children
}
