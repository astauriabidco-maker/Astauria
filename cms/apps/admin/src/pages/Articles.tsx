import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, FileText, Calendar, Eye, EyeOff, Sparkles, Loader2 } from 'lucide-react';
import api from '../services/api';
import { useState } from 'react';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { toast } from '../components/Toast';
import RichTextEditor from '../components/RichTextEditor';
import SeoScore from '../components/SeoScore';
import AiArticleGenerator from '../components/AiArticleGenerator';
import AiSeoSuggestions from '../components/AiSeoSuggestions';

interface Article {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    author: string | { name: string; avatar?: string };
    category: string | { id?: string; name: string };
    tags: string[];
    imageUrl?: string;
    readTime?: number;
    publishedAt?: string;
    isPublished: boolean;
    createdAt: string;
}

const CATEGORIES = [
    'IA & Machine Learning', 'Automatisation', 'Transformation Digitale', 'Stratégie', 'Cas Pratique', 'Actualités', 'Guide'
];

export default function Articles() {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Article | null>(null);
    const [deleteItem, setDeleteItem] = useState<Article | null>(null);
    const [tagsInput, setTagsInput] = useState('');
    const [targetKeyword, setTargetKeyword] = useState('');
    const [isAiGeneratorOpen, setIsAiGeneratorOpen] = useState(false);
    const [isGeneratingExcerpt, setIsGeneratingExcerpt] = useState(false);
    const [isGeneratingTags, setIsGeneratingTags] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        author: 'Équipe Astauria',
        category: 'IA & Machine Learning',
        tags: [] as string[],
        imageUrl: '',
        readTime: 5,
        isPublished: false,
    });

    const { data: articles, isLoading } = useQuery({
        queryKey: ['articles'],
        queryFn: async () => (await api.get('/blog/articles')).data,
    });

    const createMutation = useMutation({
        mutationFn: async (data: typeof formData) => (await api.post('/blog/articles', data)).data,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['articles'] });
            toast.success('Article créé avec succès');
            closeModal();
        },
        onError: () => toast.error('Erreur lors de la création'),
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: typeof formData }) =>
            (await api.patch(`/blog/articles/${id}`, data)).data,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['articles'] });
            toast.success('Article mis à jour');
            closeModal();
        },
        onError: () => toast.error('Erreur lors de la mise à jour'),
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => (await api.delete(`/blog/articles/${id}`)).data,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['articles'] });
            toast.success('Article supprimé');
            setDeleteItem(null);
        },
        onError: () => toast.error('Erreur lors de la suppression'),
    });

    const generateSlug = (title: string) => {
        return title.toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    };

    const openCreateModal = () => {
        setEditingItem(null);
        setFormData({
            title: '', slug: '', excerpt: '', content: '', author: 'Équipe Astauria',
            category: 'IA & Machine Learning', tags: [], imageUrl: '', readTime: 5, isPublished: false,
        });
        setTagsInput('');
        setTargetKeyword('');
        setIsModalOpen(true);
    };

    const openEditModal = (item: Article) => {
        setEditingItem(item);
        setFormData({
            title: item.title,
            slug: item.slug,
            excerpt: item.excerpt || '',
            content: item.content || '',
            author: typeof item.author === 'object' && item.author ? item.author.name : (item.author as string || 'Équipe Astauria'),
            category: typeof item.category === 'object' && item.category ? item.category.name : (item.category as string || 'IA & Machine Learning'),
            tags: item.tags || [],
            imageUrl: item.imageUrl || '',
            readTime: item.readTime || 5,
            isPublished: item.isPublished,
        });
        setTagsInput((item.tags || []).join(', '));
        setTargetKeyword(''); // Reset SEO target on open
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
    };

    const handleTitleChange = (title: string) => {
        setFormData({
            ...formData,
            title,
            slug: editingItem ? formData.slug : generateSlug(title),
        });
    };

    const handleTagsChange = (value: string) => {
        setTagsInput(value);
        const tags = value.split(',').map(t => t.trim()).filter(Boolean);
        setFormData({ ...formData, tags });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title.trim() || !formData.excerpt.trim()) {
            toast.warning('Veuillez remplir les champs obligatoires');
            return;
        }
        if (editingItem) {
            updateMutation.mutate({ id: editingItem.id, data: formData });
        } else {
            createMutation.mutate(formData);
        }
    };

    const handleGenerateExcerpt = async () => {
        if (!formData.content || formData.content.length < 50) {
            toast.warning('Rédigez d\'abord un peu de contenu pour générer un résumé.');
            return;
        }
        setIsGeneratingExcerpt(true);
        try {
            const { data } = await api.post('/ai/generate', { action: 'generate_excerpt', text: formData.content.substring(0, 2000), keyword: targetKeyword });
            setFormData(prev => ({ ...prev, excerpt: data.content }));
            toast.success('Résumé généré avec succès !');
        } catch {
            toast.error('Erreur lors de la génération du résumé.');
        } finally {
            setIsGeneratingExcerpt(false);
        }
    };

    const handleSuggestTags = async () => {
        if (!formData.content || formData.content.length < 50) {
            toast.warning('Rédigez d\'abord un peu de contenu pour suggérer des tags.');
            return;
        }
        setIsGeneratingTags(true);
        try {
            const { data } = await api.post('/ai/generate', { action: 'suggest_tags', text: formData.content.substring(0, 2000), keyword: targetKeyword });
            let tags: string[] = [];
            try {
                const match = data.content.match(/\[[\s\S]*\]/);
                if (match) tags = JSON.parse(match[0]);
            } catch {
                tags = [targetKeyword || 'IA'];
            }
            setFormData(prev => ({ ...prev, tags }));
            setTagsInput(tags.join(', '));
            toast.success('Tags suggérés avec succès !');
        } catch {
            toast.error('Erreur lors de la suggestion des tags.');
        } finally {
            setIsGeneratingTags(false);
        }
    };

    const isPending = createMutation.isPending || updateMutation.isPending;

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white text-glow">Articles</h1>
                    <p className="text-gold-400/80">Blog et publications</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsAiGeneratorOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-gold-400 rounded-lg hover:bg-gold-500/10 hover:border-gold-500/20 transition-all font-bold group"
                    >
                        <Sparkles size={18} className="group-hover:animate-pulse" />
                        <span className="hidden sm:inline text-glow">Générer avec l'IA</span>
                    </button>
                    <button
                        onClick={openCreateModal}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gold-500 to-gold-400 text-navy-950 rounded-lg hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] transition-all font-bold"
                    >
                        <Plus size={18} />
                        <span className="hidden sm:inline">Nouvel article</span>
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="text-center py-12 text-gold-400">Chargement...</div>
            ) : (
                <div className="glass-panel rounded-xl overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-white/5 border-b border-white/10">
                            <tr>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-gold-400 uppercase tracking-wider">Article</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-gold-400 uppercase tracking-wider">Catégorie</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-gold-400 uppercase tracking-wider">Statut</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-gold-400 uppercase tracking-wider">Date</th>
                                <th className="text-right px-6 py-3 text-xs font-semibold text-gold-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {(articles || []).map((item: Article) => (
                                <tr key={item.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {item.imageUrl ? (
                                                <img src={item.imageUrl} alt="" className="w-12 h-12 rounded-lg object-cover border border-white/10" />
                                            ) : (
                                                <div className="w-12 h-12 rounded-lg bg-navy-800 border border-white/10 flex items-center justify-center">
                                                    <FileText className="text-gold-400" size={20} />
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-medium text-white">{item.title}</p>
                                                <p className="text-xs text-gray-400">Par {typeof item.author === 'object' ? item.author?.name : item.author} • {item.readTime || 5} min</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs font-medium bg-gold-500/10 text-gold-400 border border-gold-500/20 px-2 py-1 rounded">{typeof item.category === 'object' ? item.category?.name : item.category}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {item.isPublished ? (
                                            <span className="inline-flex items-center gap-1 text-xs font-medium text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-1 rounded">
                                                <Eye size={12} /> Publié
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-400 bg-white/5 border border-white/10 px-2 py-1 rounded">
                                                <EyeOff size={12} /> Brouillon
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-400">
                                        <div className="flex items-center gap-1">
                                            <Calendar size={14} />
                                            {formatDate(item.createdAt)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-end gap-1">
                                            <button onClick={() => openEditModal(item)} className="p-2 text-gray-400 hover:text-gold-400 hover:bg-gold-500/10 rounded-lg transition-colors">
                                                <Edit2 size={16} />
                                            </button>
                                            <button onClick={() => setDeleteItem(item)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {(!articles || articles.length === 0) && (
                        <div className="text-center py-12 text-gray-400">
                            Aucun article. Cliquez sur "Nouvel article" pour commencer.
                        </div>
                    )}
                </div>
            )}

            {/* Create/Edit Modal with Split-Screen */}
            <Modal isOpen={isModalOpen} onClose={closeModal} title={editingItem ? 'Modifier l\'article' : 'Nouvel article'} size="full">
                <div className="flex flex-col lg:flex-row h-full gap-8 overflow-hidden">
                    {/* Left Pane: Form */}
                    <div className="w-full lg:w-1/2 h-full overflow-y-auto pr-2 custom-scrollbar">
                        <form id="articleForm" onSubmit={handleSubmit} className="space-y-6 pb-20">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Titre *</label>
                                <input type="text" value={formData.title} onChange={(e) => handleTitleChange(e.target.value)}
                                    className="glass-input w-full px-4 py-3 rounded-xl"
                                    placeholder="Le titre de votre article" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Slug (URL)</label>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gold-500">/blog/</span>
                                        <input type="text" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                            className="glass-input flex-1 px-3 py-2 rounded-lg font-mono text-sm" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Catégorie</label>
                                    <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="glass-input w-full px-4 py-2 rounded-lg">
                                        {CATEGORIES.map(c => <option key={c} value={c} className="bg-navy-900">{c}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-medium text-gray-300">Extrait / Résumé *</label>
                                    <button
                                        type="button"
                                        onClick={handleGenerateExcerpt}
                                        disabled={isGeneratingExcerpt}
                                        className="flex items-center gap-1.5 text-xs font-semibold text-gold-400 hover:text-gold-300 disabled:opacity-50 transition-colors group"
                                    >
                                        {isGeneratingExcerpt ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} className="group-hover:animate-pulse" />}
                                        <span className="text-glow">Générer avec l'IA</span>
                                    </button>
                                </div>
                                <textarea value={formData.excerpt} onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })} rows={2}
                                    className="glass-input w-full px-4 py-3 rounded-xl resize-none"
                                    placeholder="Bref résumé de l'article (affiché dans les listes)..." />
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Mot-clé cible (SEO)</label>
                                    <input type="text" value={targetKeyword} onChange={(e) => setTargetKeyword(e.target.value)}
                                        className="glass-input w-full px-4 py-2 rounded-lg"
                                        placeholder="Ex: automatisation marketing" />
                                </div>
                                
                                <SeoScore content={formData.content} targetKeyword={targetKeyword} excerpt={formData.excerpt} />
                                
                                <AiSeoSuggestions 
                                    content={formData.content} 
                                    keyword={targetKeyword} 
                                    onApplySuggestion={(suggestion) => {
                                        setFormData(prev => ({ ...prev, content: prev.content + '\n' + suggestion }));
                                    }} 
                                />
                                
                                <div className="mt-6">
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Contenu</label>
                                    <div className="h-[500px]">
                                        <RichTextEditor
                                            content={formData.content}
                                            onChange={(content) => setFormData({ ...formData, content })}
                                            placeholder="Rédigez votre article..."
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Auteur</label>
                                    <input type="text" value={formData.author} onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                                        className="glass-input w-full px-4 py-2 rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Temps de lecture (min)</label>
                                    <input type="number" min="1" max="60" value={formData.readTime} onChange={(e) => setFormData({ ...formData, readTime: parseInt(e.target.value) || 5 })}
                                        className="glass-input w-full px-4 py-2 rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Image (URL)</label>
                                    <input type="url" value={formData.imageUrl} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                                        className="glass-input w-full px-4 py-2 rounded-lg"
                                        placeholder="https://..." />
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-medium text-gray-300">Tags (séparés par des virgules)</label>
                                    <button
                                        type="button"
                                        onClick={handleSuggestTags}
                                        disabled={isGeneratingTags}
                                        className="flex items-center gap-1.5 text-xs font-semibold text-gold-400 hover:text-gold-300 disabled:opacity-50 transition-colors group"
                                    >
                                        {isGeneratingTags ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} className="group-hover:animate-pulse" />}
                                        <span className="text-glow">Suggérer des tags</span>
                                    </button>
                                </div>
                                <input type="text" value={tagsInput} onChange={(e) => handleTagsChange(e.target.value)}
                                    className="glass-input w-full px-4 py-3 rounded-xl"
                                    placeholder="IA, Automatisation, PME" />
                            </div>
                            
                            <div className="flex items-center gap-3 bg-white/5 p-4 rounded-xl border border-white/10">
                                <input type="checkbox" id="isPublished" checked={formData.isPublished} onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                                    className="w-5 h-5 text-gold-500 bg-navy-900 border-white/20 rounded focus:ring-gold-500" />
                                <label htmlFor="isPublished" className="text-sm font-medium text-white">Publier cet article maintenant</label>
                            </div>
                        </form>
                    </div>

                    {/* Right Pane: Live Preview */}
                    <div className="hidden lg:block w-1/2 h-full bg-navy-950/80 rounded-2xl border border-white/10 overflow-y-auto relative custom-scrollbar">
                        <div className="sticky top-0 w-full bg-navy-900/80 backdrop-blur-md border-b border-white/10 px-6 py-3 z-10 flex items-center justify-between">
                            <span className="text-sm font-medium text-gold-400 flex items-center gap-2">
                                <Eye size={16} /> Live Preview public
                            </span>
                            <span className="text-xs bg-white/10 text-gray-300 px-2 py-1 rounded-full">astauria.com/blog/{formData.slug || 'slug'}</span>
                        </div>
                        
                        {/* Simulation of Frontend Render */}
                        <div className="p-8 max-w-3xl mx-auto">
                            {formData.category && (
                                <span className="text-sm font-semibold tracking-wider text-gold-500 uppercase">{formData.category}</span>
                            )}
                            <h1 className="text-4xl md:text-5xl font-bold text-white mt-4 mb-6 leading-tight">
                                {formData.title || 'Titre de votre article...'}
                            </h1>
                            <div className="flex items-center gap-4 text-gray-400 mb-8 border-b border-white/10 pb-8">
                                <span>{formData.author}</span>
                                <span>•</span>
                                <span>{formData.readTime} min de lecture</span>
                            </div>

                            {formData.excerpt && (
                                <p className="text-xl text-gray-300 mb-8 font-light leading-relaxed">
                                    {formData.excerpt}
                                </p>
                            )}

                            {formData.imageUrl && (
                                <img src={formData.imageUrl} className="w-full aspect-video object-cover rounded-2xl mb-10 shadow-2xl" alt="Preview hero" />
                            )}

                            <div className="prose prose-invert prose-lg prose-gold max-w-none prose-headings:text-white prose-a:text-gold-400 prose-img:rounded-xl" dangerouslySetInnerHTML={{ __html: formData.content || '<p class="text-gray-500 italic">Commencez à rédiger pour voir l\'aperçu...</p>' }} />
                            
                            {formData.tags?.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-12 pt-8 border-t border-white/10">
                                    {formData.tags.map(tag => (
                                        <span key={tag} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-sm text-gray-300">
                                            #{tag}
                                        </span>
                                    ))}
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
                    <button type="submit" form="articleForm" disabled={isPending} className="px-6 py-2.5 bg-gradient-to-r from-gold-500 to-gold-400 text-navy-950 rounded-xl font-bold hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] disabled:opacity-50 transition-all">
                        {isPending ? 'Enregistrement...' : editingItem ? 'Sauvegarder les modifications' : 'Créer l\'article'}
                    </button>
                </div>
            </Modal>

            <ConfirmDialog isOpen={!!deleteItem} onClose={() => setDeleteItem(null)} onConfirm={() => deleteItem && deleteMutation.mutate(deleteItem.id)}
                title="Supprimer cet article ?" message={`"${deleteItem?.title}" sera définitivement supprimé.`} confirmText="Supprimer" isLoading={deleteMutation.isPending} />

            {/* AI Generator Modal */}
            <AiArticleGenerator
                isOpen={isAiGeneratorOpen}
                onClose={() => setIsAiGeneratorOpen(false)}
                onGenerated={(data) => {
                    setFormData({
                        ...formData,
                        title: data.title,
                        slug: data.slug,
                        excerpt: data.excerpt,
                        content: data.content,
                        tags: data.tags,
                        category: data.category
                    });
                    setTagsInput((data.tags || []).join(', '));
                    setIsModalOpen(true);
                }}
            />
        </div>
    );
}
