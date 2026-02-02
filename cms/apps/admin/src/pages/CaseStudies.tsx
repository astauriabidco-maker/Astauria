import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, BarChart3, Building2, ArrowUpRight } from 'lucide-react';
import api from '../services/api';
import { useState } from 'react';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { toast } from '../components/Toast';

interface CaseStudy {
    id: string;
    title: string;
    slug?: string;
    sector: string; // API uses 'sector' not 'industry'
    sectorIcon?: string;
    timeline?: string;
    challenge: string;
    solution: string;
    metrics: string | { label: string; value: string; isHighlight?: boolean }[]; // Can be JSON string or array
    fullContent?: string;
    coverImage?: string;
    order: number;
    isActive: boolean;
}

// Helper to safely parse metrics
const parseMetrics = (metrics: string | { label: string; value: string }[] | null): { label: string; value: string }[] => {
    if (!metrics) return [];
    if (Array.isArray(metrics)) return metrics;
    try {
        return JSON.parse(metrics);
    } catch {
        return [];
    }
};

const INDUSTRIES = [
    'Finance', 'Santé', 'Industrie', 'Retail', 'Technologie', 'Services', 'Agroalimentaire', 'Énergie', 'Transport', 'Autre'
];

export default function CaseStudies() {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<CaseStudy | null>(null);
    const [deleteItem, setDeleteItem] = useState<CaseStudy | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        sector: 'Technologie',
        sectorIcon: '',
        timeline: '',
        challenge: '',
        solution: '',
        metrics: [{ label: '', value: '' }],
        coverImage: '',
        isActive: true,
    });

    const { data: caseStudies, isLoading } = useQuery({
        queryKey: ['case-studies'],
        queryFn: async () => (await api.get('/case-studies')).data,
    });

    const createMutation = useMutation({
        mutationFn: async (data: typeof formData) => (await api.post('/case-studies', data)).data,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['case-studies'] });
            toast.success('Cas d\'étude créé avec succès');
            closeModal();
        },
        onError: () => toast.error('Erreur lors de la création'),
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: typeof formData }) =>
            (await api.patch(`/case-studies/${id}`, data)).data,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['case-studies'] });
            toast.success('Cas d\'étude mis à jour');
            closeModal();
        },
        onError: () => toast.error('Erreur lors de la mise à jour'),
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => (await api.delete(`/case-studies/${id}`)).data,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['case-studies'] });
            toast.success('Cas d\'étude supprimé');
            setDeleteItem(null);
        },
        onError: () => toast.error('Erreur lors de la suppression'),
    });

    const openCreateModal = () => {
        setEditingItem(null);
        setFormData({
            title: '', sector: 'Technologie', sectorIcon: '', timeline: '', challenge: '', solution: '',
            metrics: [{ label: '', value: '' }], coverImage: '', isActive: true,
        });
        setIsModalOpen(true);
    };

    const openEditModal = (item: CaseStudy) => {
        setEditingItem(item);
        setFormData({
            title: item.title,
            sector: item.sector || 'Technologie',
            sectorIcon: item.sectorIcon || '',
            timeline: item.timeline || '',
            challenge: item.challenge || '',
            solution: item.solution || '',
            metrics: parseMetrics(item.metrics).length ? parseMetrics(item.metrics) : [{ label: '', value: '' }],
            coverImage: item.coverImage || '',
            isActive: item.isActive,
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
    };

    const addMetric = () => {
        setFormData({ ...formData, metrics: [...formData.metrics, { label: '', value: '' }] });
    };

    const updateMetric = (index: number, field: 'label' | 'value', value: string) => {
        const newMetrics = [...formData.metrics];
        newMetrics[index][field] = value;
        setFormData({ ...formData, metrics: newMetrics });
    };

    const removeMetric = (index: number) => {
        if (formData.metrics.length > 1) {
            setFormData({ ...formData, metrics: formData.metrics.filter((_, i) => i !== index) });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title.trim() || !formData.challenge.trim()) {
            toast.warning('Veuillez remplir les champs obligatoires');
            return;
        }
        const cleanMetrics = formData.metrics.filter(m => m.label.trim() && m.value.trim());
        const dataToSubmit = { ...formData, metrics: cleanMetrics };
        if (editingItem) {
            updateMutation.mutate({ id: editingItem.id, data: dataToSubmit });
        } else {
            createMutation.mutate(dataToSubmit);
        }
    };

    const isPending = createMutation.isPending || updateMutation.isPending;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Cas d'étude</h1>
                    <p className="text-gray-500">Projets clients et résultats</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 px-4 py-2 bg-gold-500 text-white rounded-lg hover:bg-gold-600 transition-colors font-medium"
                >
                    <Plus size={18} />
                    <span>Ajouter un cas</span>
                </button>
            </div>

            {isLoading ? (
                <div className="text-center py-12 text-gray-500">Chargement...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(caseStudies || []).map((item: CaseStudy) => (
                        <div
                            key={item.id}
                            className={`bg-white rounded-xl shadow-sm border p-5 ${item.isActive ? 'border-gray-100' : 'border-gray-200 opacity-60'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <span className="text-xs font-medium bg-navy-100 text-navy-700 px-2 py-1 rounded">{item.sector}</span>
                                <div className="flex gap-1">
                                    <button onClick={() => openEditModal(item)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors">
                                        <Edit2 size={14} />
                                    </button>
                                    <button onClick={() => setDeleteItem(item)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                            {item.timeline && (
                                <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                                    <Building2 size={14} />
                                    <span>{item.timeline}</span>
                                </div>
                            )}
                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.challenge}</p>
                            {(() => {
                                const metrics = parseMetrics(item.metrics);
                                return metrics.length > 0 && (
                                    <div className="flex gap-3 pt-3 border-t border-gray-50">
                                        {metrics.slice(0, 3).map((m, i) => (
                                            <div key={i} className="text-center">
                                                <p className="text-lg font-bold text-gold-600">{m.value}</p>
                                                <p className="text-xs text-gray-500">{m.label}</p>
                                            </div>
                                        ))}
                                    </div>
                                );
                            })()}
                            {!item.isActive && (
                                <span className="inline-block mt-3 text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">Inactif</span>
                            )}
                        </div>
                    ))}
                    {(!caseStudies || caseStudies.length === 0) && (
                        <div className="col-span-full text-center py-12 text-gray-400">
                            Aucun cas d'étude. Cliquez sur "Ajouter un cas" pour commencer.
                        </div>
                    )}
                </div>
            )}

            {/* Create/Edit Modal */}
            <Modal isOpen={isModalOpen} onClose={closeModal} title={editingItem ? 'Modifier le cas d\'étude' : 'Nouveau cas d\'étude'} size="xl">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
                            <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                                placeholder="Automatisation des processus RH" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Timeline</label>
                            <input type="text" value={formData.timeline} onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                                placeholder="8 semaines" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Secteur</label>
                            <select value={formData.sector} onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent">
                                {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Image (URL)</label>
                            <input type="url" value={formData.coverImage} onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                                placeholder="https://..." />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Défi *</label>
                        <textarea value={formData.challenge} onChange={(e) => setFormData({ ...formData, challenge: e.target.value })} rows={2}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent resize-none"
                            placeholder="Le problème initial..." />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Solution</label>
                        <textarea value={formData.solution} onChange={(e) => setFormData({ ...formData, solution: e.target.value })} rows={2}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent resize-none"
                            placeholder="L'approche adoptée..." />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Métriques clés</label>
                        <div className="space-y-2">
                            {formData.metrics.map((m, i) => (
                                <div key={i} className="flex gap-2">
                                    <input type="text" value={m.label} onChange={(e) => updateMetric(i, 'label', e.target.value)}
                                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Label (ex: Gain de temps)" />
                                    <input type="text" value={m.value} onChange={(e) => updateMetric(i, 'value', e.target.value)}
                                        className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Valeur" />
                                    <button type="button" onClick={() => removeMetric(i)} className="p-2 text-gray-400 hover:text-red-500">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                            <button type="button" onClick={addMetric} className="text-sm text-gold-600 hover:text-gold-700 font-medium">+ Ajouter une métrique</button>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <input type="checkbox" id="isActive" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                            className="w-4 h-4 text-gold-500 border-gray-300 rounded focus:ring-gold-500" />
                        <label htmlFor="isActive" className="text-sm text-gray-700">Actif</label>
                    </div>
                    <div className="flex gap-3 justify-end pt-4 border-t">
                        <button type="button" onClick={closeModal} className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium">Annuler</button>
                        <button type="submit" disabled={isPending} className="px-4 py-2 bg-navy-900 text-white rounded-lg font-medium hover:bg-navy-800 disabled:opacity-50">
                            {isPending ? 'Enregistrement...' : editingItem ? 'Mettre à jour' : 'Créer'}
                        </button>
                    </div>
                </form>
            </Modal>

            <ConfirmDialog isOpen={!!deleteItem} onClose={() => setDeleteItem(null)} onConfirm={() => deleteItem && deleteMutation.mutate(deleteItem.id)}
                title="Supprimer ce cas d'étude ?" message={`"${deleteItem?.title}" sera définitivement supprimé.`} confirmText="Supprimer" isLoading={deleteMutation.isPending} />
        </div>
    );
}
