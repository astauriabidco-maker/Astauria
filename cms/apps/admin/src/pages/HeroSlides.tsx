import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, Sliders } from 'lucide-react';
import api from '../services/api';
import { useState } from 'react';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { toast } from '../components/Toast';

interface HeroSlide {
    id: string;
    surtitle?: string;
    title: string;
    subtitle?: string;
    buttonText?: string;
    buttonLink?: string;
    order: number;
    isActive: boolean;
}

export default function HeroSlides() {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<HeroSlide | null>(null);
    const [deleteItem, setDeleteItem] = useState<HeroSlide | null>(null);
    const [formData, setFormData] = useState({
        surtitle: '',
        title: '',
        subtitle: '',
        buttonText: '',
        buttonLink: '',
        order: 0,
        isActive: true,
    });

    const { data: slides, isLoading } = useQuery({
        queryKey: ['hero-slides'],
        queryFn: async () => (await api.get('/hero-slides')).data,
    });

    const createMutation = useMutation({
        mutationFn: async (data: typeof formData) => (await api.post('/hero-slides', data)).data,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['hero-slides'] });
            toast.success('Slide ajoutée avec succès');
            closeModal();
        },
        onError: () => toast.error('Erreur lors de l\'ajout'),
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: typeof formData }) =>
            (await api.patch(`/hero-slides/${id}`, data)).data,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['hero-slides'] });
            toast.success('Slide mise à jour');
            closeModal();
        },
        onError: () => toast.error('Erreur lors de la mise à jour'),
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => (await api.delete(`/hero-slides/${id}`)).data,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['hero-slides'] });
            toast.success('Slide supprimée');
            setDeleteItem(null);
        },
        onError: () => toast.error('Erreur lors de la suppression'),
    });

    const openCreateModal = () => {
        setEditingItem(null);
        setFormData({
            surtitle: '', title: '', subtitle: '', buttonText: '', buttonLink: '', order: 0, isActive: true,
        });
        setIsModalOpen(true);
    };

    const openEditModal = (item: HeroSlide) => {
        setEditingItem(item);
        setFormData({
            surtitle: item.surtitle || '',
            title: item.title,
            subtitle: item.subtitle || '',
            buttonText: item.buttonText || '',
            buttonLink: item.buttonLink || '',
            order: item.order,
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
        if (!formData.title.trim()) {
            toast.warning('Le titre est obligatoire');
            return;
        }
        
        if (editingItem) {
            updateMutation.mutate({ id: editingItem.id, data: { ...formData, order: Number(formData.order) } });
        } else {
            createMutation.mutate({ ...formData, order: Number(formData.order) });
        }
    };

    const isPending = createMutation.isPending || updateMutation.isPending;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white text-glow">Hero Slider</h1>
                    <p className="text-gold-400/80">Configurez les slides d'accueil (Par secteur, métrique...)</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gold-500 to-gold-400 text-navy-950 rounded-lg hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] transition-all font-bold"
                >
                    <Plus size={18} />
                    <span>Ajouter une slide</span>
                </button>
            </div>

            {isLoading ? (
                <div className="text-center py-12 text-gold-400">Chargement...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(slides || []).map((item: HeroSlide) => (
                        <div
                            key={item.id}
                            className={`glass-panel rounded-xl p-5 hover:bg-white/5 transition-colors ${item.isActive ? '' : 'opacity-60'}`}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div className="text-gold-400 bg-gold-400/10 p-2 rounded-lg">
                                    <Sliders size={24} />
                                </div>
                                <div className="flex gap-1">
                                    <button onClick={() => openEditModal(item)} className="p-1.5 text-gray-400 hover:text-gold-400 hover:bg-white/10 rounded transition-colors">
                                        <Edit2 size={14} />
                                    </button>
                                    <button onClick={() => setDeleteItem(item)} className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-white/10 rounded transition-colors">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                            
                            {item.surtitle && <span className="text-xs text-gold-400 uppercase tracking-wider">{item.surtitle}</span>}
                            <h3 className="font-semibold text-white mb-2 text-xl">{item.title}</h3>
                            <p className="text-gray-300 text-sm mb-4 line-clamp-3">{item.subtitle}</p>

                            <div className="flex items-center gap-4 text-sm mt-4 pt-4 border-t border-white/10">
                                <div><span className="text-gray-500">Ordre:</span> <span className="text-white">{item.order}</span></div>
                                {!item.isActive && (
                                    <span className="text-xs bg-red-500/10 text-red-400 px-2 py-1 rounded">Inactif</span>
                                )}
                            </div>
                        </div>
                    ))}
                    {(!slides || slides.length === 0) && (
                        <div className="col-span-full text-center py-12 text-gray-500">
                            Aucune slide. Cliquez sur "Ajouter une slide" pour commencer.
                        </div>
                    )}
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={closeModal} title={editingItem ? 'Modifier la slide' : 'Nouvelle slide'} size="lg">
                <form id="slideForm" onSubmit={handleSubmit} className="space-y-6 pb-20">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Surtitre (Mots clés / Secteur)</label>
                        <input type="text" value={formData.surtitle} onChange={(e) => setFormData({ ...formData, surtitle: e.target.value })}
                            className="glass-input w-full px-4 py-2 rounded-lg"
                            placeholder="🚀 E-commerce & Retail" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Titre principal *</label>
                        <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="glass-input w-full px-4 py-2 rounded-lg" required
                            placeholder="Boostez vos ventes avec l'IA RAG" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Sous-titre (Description)</label>
                        <textarea value={formData.subtitle} onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })} rows={3}
                            className="glass-input w-full px-4 py-2 rounded-lg resize-none"
                            placeholder="Diagnostics en temps réel..." />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Texte du bouton</label>
                            <input type="text" value={formData.buttonText} onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                                className="glass-input w-full px-4 py-2 rounded-lg"
                                placeholder="Découvrir" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Lien du bouton</label>
                            <input type="text" value={formData.buttonLink} onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
                                className="glass-input w-full px-4 py-2 rounded-lg"
                                placeholder="/solutions.html#ecommerce" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Ordre d'affichage</label>
                            <input type="number" value={formData.order} onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                                className="glass-input w-full px-4 py-2 rounded-lg" />
                        </div>
                        <div className="flex items-center gap-3 pt-6">
                            <input type="checkbox" id="isActive" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                className="w-5 h-5 text-gold-500 bg-navy-900 border-white/20 rounded focus:ring-gold-500" />
                            <label htmlFor="isActive" className="text-sm font-medium text-white">Slide active</label>
                        </div>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-navy-900/95 backdrop-blur-xl border-t border-white/10 flex justify-end gap-3 z-20">
                        <button type="button" onClick={closeModal} className="px-6 py-2.5 text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-medium transition-colors">
                            Annuler
                        </button>
                        <button type="submit" form="slideForm" disabled={isPending} className="px-6 py-2.5 bg-gradient-to-r from-gold-500 to-gold-400 text-navy-950 rounded-xl font-bold hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] disabled:opacity-50 transition-all">
                            {isPending ? 'Enregistrement...' : editingItem ? 'Sauvegarder' : 'Ajouter'}
                        </button>
                    </div>
                </form>
            </Modal>

            <ConfirmDialog isOpen={!!deleteItem} onClose={() => setDeleteItem(null)} onConfirm={() => deleteItem && deleteMutation.mutate(deleteItem.id)}
                title="Supprimer cette slide ?" message={`La slide "${deleteItem?.title}" sera définitivement supprimée.`} confirmText="Supprimer" isLoading={deleteMutation.isPending} />
        </div>
    );
}
