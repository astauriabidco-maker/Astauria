import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Globe, FileText, Search, RefreshCw, Check, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { useState } from 'react';
import Modal from '../components/Modal';
import { toast } from '../components/Toast';

interface SeoData {
    id: string;
    pageId?: string;
    articleId?: string;
    metaTitle: string | null;
    metaDesc: string | null;
    ogImage: string | null;
    canonical: string | null;
    noIndex: boolean;
    page?: { title: string; slug: string };
    article?: { title: string; slug: string };
}

interface PageItem {
    id: string;
    title: string;
    slug: string;
    seo?: SeoData;
}

export default function Seo() {
    const queryClient = useQueryClient();
    const [selectedPage, setSelectedPage] = useState<PageItem | null>(null);
    const [formData, setFormData] = useState({
        metaTitle: '',
        metaDesc: '',
        ogImage: '',
        canonical: '',
        noIndex: false,
    });

    const { data: pages, isLoading } = useQuery({
        queryKey: ['pages-seo'],
        queryFn: async () => (await api.get('/pages?includeSeo=true')).data,
    });

    const { data: articles } = useQuery({
        queryKey: ['articles-seo'],
        queryFn: async () => (await api.get('/blog/articles')).data,
    });

    const updateSeoMutation = useMutation({
        mutationFn: async ({ pageId, data }: { pageId: string; data: typeof formData }) =>
            (await api.patch(`/seo/page/${pageId}`, data)).data,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pages-seo'] });
            toast.success('SEO mis à jour');
            setSelectedPage(null);
        },
        onError: () => toast.error('Erreur lors de la mise à jour'),
    });

    const generateSitemapMutation = useMutation({
        mutationFn: async () => (await api.post('/seo/generate-sitemap')).data,
        onSuccess: () => toast.success('Sitemap généré avec succès'),
        onError: () => toast.error('Erreur lors de la génération'),
    });

    const openEditModal = (page: PageItem) => {
        setSelectedPage(page);
        setFormData({
            metaTitle: page.seo?.metaTitle || page.title,
            metaDesc: page.seo?.metaDesc || '',
            ogImage: page.seo?.ogImage || '',
            canonical: page.seo?.canonical || '',
            noIndex: page.seo?.noIndex || false,
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedPage) {
            updateSeoMutation.mutate({ pageId: selectedPage.id, data: formData });
        }
    };

    const getSeoScore = (page: PageItem) => {
        let score = 0;
        if (page.seo?.metaTitle) score += 30;
        if (page.seo?.metaDesc) score += 30;
        if (page.seo?.ogImage) score += 20;
        if (page.seo?.canonical) score += 10;
        if (!page.seo?.noIndex) score += 10;
        return score;
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600 bg-green-100';
        if (score >= 50) return 'text-amber-600 bg-amber-100';
        return 'text-red-600 bg-red-100';
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">SEO</h1>
                    <p className="text-gray-500">Optimisation pour les moteurs de recherche</p>
                </div>
                <button
                    onClick={() => generateSitemapMutation.mutate()}
                    disabled={generateSitemapMutation.isPending}
                    className="flex items-center gap-2 px-4 py-2 bg-gold-500 text-white rounded-lg hover:bg-gold-600 transition-colors font-medium disabled:opacity-50"
                >
                    <RefreshCw size={18} className={generateSitemapMutation.isPending ? 'animate-spin' : ''} />
                    <span>Générer Sitemap</span>
                </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-navy-100 flex items-center justify-center">
                            <FileText className="text-navy-600" size={20} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{(pages || []).length}</p>
                            <p className="text-sm text-gray-500">Pages</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                            <Check className="text-green-600" size={20} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">
                                {(pages || []).filter((p: PageItem) => getSeoScore(p) >= 80).length}
                            </p>
                            <p className="text-sm text-gray-500">Optimisé</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                            <AlertCircle className="text-amber-600" size={20} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">
                                {(pages || []).filter((p: PageItem) => getSeoScore(p) < 50).length}
                            </p>
                            <p className="text-sm text-gray-500">À améliorer</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pages List */}
            {isLoading ? (
                <div className="text-center py-12 text-gray-500">Chargement...</div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Page</th>
                                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Meta Title</th>
                                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Meta Desc</th>
                                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Score</th>
                                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {(pages || []).map((page: PageItem) => {
                                const score = getSeoScore(page);
                                return (
                                    <tr key={page.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <Globe className="text-gray-400" size={18} />
                                                <div>
                                                    <p className="font-medium text-gray-900">{page.title}</p>
                                                    <p className="text-xs text-gray-400">/{page.slug}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-600 truncate max-w-[200px]">
                                                {page.seo?.metaTitle || <span className="text-gray-300">Non défini</span>}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-600 truncate max-w-[200px]">
                                                {page.seo?.metaDesc || <span className="text-gray-300">Non défini</span>}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs font-bold px-2 py-1 rounded ${getScoreColor(score)}`}>
                                                {score}%
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => openEditModal(page)}
                                                className="px-3 py-1.5 text-sm text-gold-600 hover:bg-gold-50 rounded-lg font-medium"
                                            >
                                                Modifier
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Edit Modal */}
            <Modal isOpen={!!selectedPage} onClose={() => setSelectedPage(null)} title={`SEO - ${selectedPage?.title}`} size="lg">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Meta Title <span className="text-xs text-gray-400">({formData.metaTitle.length}/60 caractères)</span>
                        </label>
                        <input
                            type="text"
                            value={formData.metaTitle}
                            onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                            maxLength={60}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Meta Description <span className="text-xs text-gray-400">({formData.metaDesc.length}/160 caractères)</span>
                        </label>
                        <textarea
                            value={formData.metaDesc}
                            onChange={(e) => setFormData({ ...formData, metaDesc: e.target.value })}
                            rows={3}
                            maxLength={160}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500 resize-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Image OpenGraph (URL)</label>
                        <input
                            type="url"
                            value={formData.ogImage}
                            onChange={(e) => setFormData({ ...formData, ogImage: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500"
                            placeholder="https://..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">URL Canonique</label>
                        <input
                            type="url"
                            value={formData.canonical}
                            onChange={(e) => setFormData({ ...formData, canonical: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500"
                            placeholder="https://www.astauria.com/..."
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="noIndex"
                            checked={formData.noIndex}
                            onChange={(e) => setFormData({ ...formData, noIndex: e.target.checked })}
                            className="w-4 h-4 text-gold-500 border-gray-300 rounded"
                        />
                        <label htmlFor="noIndex" className="text-sm text-gray-700">Ne pas indexer cette page (noindex)</label>
                    </div>

                    {/* Preview */}
                    <div className="border-t pt-4">
                        <p className="text-xs text-gray-500 mb-2">Aperçu Google</p>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-blue-800 text-lg font-medium truncate">{formData.metaTitle || 'Titre de la page'}</p>
                            <p className="text-green-700 text-sm">www.astauria.com/{selectedPage?.slug}</p>
                            <p className="text-gray-600 text-sm mt-1 line-clamp-2">{formData.metaDesc || 'Description de la page...'}</p>
                        </div>
                    </div>

                    <div className="flex gap-3 justify-end pt-4 border-t">
                        <button type="button" onClick={() => setSelectedPage(null)} className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium">
                            Annuler
                        </button>
                        <button type="submit" disabled={updateSeoMutation.isPending} className="px-4 py-2 bg-navy-900 text-white rounded-lg font-medium hover:bg-navy-800 disabled:opacity-50">
                            {updateSeoMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
