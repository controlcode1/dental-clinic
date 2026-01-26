import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { DEMO_MODE, demoUsers } from '../lib/demoMode'

const AuthContext = createContext({})

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider')
    }
    return context
}

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Demo Mode Check
        if (DEMO_MODE) {
            const demoUser = localStorage.getItem('demoUser')
            if (demoUser) {
                const userData = JSON.parse(demoUser)
                setUser(userData.user)
                setProfile(userData.profile)
            }
            setLoading(false)
            return
        }

        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null)
            if (session?.user) {
                fetchProfile(session.user.id)
            } else {
                setLoading(false)
            }
        })

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                setUser(session?.user ?? null)
                if (session?.user) {
                    await fetchProfile(session.user.id)
                } else {
                    setProfile(null)
                    setLoading(false)
                }
            }
        )

        return () => subscription.unsubscribe()
    }, [])

    const fetchProfile = async (userId) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single()

            if (error) throw error

            setProfile(data)

            // Update JWT claims with role and clinic_id
            await supabase.auth.updateUser({
                data: {
                    role: data.role,
                    clinic_id: data.clinic_id
                }
            })
        } catch (error) {
            console.error('Error fetching profile:', error)
        } finally {
            setLoading(false)
        }
    }

    const signIn = async (email, password) => {
        // Demo Mode
        if (DEMO_MODE) {
            const demoUser = Object.values(demoUsers).find(
                u => u.email === email && u.password === password
            )

            if (!demoUser) {
                throw new Error('بيانات الدخول غير صحيحة')
            }

            const userData = {
                user: { id: demoUser.id, email: demoUser.email },
                profile: demoUser.profile
            }

            localStorage.setItem('demoUser', JSON.stringify(userData))
            setUser(userData.user)
            setProfile(userData.profile)

            return { user: userData.user }
        }

        // Real Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) throw error
        return data
    }

    const signUp = async (email, password, userData) => {
        if (DEMO_MODE) {
            throw new Error('التسجيل غير متاح في الوضع التجريبي')
        }

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: userData,
            },
        })

        if (error) throw error

        // Create profile
        if (data.user) {
            const { error: profileError } = await supabase
                .from('profiles')
                .insert([
                    {
                        id: data.user.id,
                        clinic_id: userData.clinic_id,
                        role: userData.role || 'patient',
                        full_name: userData.full_name,
                        phone: userData.phone,
                    },
                ])

            if (profileError) throw profileError
        }

        return data
    }

    const signOut = async () => {
        if (DEMO_MODE) {
            localStorage.removeItem('demoUser')
            setUser(null)
            setProfile(null)
            return
        }

        const { error } = await supabase.auth.signOut()
        if (error) throw error
    }

    const value = {
        user,
        profile,
        loading,
        signIn,
        signUp,
        signOut,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
