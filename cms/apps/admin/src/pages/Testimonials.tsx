import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, Quote, Star } from 'lucide-react';
import api from '../services/api';
import { useState } from 'react';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { toast } from '../components/Toast';

interface Testimonial {
    id: string;
    author: string;
    role: string;
    company: string;
    content: string;
    companyLogo?: string;
    rating?: number;
    order: number;
    isActive: boolean;
}

export default function Testimonials() {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Testimonial | null>(null);
    const [deleteItem, setDeleteItem] = useState<Testimonial | null>(null);
    const [formData, setFormData] = useState({
        author: '',
        role: '',
        company: '',
        content: '',
        companyLogo: '',
        rating: 5,
        isActive: true,
    });

    const { data: testimonials, isLoading } = useQuery({
        queryKey: ['testimonials'],
        queryFn: async () => (await api.get('/testimonials')).data,
    });

    const createMutation = useMutation({
        mutationFn: async (data: typeof formData) => (await api.post('/testimonials', data)).data,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['testimonials'] });
            toast.success('Témoignage créé avec succès');
            closeModal();
        },
        onError: () => toast.error('Erreur lors de la création'),
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: typeof formData }) =>
            (await api.patch(`/testimonials/${id}`, data)).data,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['testimonials'] });
            toast.success('Témoignage mis à jour');
            closeModal();
        },
        onError: () => toast.error('Erreur lors de la mise à jour'),
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => (await api.delete(`/testimonials/${id}`)).data,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['testimonials'] });
            toast.success('Témoignage supprimé');
            setDeleteItem(null);
        },
        onError: () => toast.error('Erreur lors de la suppression'),
    });

    const openCreateModal = () => {
        setEditingItem(null);
        setFormData({ author: '', role: '', company: '', content: '', companyLogo: '', rating: 5, isActive: true });
        setIsModalOpen(true);
    };

    const openEditModal = (item: Testimonial) => {
        setEditingItem(item);
        setFormData({
            author: item.author,
            role: item.role || '',
            company: item.company,
            content: item.content,
            companyLogo: item.companyLogo || '',
            rating: item.rating || 5,
            isActive: item.isActive,
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.author.trim() || !formData.company.trim() || !formData.content.trim()) {
            toast.warning('Veuillez remplir les champs obligatoires');
            return;
        }
        if (editingItem) {
            updateMutation.mutate({ id: editingItem.id, data: formData });
        } else {
            createMutation.mutate(formData);
        }
    };

    const isPending = createMutation.isPending || updateMutation.isPending;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Témoignages</h1>
                    <p className="text-gray-500">Avis et retours de vos clients</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 px-4 py-2 bg-gold-500 text-white rounded-lg hover:bg-gold-600 transition-colors font-medium"
                >
                    <Plus size={18} />
                    <span>Ajouter un témoignage</span>
                </button>
            </div>

            {isLoading ? (
                <div className="text-center py-12 text-gray-500">Chargement...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(testimonials || []).map((item: Testimonial) => (
                        <div
                            key={item.id}
                            className={`bg-white rounded-xl shadow-sm border p-5 ${item.isActive ? 'border-gray-100' : 'border-gray-200 opacity-60'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <Quote className="text-gold-400" size={24} />
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => openEditModal(item)}
                                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                    >
                                        <Edit2 size={14} />
                                    </button>
                                    <button
                                        onClick={() => setDeleteItem(item)}
                                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                            <p className="text-gray-700 text-sm mb-4 line-clamp-4">{item.content}</p>
                            <div className="flex items-center gap-3 pt-3 border-t border-gray-50">
                                <div className="w-10 h-10 rounded-full bg-navy-100 flex items-center justify-center text-navy-600 font-semibold">
                                    {item.author.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-900 text-sm truncate">{item.author}</p>
                                    <p className="text-xs text-gray-500 truncate">{item.role && `${item.role}, `}{item.company}</p>
                                </div>
                            </div>
                            {!item.isActive && (
                                <span className="inline-block mt-3 text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">Inactif</span>
                            )}
                        </div>
                    ))}
                    {(!testimonials || testimonials.length === 0) && (
                        <div className="col-span-full text-center py-12 text-gray-400">
                            Aucun témoignage. Cliquez sur "Ajouter un témoignage" pour commencer.
                        </div>
                    )}
                </div>
            )}

            {/* Create/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={editingItem ? 'Modifier le témoignage' : 'Nouveau témoignage'}
                size="lg"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                            <input
                                type="text"
                                value={formData.author}
                                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                                placeholder="Jean Dupont"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Poste</label>
                            <input
                                type="text"
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                                placeholder="Directeur"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Entreprise *</label>
                        <input
                            type="text"
                            value={formData.company}
                            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                            placeholder="Nom de l'entreprise"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Témoignage *</label>
                        <textarea
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent resize-none"
                            placeholder="Le témoignage du client..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Logo entreprise (URL)</label>
                        <input
                            type="url"
                            value={formData.companyLogo}
                            onChange={(e) => setFormData({ ...formData, companyLogo: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                            placeholder="https://..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Note</label>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, rating: star })}
                                    className="p-1"
                                >
                                    <Star
                                        size={24}
                                        className={star <= formData.rating ? 'text-gold-400 fill-gold-400' : 'text-gray-300'}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="isActive"
                            checked={formData.isActive}
                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                            className="w-4 h-4 text-gold-500 border-gray-300 rounded focus:ring-gold-500"
                        />
                        <label htmlFor="isActive" className="text-sm text-gray-700">Actif</label>
                    </div>
                    <div className="flex gap-3 justify-end pt-4 border-t">
                        <button type="button" onClick={closeModal} className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium">
                            Annuler
                        </button>
                        <button type="submit" disabled={isPending} className="px-4 py-2 bg-navy-900 text-white rounded-lg font-medium hover:bg-navy-800 disabled:opacity-50">
                            {isPending ? 'Enregistrement...' : editingItem ? 'Mettre à jour' : 'Créer'}
                        </button>
                    </div>
                </form>
            </Modal>

            <ConfirmDialog
                isOpen={!!deleteItem}
                onClose={() => setDeleteItem(null)}
                onConfirm={() => deleteItem && deleteMutation.mutate(deleteItem.id)}
                title="Supprimer ce témoignage ?"
                message={`Le témoignage de "${deleteItem?.author}" sera définitivement supprimé.`}
                confirmText="Supprimer"
                isLoading={deleteMutation.isPending}
            />
        </div>
    );
}
