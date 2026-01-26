import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'

export const Login = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const { signIn } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            await signIn(email, password)
            // Navigation handled by router
            navigate('/')
        } catch (err) {
            setError('البريد الإلكتروني أو كلمة المرور غير صحيحة')
            console.error('Login error:', err)
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
                    <h1 className="text-3xl font-bold text-gradient mb-2">نظام إدارة العيادات</h1>
                    <p className="text-gray-400">تسجيل الدخول إلى حسابك</p>
                </div>

                {/* Login Form */}
                <div className="glass rounded-2xl p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <Input
                            label="البريد الإلكتروني"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="example@clinic.com"
                        />

                        <Input
                            label="كلمة المرور"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                        />

                        <Button
                            type="submit"
                            variant="primary"
                            loading={loading}
                            className="w-full"
                        >
                            تسجيل الدخول
                        </Button>
                    </form>

                    {/* Demo Login Buttons */}
                    <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                        <p className="text-center text-blue-400 text-sm font-semibold mb-3">
                            🎯 دخول تجريبي سريع (بدون إعداد)
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setEmail('admin@demo.com')
                                    setPassword('admin123')
                                }}
                                className="btn-secondary text-xs py-2"
                            >
                                مدير النظام
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setEmail('clinic@demo.com')
                                    setPassword('clinic123')
                                }}
                                className="btn-secondary text-xs py-2"
                            >
                                مدير عيادة
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setEmail('staff@demo.com')
                                    setPassword('staff123')
                                }}
                                className="btn-secondary text-xs py-2"
                            >
                                موظف
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setEmail('patient@demo.com')
                                    setPassword('patient123')
                                }}
                                className="btn-secondary text-xs py-2"
                            >
                                مريض
                            </button>
                        </div>
                        <p className="text-center text-gray-500 text-xs mt-2">
                            اضغط على أي زر ثم اضغط "تسجيل الدخول"
                        </p>
                    </div>

                    <div className="mt-6 text-center">
                        <p className="text-gray-400 text-sm">
                            ليس لديك حساب؟{' '}
                            <Link to="/register" className="text-accent-teal hover:underline font-semibold">
                                سجّل الآن
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
