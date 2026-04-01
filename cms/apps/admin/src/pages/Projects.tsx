import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, FolderGit2, Link as LinkIcon } from 'lucide-react';
import api from '../services/api';
import { useState } from 'react';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { toast } from '../components/Toast';

interface Project {
    id: string;
    name: string;
    description: string;
    icon: string;
    tags: string;
    url?: string;
    order: number;
    isActive: boolean;
}

export default function Projects() {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Project | null>(null);
    const [deleteItem, setDeleteItem] = useState<Project | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        icon: 'layout-dashboard',
        tags: '',
        url: '',
        isActive: true,
    });

    const { data: projects, isLoading } = useQuery({
        queryKey: ['projects'],
        queryFn: async () => (await api.get('/projects')).data,
    });

    const createMutation = useMutation({
        mutationFn: async (data: typeof formData) => (await api.post('/projects', data)).data,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            toast.success('Réalisation ajoutée avec succès');
            closeModal();
        },
        onError: () => toast.error('Erreur lors de l\'ajout'),
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: typeof formData }) =>
            (await api.patch(`/projects/${id}`, data)).data,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            toast.success('Réalisation mise à jour');
            closeModal();
        },
        onError: () => toast.error('Erreur lors de la mise à jour'),
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => (await api.delete(`/projects/${id}`)).data,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            toast.success('Réalisation supprimée');
            setDeleteItem(null);
        },
        onError: () => toast.error('Erreur lors de la suppression'),
    });

    const openCreateModal = () => {
        setEditingItem(null);
        setFormData({
            name: '', description: '', icon: 'layout-dashboard', tags: '', url: '', isActive: true,
        });
        setIsModalOpen(true);
    };

    const openEditModal = (item: Project) => {
        setEditingItem(item);
        setFormData({
            name: item.name,
            description: item.description,
            icon: item.icon || 'layout-dashboard',
            tags: item.tags || '',
            url: item.url || '',
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
        if (!formData.name.trim() || !formData.description.trim() || !formData.tags.trim()) {
            toast.warning('Veuillez remplir le nom, la description et les tags');
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
                    <h1 className="text-2xl font-bold text-white text-glow">Réalisations & Produits</h1>
                    <p className="text-gold-400/80">Gérez vos plateformes SaaS et projets PME mis en production</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gold-500 to-gold-400 text-navy-950 rounded-lg hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] transition-all font-bold"
                >
                    <Plus size={18} />
                    <span>Ajouter un produit</span>
                </button>
            </div>

            {isLoading ? (
                <div className="text-center py-12 text-gold-400">Chargement...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(projects || []).map((item: Project) => (
                        <div
                            key={item.id}
                            className={`glass-panel rounded-xl p-5 hover:bg-white/5 transition-colors ${item.isActive ? '' : 'opacity-60'}`}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div className="text-gold-400 bg-gold-400/10 p-2 rounded-lg">
                                    <FolderGit2 size={24} />
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
                            
                            <h3 className="font-semibold text-white mb-1 text-lg">{item.name}</h3>
                            <p className="text-gray-300 text-sm mb-4 line-clamp-3 leading-relaxed">{item.description}</p>
                            
                            <div className="flex flex-wrap gap-2 mb-4">
                                {(() => {
                                    try {
                                        const tagsArray = JSON.parse(item.tags || '[]');
                                        if (Array.isArray(tagsArray)) {
                                            return tagsArray.map((t: string, i) => (
                                                <span key={i} className="text-xs font-medium bg-white/5 text-gray-300 border border-white/10 px-2 py-1 rounded">{t}</span>
                                            ));
                                        }
                                        return <span className="text-xs font-medium bg-white/5 text-gray-300 border border-white/10 px-2 py-1 rounded">{item.tags}</span>;
                                    } catch {
                                        return item.tags.split(',').map((t, i) => (
                                            <span key={i} className="text-xs font-medium bg-white/5 text-gray-300 border border-white/10 px-2 py-1 rounded">{t.trim()}</span>
                                        ));
                                    }
                                })()}
                            </div>

                            <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/10">
                                {!item.isActive && (
                                    <span className="text-xs bg-red-500/10 text-red-400 px-2 py-1 rounded">Inactif</span>
                                )}
                                {item.url && (
                                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="ml-auto text-xs flex items-center gap-1 text-gold-400 hover:text-gold-300 transition-colors">
                                        Voir live <LinkIcon size={12} />
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                    {(!projects || projects.length === 0) && (
                        <div className="col-span-full text-center py-12 text-gray-500">
                            Aucune réalisation. Cliquez sur "Ajouter un produit" pour commencer.
                        </div>
                    )}
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={closeModal} title={editingItem ? 'Modifier le produit' : 'Nouveau produit'} size="xl">
                <form id="projectForm" onSubmit={handleSubmit} className="space-y-6 pb-20">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Nom du produit / plateforme *</label>
                            <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="glass-input w-full px-4 py-2 rounded-lg"
                                placeholder="Polyx ERP" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">URL (optionnel)</label>
                            <input type="url" value={formData.url} onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                className="glass-input w-full px-4 py-2 rounded-lg"
                                placeholder="https://..." />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Icône (Nom composant Lucide. ex: "sparkles")</label>
                            <input type="text" value={formData.icon} onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                className="glass-input w-full px-4 py-2 rounded-lg"
                                placeholder="sparkles" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Tags (formatés en tableau JSON: ["Secteur X", "IA VZ"])</label>
                            <input type="text" value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                className="glass-input w-full px-4 py-2 rounded-lg font-mono text-sm"
                                placeholder='["Secteur : Formation", "IA Insight Engine"]' />
                            <p className="text-xs text-gray-500 mt-1">Sera parsé automatiquement sur la landing page.</p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Description *</label>
                        <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={4}
                            className="glass-input w-full px-4 py-2 rounded-lg resize-none"
                            placeholder="Description commerciale synthétique..." />
                    </div>

                    <div className="flex items-center gap-3 bg-white/5 p-4 rounded-xl border border-white/10">
                        <input type="checkbox" id="isActive" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                            className="w-5 h-5 text-gold-500 bg-navy-900 border-white/20 rounded focus:ring-gold-500" />
                        <label htmlFor="isActive" className="text-sm font-medium text-white">Publié en ligne</label>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-navy-900/95 backdrop-blur-xl border-t border-white/10 flex justify-end gap-3 z-20">
                        <button type="button" onClick={closeModal} className="px-6 py-2.5 text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-medium transition-colors">
                            Annuler
                        </button>
                        <button type="submit" form="projectForm" disabled={isPending} className="px-6 py-2.5 bg-gradient-to-r from-gold-500 to-gold-400 text-navy-950 rounded-xl font-bold hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] disabled:opacity-50 transition-all">
                            {isPending ? 'Enregistrement...' : editingItem ? 'Sauvegarder les modifications' : 'Ajouter le produit'}
                        </button>
                    </div>
                </form>
            </Modal>

            <ConfirmDialog isOpen={!!deleteItem} onClose={() => setDeleteItem(null)} onConfirm={() => deleteItem && deleteMutation.mutate(deleteItem.id)}
                title="Supprimer cette réalisation ?" message={`"${deleteItem?.name}" sera définitivement supprimé.`} confirmText="Supprimer" isLoading={deleteMutation.isPending} />
        </div>
    );
}
