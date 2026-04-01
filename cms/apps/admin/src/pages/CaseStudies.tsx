import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, BarChart3, Building2, ArrowUpRight, Sparkles, Loader2 } from 'lucide-react';
import api from '../services/api';
import { useState } from 'react';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { toast } from '../components/Toast';
import RichTextEditor from '../components/RichTextEditor';
import SeoScore from '../components/SeoScore';
import AiSeoSuggestions from '../components/AiSeoSuggestions';

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
    const [targetKeyword, setTargetKeyword] = useState('');
    const [isGeneratingSolution, setIsGeneratingSolution] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        sector: 'Technologie',
        sectorIcon: '',
        timeline: '',
        challenge: '',
        solution: '',
        fullContent: '',
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
            title: '', sector: 'Technologie', sectorIcon: '', timeline: '', challenge: '', solution: '', fullContent: '',
            metrics: [{ label: '', value: '' }], coverImage: '', isActive: true,
        });
        setTargetKeyword('');
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
            fullContent: item.fullContent || '',
            metrics: parseMetrics(item.metrics).length ? parseMetrics(item.metrics) : [{ label: '', value: '' }],
            coverImage: item.coverImage || '',
            isActive: item.isActive,
        });
        setTargetKeyword('');
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

    const handleGenerateSolution = async () => {
        if (!formData.challenge || formData.challenge.length < 20) {
            toast.warning('Décrivez d\'abord le "Défi" en quelques mots pour générer la solution.');
            return;
        }
        setIsGeneratingSolution(true);
        try {
            const { data } = await api.post('/ai/generate', { 
                action: 'generate', 
                text: `Rédige la "Solution apportée" pour cette étude de cas. Voici le Défi initial : ${formData.challenge}` 
            });
            // Extract content without outer paragraph tags if possible, or just use plain text response.
            const cleanHtml = data.content.replace(/<[^>]*>?/gm, '');
            setFormData(prev => ({ ...prev, solution: cleanHtml }));
            toast.success('Solution générée avec succès !');
        } catch {
            toast.error('Erreur lors de la génération.');
        } finally {
            setIsGeneratingSolution(false);
        }
    };

    const isPending = createMutation.isPending || updateMutation.isPending;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white text-glow">Cas d'étude</h1>
                    <p className="text-gold-400/80">Projets clients et résultats</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gold-500 to-gold-400 text-navy-950 rounded-lg hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] transition-all font-bold"
                >
                    <Plus size={18} />
                    <span>Ajouter un cas</span>
                </button>
            </div>

            {isLoading ? (
                <div className="text-center py-12 text-gold-400">Chargement...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(caseStudies || []).map((item: CaseStudy) => (
                        <div
                            key={item.id}
                            className={`glass-panel rounded-xl p-5 hover:bg-white/5 transition-colors ${item.isActive ? '' : 'opacity-60'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <span className="text-xs font-medium bg-gold-500/10 text-gold-400 border border-gold-500/20 px-2 py-1 rounded">{item.sector}</span>
                                <div className="flex gap-1">
                                    <button onClick={() => openEditModal(item)} className="p-1.5 text-gray-400 hover:text-gold-400 hover:bg-white/10 rounded transition-colors">
                                        <Edit2 size={14} />
                                    </button>
                                    <button onClick={() => setDeleteItem(item)} className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-white/10 rounded transition-colors">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                            <h3 className="font-semibold text-white mb-1">{item.title}</h3>
                            {item.timeline && (
                                <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
                                    <Building2 size={14} />
                                    <span>{item.timeline}</span>
                                </div>
                            )}
                            <p className="text-gray-300 text-sm mb-3 line-clamp-2">{item.challenge}</p>
                            {(() => {
                                const metrics = parseMetrics(item.metrics);
                                return metrics.length > 0 && (
                                    <div className="flex gap-3 pt-3 border-t border-white/10 mt-4">
                                        {metrics.slice(0, 3).map((m, i) => (
                                            <div key={i} className="text-center bg-navy-950/50 rounded-lg p-2 flex-1 border border-white/5">
                                                <p className="text-lg font-bold text-gold-400">{m.value}</p>
                                                <p className="text-[10px] text-gray-400 leading-tight mt-1 truncate">{m.label}</p>
                                            </div>
                                        ))}
                                    </div>
                                );
                            })()}
                            {!item.isActive && (
                                <span className="inline-block mt-3 text-xs bg-white/5 border border-white/10 text-gray-400 px-2 py-1 rounded">Inactif</span>
                            )}
                        </div>
                    ))}
                    {(!caseStudies || caseStudies.length === 0) && (
                        <div className="col-span-full text-center py-12 text-gray-500">
                            Aucun cas d'étude. Cliquez sur "Ajouter un cas" pour commencer.
                        </div>
                    )}
                </div>
            )}

            {/* Create/Edit Modal with Split-Screen */}
            <Modal isOpen={isModalOpen} onClose={closeModal} title={editingItem ? 'Modifier le cas d\'étude' : 'Nouveau cas d\'étude'} size="full">
                <div className="flex flex-col lg:flex-row h-full gap-8 overflow-hidden">
                    {/* Left Pane: Form */}
                    <div className="w-full lg:w-1/2 h-full overflow-y-auto pr-2 custom-scrollbar">
                        <form id="caseForm" onSubmit={handleSubmit} className="space-y-6 pb-20">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Titre *</label>
                                    <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="glass-input w-full px-4 py-2 rounded-lg"
                                        placeholder="Transformation d'Astauria" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Timeline</label>
                                    <input type="text" value={formData.timeline} onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                                        className="glass-input w-full px-4 py-2 rounded-lg"
                                        placeholder="ex: 8 semaines" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Secteur</label>
                                    <select value={formData.sector} onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                                        className="glass-input w-full px-4 py-2 rounded-lg">
                                        {INDUSTRIES.map(i => <option key={i} value={i} className="bg-navy-900">{i}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Image (URL)</label>
                                    <input type="url" value={formData.coverImage} onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                                        className="glass-input w-full px-4 py-2 rounded-lg"
                                        placeholder="https://..." />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Le Défi (Challenge) *</label>
                                    <textarea value={formData.challenge} onChange={(e) => setFormData({ ...formData, challenge: e.target.value })} rows={2}
                                        className="glass-input w-full px-4 py-2 rounded-lg resize-none"
                                        placeholder="Quel était le problème de départ..." />
                                </div>
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="block text-sm font-medium text-gray-300">La Solution apportée</label>
                                        <button
                                            type="button"
                                            onClick={handleGenerateSolution}
                                            disabled={isGeneratingSolution}
                                            className="flex items-center gap-1.5 text-xs font-semibold text-gold-400 hover:text-gold-300 disabled:opacity-50 transition-colors"
                                        >
                                            {isGeneratingSolution ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                                            Générer la solution avec l'IA
                                        </button>
                                    </div>
                                    <textarea value={formData.solution} onChange={(e) => setFormData({ ...formData, solution: e.target.value })} rows={2}
                                        className="glass-input w-full px-4 py-2 rounded-lg resize-none"
                                        placeholder="Comment y avez-vous répondu..." />
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Mot-clé cible (SEO)</label>
                                    <input type="text" value={targetKeyword} onChange={(e) => setTargetKeyword(e.target.value)}
                                        className="glass-input w-full px-4 py-2 rounded-lg"
                                        placeholder="Ex: transformation digitale" />
                                </div>
                                <SeoScore content={formData.fullContent || `${formData.challenge} ${formData.solution}`} targetKeyword={targetKeyword} excerpt={formData.challenge} />
                                
                                <AiSeoSuggestions 
                                    content={formData.fullContent || `${formData.challenge} ${formData.solution}`} 
                                    keyword={targetKeyword} 
                                    onApplySuggestion={(suggestion) => {
                                        setFormData(prev => ({ ...prev, fullContent: (prev.fullContent || '') + '\n' + suggestion }));
                                    }} 
                                />
                                
                                <div className="mt-6">
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Contenu détaillé (Article de cas)</label>
                                    <div className="h-[400px]">
                                        <RichTextEditor
                                            content={formData.fullContent}
                                            onChange={(content) => setFormData({ ...formData, fullContent: content })}
                                            placeholder="Rédigez le détail des opérations..."
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                <label className="block text-sm font-medium text-white mb-4 flex items-center gap-2">
                                    <BarChart3 className="text-gold-400" size={18}/> Métriques Clés (KPIs)
                                </label>
                                <div className="space-y-3">
                                    {formData.metrics.map((m, i) => (
                                        <div key={i} className="flex gap-2">
                                            <input type="text" value={m.label} onChange={(e) => updateMetric(i, 'label', e.target.value)}
                                                className="glass-input flex-1 px-3 py-2 rounded-lg text-sm" placeholder="Label (ex: Trafic augmenté)" />
                                            <input type="text" value={m.value} onChange={(e) => updateMetric(i, 'value', e.target.value)}
                                                className="glass-input w-32 px-3 py-2 rounded-lg text-sm text-center font-bold text-gold-400" placeholder="Ex: +150%" />
                                            <button type="button" onClick={() => removeMetric(i)} className="p-2 text-gray-500 hover:text-red-400 bg-navy-950/50 rounded-lg">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                    <button type="button" onClick={addMetric} className="text-sm text-gold-400 hover:text-gold-300 font-medium py-2">+ Ajouter un KPI</button>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 bg-white/5 p-4 rounded-xl border border-white/10">
                                <input type="checkbox" id="isActive" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="w-5 h-5 text-gold-500 bg-navy-900 border-white/20 rounded focus:ring-gold-500" />
                                <label htmlFor="isActive" className="text-sm font-medium text-white">Cas d'étude publié</label>
                            </div>
                        </form>
                    </div>

                    {/* Right Pane: Live Preview */}
                    <div className="hidden lg:block w-1/2 h-full bg-navy-950/80 rounded-2xl border border-white/10 overflow-y-auto relative custom-scrollbar">
                        <div className="sticky top-0 w-full bg-navy-900/80 backdrop-blur-md border-b border-white/10 px-6 py-3 z-10 flex items-center justify-between shadow-lg">
                            <span className="text-sm font-medium text-gold-400 flex items-center gap-2">
                                <ArrowUpRight size={16} /> Live Preview public
                            </span>
                        </div>
                        
                        <div className="p-8 max-w-3xl mx-auto">
                            <div className="flex items-center gap-3 mb-6">
                                <span className="bg-gold-500/20 border border-gold-500/30 text-gold-400 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase">
                                    {formData.sector || 'Secteur'}
                                </span>
                                {formData.timeline && (
                                    <span className="text-gray-400 text-sm flex items-center gap-1"><Building2 size={14}/> {formData.timeline}</span>
                                )}
                            </div>
                            
                            <h1 className="text-4xl md:text-5xl font-bold text-white mb-8 leading-tight">
                                {formData.title || 'Votre projet de référence...'}
                            </h1>

                            {formData.coverImage && (
                                <img src={formData.coverImage} className="w-full aspect-video object-cover rounded-2xl mb-12 shadow-2xl border border-white/5" alt="Preview hero" />
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                                {formData.challenge && (
                                    <div className="bg-navy-900/50 p-6 rounded-2xl border border-white/5">
                                        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">Le Défi</h3>
                                        <p className="text-gray-300 font-light leading-relaxed">{formData.challenge}</p>
                                    </div>
                                )}
                                {formData.solution && (
                                    <div className="bg-gold-500/5 p-6 rounded-2xl border border-gold-500/10">
                                        <h3 className="text-lg font-semibold text-gold-400 mb-3 flex items-center gap-2">La Solution</h3>
                                        <p className="text-gray-300 font-light leading-relaxed">{formData.solution}</p>
                                    </div>
                                )}
                            </div>

                            {/* KPIs Visualizer */}
                            {formData.metrics.some(m => m.label && m.value) && (
                                <div className="mb-12">
                                    <h3 className="text-xl font-bold text-white mb-6 text-center">Résultats obtenus</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {formData.metrics.filter(m => m.label && m.value).map((kpi, idx) => (
                                            <div key={idx} className="bg-white/5 p-6 rounded-2xl border border-white/10 text-center flex flex-col items-center justify-center">
                                                <p className="text-4xl font-bold text-gold-400 mb-2">{kpi.value}</p>
                                                <p className="text-sm text-gray-400">{kpi.label}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Full Content */}
                            {formData.fullContent && (
                                <div className="mt-12 pt-12 border-t border-white/10">
                                    <div className="prose prose-invert prose-lg prose-gold max-w-none prose-headings:text-white prose-a:text-gold-400 prose-img:rounded-xl" dangerouslySetInnerHTML={{ __html: formData.fullContent }} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Fixed Footer Actions */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-navy-900/95 backdrop-blur-xl border-t border-white/10 flex justify-end gap-3 z-20">
                    <button type="button" onClick={closeModal} className="px-6 py-2.5 text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-medium transition-colors">
                        Annuler
                    </button>
                    <button type="submit" form="caseForm" disabled={isPending} className="px-6 py-2.5 bg-gradient-to-r from-gold-500 to-gold-400 text-navy-950 rounded-xl font-bold hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] disabled:opacity-50 transition-all">
                        {isPending ? 'Enregistrement...' : editingItem ? 'Sauvegarder les modifications' : 'Créer l\'étude de cas'}
                    </button>
                </div>
            </Modal>

            <ConfirmDialog isOpen={!!deleteItem} onClose={() => setDeleteItem(null)} onConfirm={() => deleteItem && deleteMutation.mutate(deleteItem.id)}
                title="Supprimer ce cas d'étude ?" message={`"${deleteItem?.title}" sera définitivement supprimé.`} confirmText="Supprimer" isLoading={deleteMutation.isPending} />
        </div>
    );
}
