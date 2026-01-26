import { useState, useEffect } from 'react'
import { Layout } from '../../components/Layout'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { Input } from '../../components/ui/Input'
import { supabase } from '../../lib/supabase'

export const Clinics = () => {
    const [clinics, setClinics] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingClinic, setEditingClinic] = useState(null)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
    })

    useEffect(() => {
        fetchClinics()
    }, [])

    const fetchClinics = async () => {
        try {
            const { data, error } = await supabase
                .from('clinics')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            setClinics(data || [])
        } catch (error) {
            console.error('Error fetching clinics:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            if (editingClinic) {
                // Update existing clinic
                const { error } = await supabase
                    .from('clinics')
                    .update(formData)
                    .eq('id', editingClinic.id)

                if (error) throw error
            } else {
                // Create new clinic
                const { error } = await supabase
                    .from('clinics')
                    .insert([formData])

                if (error) throw error
            }

            setShowModal(false)
            setEditingClinic(null)
            setFormData({ name: '', email: '', phone: '', address: '', city: '' })
            fetchClinics()
        } catch (error) {
            console.error('Error saving clinic:', error)
            alert('حدث خطأ أثناء حفظ البيانات')
        }
    }

    const handleEdit = (clinic) => {
        setEditingClinic(clinic)
        setFormData({
            name: clinic.name,
            email: clinic.email,
            phone: clinic.phone || '',
            address: clinic.address || '',
            city: clinic.city || '',
        })
        setShowModal(true)
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
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">إدارة العيادات</h1>
                        <p className="text-gray-400">عرض وإدارة جميع العيادات المسجلة</p>
                    </div>
                    <Button onClick={() => setShowModal(true)}>
                        إضافة عيادة جديدة
                    </Button>
                </div>

                {/* Clinics List */}
                <Card>
                    <div className="overflow-x-auto">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>اسم العيادة</th>
                                    <th>البريد الإلكتروني</th>
                                    <th>الهاتف</th>
                                    <th>المدينة</th>
                                    <th>حالة الاشتراك</th>
                                    <th>الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {clinics.map((clinic) => (
                                    <tr key={clinic.id}>
                                        <td className="font-semibold text-white">{clinic.name}</td>
                                        <td className="text-gray-400">{clinic.email}</td>
                                        <td className="text-gray-400">{clinic.phone || '-'}</td>
                                        <td className="text-gray-400">{clinic.city || '-'}</td>
                                        <td>
                                            <span className={`badge ${clinic.subscription_status === 'active' ? 'badge-success' :
                                                    clinic.subscription_status === 'inactive' ? 'badge-danger' :
                                                        'badge-warning'
                                                }`}>
                                                {clinic.subscription_status === 'active' ? 'نشط' :
                                                    clinic.subscription_status === 'inactive' ? 'غير نشط' : 'معلق'}
                                            </span>
                                        </td>
                                        <td>
                                            <Button
                                                variant="secondary"
                                                onClick={() => handleEdit(clinic)}
                                                className="text-sm py-2"
                                            >
                                                تعديل
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* Add/Edit Modal */}
                <Modal
                    isOpen={showModal}
                    onClose={() => {
                        setShowModal(false)
                        setEditingClinic(null)
                        setFormData({ name: '', email: '', phone: '', address: '', city: '' })
                    }}
                    title={editingClinic ? 'تعديل بيانات العيادة' : 'إضافة عيادة جديدة'}
                >
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            label="اسم العيادة"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                        <Input
                            label="البريد الإلكتروني"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                        <Input
                            label="رقم الهاتف"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                        <Input
                            label="المدينة"
                            value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        />
                        <Input
                            label="العنوان"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        />
                        <div className="flex gap-4 mt-6">
                            <Button type="submit" className="flex-1">
                                {editingClinic ? 'حفظ التعديلات' : 'إضافة العيادة'}
                            </Button>
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => {
                                    setShowModal(false)
                                    setEditingClinic(null)
                                }}
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
