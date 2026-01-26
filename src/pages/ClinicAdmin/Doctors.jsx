import { useState, useEffect } from 'react'
import { Layout } from '../../components/Layout'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { Input } from '../../components/ui/Input'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'

export const Doctors = () => {
    const { profile } = useAuth()
    const [doctors, setDoctors] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingDoctor, setEditingDoctor] = useState(null)
    const [formData, setFormData] = useState({
        full_name: '',
        specialization: '',
        phone: '',
        email: '',
        bio: '',
    })

    useEffect(() => {
        if (profile?.clinic_id) {
            fetchDoctors()
        }
    }, [profile])

    const fetchDoctors = async () => {
        try {
            const { data, error } = await supabase
                .from('doctors')
                .select('*')
                .eq('clinic_id', profile.clinic_id)
                .order('created_at', { ascending: false })

            if (error) throw error
            setDoctors(data || [])
        } catch (error) {
            console.error('Error fetching doctors:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            if (editingDoctor) {
                const { error } = await supabase
                    .from('doctors')
                    .update(formData)
                    .eq('id', editingDoctor.id)

                if (error) throw error
            } else {
                const { error } = await supabase
                    .from('doctors')
                    .insert([{ ...formData, clinic_id: profile.clinic_id }])

                if (error) throw error
            }

            setShowModal(false)
            setEditingDoctor(null)
            setFormData({ full_name: '', specialization: '', phone: '', email: '', bio: '' })
            fetchDoctors()
        } catch (error) {
            console.error('Error saving doctor:', error)
            alert('حدث خطأ أثناء حفظ البيانات')
        }
    }

    const handleEdit = (doctor) => {
        setEditingDoctor(doctor)
        setFormData({
            full_name: doctor.full_name,
            specialization: doctor.specialization || '',
            phone: doctor.phone || '',
            email: doctor.email || '',
            bio: doctor.bio || '',
        })
        setShowModal(true)
    }

    const toggleActive = async (doctor) => {
        try {
            const { error } = await supabase
                .from('doctors')
                .update({ is_active: !doctor.is_active })
                .eq('id', doctor.id)

            if (error) throw error
            fetchDoctors()
        } catch (error) {
            console.error('Error toggling doctor status:', error)
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
                        <h1 className="text-3xl font-bold text-white mb-2">إدارة الأطباء</h1>
                        <p className="text-gray-400">إضافة وإدارة الأطباء في العيادة</p>
                    </div>
                    <Button onClick={() => setShowModal(true)}>
                        إضافة طبيب جديد
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {doctors.map((doctor) => (
                        <Card key={doctor.id} hover>
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-white mb-1">{doctor.full_name}</h3>
                                    <p className="text-sm text-accent-teal">{doctor.specialization}</p>
                                </div>
                                <span className={`badge ${doctor.is_active ? 'badge-success' : 'badge-danger'}`}>
                                    {doctor.is_active ? 'نشط' : 'غير نشط'}
                                </span>
                            </div>

                            <div className="space-y-2 mb-4">
                                {doctor.phone && (
                                    <p className="text-sm text-gray-400">📱 {doctor.phone}</p>
                                )}
                                {doctor.email && (
                                    <p className="text-sm text-gray-400">✉️ {doctor.email}</p>
                                )}
                                {doctor.bio && (
                                    <p className="text-sm text-gray-400 mt-3">{doctor.bio}</p>
                                )}
                            </div>

                            <div className="flex gap-2">
                                <Button variant="secondary" onClick={() => handleEdit(doctor)} className="flex-1 text-sm">
                                    تعديل
                                </Button>
                                <Button
                                    variant={doctor.is_active ? 'danger' : 'primary'}
                                    onClick={() => toggleActive(doctor)}
                                    className="flex-1 text-sm"
                                >
                                    {doctor.is_active ? 'تعطيل' : 'تفعيل'}
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>

                <Modal
                    isOpen={showModal}
                    onClose={() => {
                        setShowModal(false)
                        setEditingDoctor(null)
                        setFormData({ full_name: '', specialization: '', phone: '', email: '', bio: '' })
                    }}
                    title={editingDoctor ? 'تعديل بيانات الطبيب' : 'إضافة طبيب جديد'}
                >
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            label="اسم الطبيب"
                            value={formData.full_name}
                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                            required
                        />
                        <Input
                            label="التخصص"
                            value={formData.specialization}
                            onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                        />
                        <Input
                            label="رقم الهاتف"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                        <Input
                            label="البريد الإلكتروني"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                        <div className="flex gap-4 mt-6">
                            <Button type="submit" className="flex-1">
                                {editingDoctor ? 'حفظ التعديلات' : 'إضافة الطبيب'}
                            </Button>
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setShowModal(false)}
                                className="flex-1"
                            >
                                إلغاء
                            </Button>
                        </div>
                    </form>
                </Modal>
            </div>
        </Layout>
    )
}
