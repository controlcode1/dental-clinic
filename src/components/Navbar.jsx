import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export const Navbar = () => {
    const { user, profile, signOut } = useAuth()
    const navigate = useNavigate()

    const handleSignOut = async () => {
        try {
            await signOut()
            navigate('/login')
        } catch (error) {
            console.error('Error signing out:', error)
        }
    }

    return (
        <nav className="glass border-b border-dark-border sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                            </svg>
                        </div>
                        <span className="text-xl font-bold text-gradient">نظام إدارة العيادات</span>
                    </Link>

                    {/* User Menu */}
                    <div className="flex items-center gap-4">
                        {user && profile && (
                            <>
                                <div className="text-left">
                                    <p className="text-sm font-semibold text-white">{profile.full_name}</p>
                                    <p className="text-xs text-gray-400">
                                        {profile.role === 'super_admin' && 'مدير النظام'}
                                        {profile.role === 'clinic_admin' && 'مدير العيادة'}
                                        {profile.role === 'staff' && 'موظف'}
                                        {profile.role === 'patient' && 'مريض'}
                                    </p>
                                </div>
                                <button
                                    onClick={handleSignOut}
                                    className="btn-secondary text-sm"
                                >
                                    تسجيل خروج
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    )
}
