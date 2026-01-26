import { useState, useEffect } from 'react'
import { Layout } from '../../components/Layout'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { Input } from '../../components/ui/Input'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'

export const Services = () => {
    const { profile } = useAuth()
    const [services, setServices] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingService, setEditingService] = useState(null)
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        duration_minutes: '30',
    })

    useEffect(() => {
        if (profile?.clinic_id) {
            fetchServices()
        }
    }, [profile])

    const fetchServices = async () => {
        try {
            const { data, error } = await supabase
                .from('services')
                .select('*')
                .eq('clinic_id', profile.clinic_id)
                .order('created_at', { ascending: false })

            if (error) throw error
            setServices(data || [])
        } catch (error) {
            console.error('Error fetching services:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            if (editingService) {
                const { error } = await supabase
                    .from('services')
                    .update(formData)
                    .eq('id', editingService.id)

                if (error) throw error
            } else {
                const { error } = await supabase
                    .from('services')
                    .insert([{ ...formData, clinic_id: profile.clinic_id }])

                if (error) throw error
            }

            setShowModal(false)
            setEditingService(null)
            setFormData({ name: '', description: '', price: '', duration_minutes: '30' })
            fetchServices()
        } catch (error) {
            console.error('Error saving service:', error)
            alert('حدث خطأ أثناء حفظ البيانات')
        }
    }

    const handleEdit = (service) => {
        setEditingService(service)
        setFormData({
            name: service.name,
            description: service.description || '',
            price: service.price.toString(),
            duration_minutes: service.duration_minutes.toString(),
        })
        setShowModal(true)
    }

    const toggleActive = async (service) => {
        try {
            const { error } = await supabase
                .from('services')
                .update({ is_active: !service.is_active })
                .eq('id', service.id)

            if (error) throw error
            fetchServices()
        } catch (error) {
            console.error('Error toggling service status:', error)
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
                        <h1 className="text-3xl font-bold text-white mb-2">إدارة الخدمات</h1>
                        <p className="text-gray-400">إضافة وإدارة الخدمات الطبية</p>
                    </div>
                    <Button onClick={() => setShowModal(true)}>
                        إضافة خدمة جديدة
                    </Button>
                </div>

                <Card>
                    <div className="overflow-x-auto">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>اسم الخدمة</th>
                                    <th>الوصف</th>
                                    <th>السعر (IQD)</th>
                                    <th>المدة (دقيقة)</th>
                                    <th>الحالة</th>
                                    <th>الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {services.map((service) => (
                                    <tr key={service.id}>
                                        <td className="font-semibold text-white">{service.name}</td>
                                        <td className="text-gray-400 text-sm">{service.description || '-'}</td>
                                        <td className="text-gray-400">{Number(service.price).toLocaleString()}</td>
                                        <td className="text-gray-400">{service.duration_minutes}</td>
                                        <td>
                                            <span className={`badge ${service.is_active ? 'badge-success' : 'badge-danger'}`}>
                                                {service.is_active ? 'نشط' : 'غير نشط'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="flex gap-2">
                                                <Button variant="secondary" onClick={() => handleEdit(service)} className="text-sm py-2">
                                                    تعديل
                                                </Button>
                                                <Button
                                                    variant={service.is_active ? 'danger' : 'primary'}
                                                    onClick={() => toggleActive(service)}
                                                    className="text-sm py-2"
                                                >
                                                    {service.is_active ? 'تعطيل' : 'تفعيل'}
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>

                <Modal
                    isOpen={showModal}
                    onClose={() => {
                        setShowModal(false)
                        setEditingService(null)
                        setFormData({ name: '', description: '', price: '', duration_minutes: '30' })
                    }}
                    title={editingService ? 'تعديل الخدمة' : 'إضافة خدمة جديدة'}
                >
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            label="اسم الخدمة"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                        <Input
                            label="السعر (IQD)"
                            type="number"
                            step="0.01"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            required
                        />
                        <Input
                            label="المدة بالدقائق"
                            type="number"
                            value={formData.duration_minutes}
                            onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                            required
                        />
                        <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-2">الوصف</label>
                            <textarea
                                className="input-field min-h-[100px]"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                        <div className="flex gap-4 mt-6">
                            <Button type="submit" className="flex-1">
                                {editingService ? 'حفظ التعديلات' : 'إضافة الخدمة'}
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
