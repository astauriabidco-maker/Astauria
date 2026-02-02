import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, FileText, Calendar, Eye, EyeOff, ExternalLink } from 'lucide-react';
import api from '../services/api';
import { useState } from 'react';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { toast } from '../components/Toast';
import RichTextEditor from '../components/RichTextEditor';

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
        setIsModalOpen(true);
    };

    const openEditModal = (item: Article) => {
        setEditingItem(item);
        setFormData({
            title: item.title,
            slug: item.slug,
            excerpt: item.excerpt || '',
            content: item.content || '',
            author: item.author || 'Équipe Astauria',
            category: item.category || 'IA & Machine Learning',
            tags: item.tags || [],
            imageUrl: item.imageUrl || '',
            readTime: item.readTime || 5,
            isPublished: item.isPublished,
        });
        setTagsInput((item.tags || []).join(', '));
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

    const isPending = createMutation.isPending || updateMutation.isPending;

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Articles</h1>
                    <p className="text-gray-500">Blog et publications</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 px-4 py-2 bg-gold-500 text-white rounded-lg hover:bg-gold-600 transition-colors font-medium"
                >
                    <Plus size={18} />
                    <span>Nouvel article</span>
                </button>
            </div>

            {isLoading ? (
                <div className="text-center py-12 text-gray-500">Chargement...</div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Article</th>
                                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Catégorie</th>
                                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {(articles || []).map((item: Article) => (
                                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {item.imageUrl ? (
                                                <img src={item.imageUrl} alt="" className="w-12 h-12 rounded-lg object-cover" />
                                            ) : (
                                                <div className="w-12 h-12 rounded-lg bg-navy-100 flex items-center justify-center">
                                                    <FileText className="text-navy-400" size={20} />
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-medium text-gray-900">{item.title}</p>
                                                <p className="text-xs text-gray-500">Par {typeof item.author === 'object' ? item.author?.name : item.author} • {item.readTime || 5} min</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs font-medium bg-navy-100 text-navy-700 px-2 py-1 rounded">{typeof item.category === 'object' ? item.category?.name : item.category}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {item.isPublished ? (
                                            <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded">
                                                <Eye size={12} /> Publié
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                                <EyeOff size={12} /> Brouillon
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <Calendar size={14} />
                                            {formatDate(item.createdAt)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-end gap-1">
                                            <button onClick={() => openEditModal(item)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                                <Edit2 size={16} />
                                            </button>
                                            <button onClick={() => setDeleteItem(item)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
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

            {/* Create/Edit Modal */}
            <Modal isOpen={isModalOpen} onClose={closeModal} title={editingItem ? 'Modifier l\'article' : 'Nouvel article'} size="xl">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
                        <input type="text" value={formData.title} onChange={(e) => handleTitleChange(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                            placeholder="Le titre de votre article" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL)</label>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-400">/blog/</span>
                                <input type="text" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent font-mono text-sm" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                            <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent">
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Extrait / Résumé *</label>
                        <textarea value={formData.excerpt} onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })} rows={2}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent resize-none"
                            placeholder="Bref résumé de l'article (affiché dans les listes)..." />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contenu</label>
                        <RichTextEditor
                            content={formData.content}
                            onChange={(content) => setFormData({ ...formData, content })}
                            placeholder="Rédigez votre article..."
                        />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Auteur</label>
                            <input type="text" value={formData.author} onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Temps de lecture (min)</label>
                            <input type="number" min="1" max="60" value={formData.readTime} onChange={(e) => setFormData({ ...formData, readTime: parseInt(e.target.value) || 5 })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Image (URL)</label>
                            <input type="url" value={formData.imageUrl} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                                placeholder="https://..." />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tags (séparés par des virgules)</label>
                        <input type="text" value={tagsInput} onChange={(e) => handleTagsChange(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                            placeholder="IA, Automatisation, PME" />
                    </div>
                    <div className="flex items-center gap-2">
                        <input type="checkbox" id="isPublished" checked={formData.isPublished} onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                            className="w-4 h-4 text-gold-500 border-gray-300 rounded focus:ring-gold-500" />
                        <label htmlFor="isPublished" className="text-sm text-gray-700">Publier maintenant</label>
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
                title="Supprimer cet article ?" message={`"${deleteItem?.title}" sera définitivement supprimé.`} confirmText="Supprimer" isLoading={deleteMutation.isPending} />
        </div>
    );
}
