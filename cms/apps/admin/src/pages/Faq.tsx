import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, ChevronDown, ChevronUp, GripVertical } from 'lucide-react';
import api from '../services/api';
import { useState } from 'react';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { toast } from '../components/Toast';

interface FaqItem {
    id: string;
    question: string;
    answer: string;
    order: number;
    isActive: boolean;
}

export default function Faq() {
    const queryClient = useQueryClient();
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<FaqItem | null>(null);
    const [deleteItem, setDeleteItem] = useState<FaqItem | null>(null);
    const [formData, setFormData] = useState({ question: '', answer: '', isActive: true });

    const { data: faqItems, isLoading } = useQuery({
        queryKey: ['faq'],
        queryFn: async () => (await api.get('/faq')).data,
    });

    const createMutation = useMutation({
        mutationFn: async (data: typeof formData) => {
            return (await api.post('/faq', data)).data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['faq'] });
            toast.success('FAQ créée avec succès');
            closeModal();
        },
        onError: () => toast.error('Erreur lors de la création'),
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
            return (await api.patch(`/faq/${id}`, data)).data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['faq'] });
            toast.success('FAQ mise à jour avec succès');
            closeModal();
        },
        onError: () => toast.error('Erreur lors de la mise à jour'),
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            return (await api.delete(`/faq/${id}`)).data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['faq'] });
            toast.success('FAQ supprimée');
            setDeleteItem(null);
        },
        onError: () => toast.error('Erreur lors de la suppression'),
    });

    const openCreateModal = () => {
        setEditingItem(null);
        setFormData({ question: '', answer: '', isActive: true });
        setIsModalOpen(true);
    };

    const openEditModal = (item: FaqItem) => {
        setEditingItem(item);
        setFormData({ question: item.question, answer: item.answer, isActive: item.isActive });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
        setFormData({ question: '', answer: '', isActive: true });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.question.trim() || !formData.answer.trim()) {
            toast.warning('Veuillez remplir tous les champs');
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
                    <h1 className="text-2xl font-bold text-white text-glow">FAQ</h1>
                    <p className="text-gold-400/80">Gérez les questions fréquentes</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gold-500 to-gold-400 text-navy-950 rounded-lg hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] transition-all font-bold"
                >
                    <Plus size={18} />
                    <span>Ajouter une FAQ</span>
                </button>
            </div>

            {isLoading ? (
                <div className="text-center py-12 text-gold-400">Chargement...</div>
            ) : (
                <div className="space-y-3">
                    {(faqItems || []).map((item: FaqItem) => (
                        <div
                            key={item.id}
                            className={`glass-panel rounded-xl transition-all ${item.isActive ? '' : 'opacity-60'}`}
                        >
                            <div className="flex items-center gap-3 p-4">
                                <button className="text-gray-400 hover:text-white cursor-grab">
                                    <GripVertical size={18} />
                                </button>
                                <button
                                    onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                                    className="flex-1 flex items-center justify-between text-left group"
                                >
                                    <span className="font-medium text-white group-hover:text-gold-400 transition-colors">{item.question}</span>
                                    {expandedId === item.id ? (
                                        <ChevronUp size={18} className="text-gold-400" />
                                    ) : (
                                        <ChevronDown size={18} className="text-gray-400" />
                                    )}
                                </button>
                                <div className="flex items-center gap-2">
                                    {!item.isActive && (
                                        <span className="text-xs bg-white/5 border border-white/10 text-gray-400 px-2 py-1 rounded">Inactif</span>
                                    )}
                                    <button
                                        onClick={() => openEditModal(item)}
                                        className="p-2 text-gray-400 hover:text-gold-400 hover:bg-white/10 rounded-lg transition-colors"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => setDeleteItem(item)}
                                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                            {expandedId === item.id && (
                                <div className="px-4 pb-4 pt-0 ml-10 text-gray-300 text-sm border-t border-white/10">
                                    <p className="pt-3">{item.answer}</p>
                                </div>
                            )}
                        </div>
                    ))}
                    {(!faqItems || faqItems.length === 0) && (
                        <div className="text-center py-12 text-gray-400">
                            Aucune FAQ. Cliquez sur "Ajouter une FAQ" pour commencer.
                        </div>
                    )}
                </div>
            )}

            {/* Create/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={editingItem ? 'Modifier la FAQ' : 'Nouvelle FAQ'}
                size="lg"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Question *</label>
                        <input
                            type="text"
                            value={formData.question}
                            onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                            className="glass-input w-full px-4 py-2 rounded-lg"
                            placeholder="Ex: Comment fonctionne votre service ?"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Réponse *</label>
                        <textarea
                            value={formData.answer}
                            onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                            rows={5}
                            className="glass-input w-full px-4 py-2 rounded-lg resize-none"
                            placeholder="Votre réponse détaillée..."
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="isActive"
                            checked={formData.isActive}
                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                            className="w-4 h-4 text-gold-500 bg-navy-950 border-white/20 rounded focus:ring-gold-500"
                        />
                        <label htmlFor="isActive" className="text-sm text-gray-300">Actif (visible sur le site)</label>
                    </div>
                    <div className="flex gap-3 justify-end pt-4 border-t border-white/10">
                        <button
                            type="button"
                            onClick={closeModal}
                            className="px-4 py-2 text-gray-300 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg font-medium transition-colors"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="px-4 py-2 bg-gradient-to-r from-gold-500 to-gold-400 text-navy-950 rounded-lg font-bold hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] transition-all disabled:opacity-50"
                        >
                            {isPending ? 'Enregistrement...' : editingItem ? 'Mettre à jour' : 'Créer'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={!!deleteItem}
                onClose={() => setDeleteItem(null)}
                onConfirm={() => deleteItem && deleteMutation.mutate(deleteItem.id)}
                title="Supprimer cette FAQ ?"
                message={`La question "${deleteItem?.question}" sera définitivement supprimée.`}
                confirmText="Supprimer"
                isLoading={deleteMutation.isPending}
            />
        </div>
    );
}
