import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Globe, FileText, RefreshCw, Check, AlertCircle } from 'lucide-react';
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


    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white text-glow">SEO</h1>
                    <p className="text-gold-400/80">Optimisation pour les moteurs de recherche</p>
                </div>
                <button
                    onClick={() => generateSitemapMutation.mutate()}
                    disabled={generateSitemapMutation.isPending}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gold-500 to-gold-400 text-navy-950 rounded-lg hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] transition-all font-bold disabled:opacity-50"
                >
                    <RefreshCw size={18} className={generateSitemapMutation.isPending ? 'animate-spin' : ''} />
                    <span>Générer Sitemap</span>
                </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="glass-panel rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-gold-500/20 flex items-center justify-center">
                            <FileText className="text-gold-400" size={20} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{(pages || []).length}</p>
                            <p className="text-sm text-gray-400">Pages</p>
                        </div>
                    </div>
                </div>
                <div className="glass-panel rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                            <Check className="text-green-400" size={20} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">
                                {(pages || []).filter((p: PageItem) => getSeoScore(p) >= 80).length}
                            </p>
                            <p className="text-sm text-gray-400">Optimisé</p>
                        </div>
                    </div>
                </div>
                <div className="glass-panel rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                            <AlertCircle className="text-amber-400" size={20} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">
                                {(pages || []).filter((p: PageItem) => getSeoScore(p) < 50).length}
                            </p>
                            <p className="text-sm text-gray-400">À améliorer</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pages List */}
            {isLoading ? (
                <div className="text-center py-12 text-gold-400">Chargement...</div>
            ) : (
                <div className="glass-panel rounded-xl overflow-hidden border border-white/10">
                    <table className="w-full">
                        <thead className="bg-black/20 border-b border-white/10">
                            <tr>
                                <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase">Page</th>
                                <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase">Meta Title</th>
                                <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase">Meta Desc</th>
                                <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase">Score</th>
                                <th className="text-right px-6 py-3 text-xs font-medium text-gray-400 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {(pages || []).map((page: PageItem) => {
                                const score = getSeoScore(page);
                                return (
                                    <tr key={page.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <Globe className="text-gray-400" size={18} />
                                                <div>
                                                    <p className="font-medium text-white">{page.title}</p>
                                                    <p className="text-xs text-gray-400">/{page.slug}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-300 truncate max-w-[200px]">
                                                {page.seo?.metaTitle || <span className="text-gray-500">Non défini</span>}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-300 truncate max-w-[200px]">
                                                {page.seo?.metaDesc || <span className="text-gray-500">Non défini</span>}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs font-bold px-2 py-1 rounded bg-black/20 ` + (score >= 80 ? 'text-green-400' : score >= 50 ? 'text-gold-400' : 'text-red-400')}>
                                                {score}%
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => openEditModal(page)}
                                                className="px-3 py-1.5 text-sm text-gold-400 hover:bg-gold-500/10 rounded-lg font-medium transition-colors"
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
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            Meta Title <span className="text-xs text-gray-500">({formData.metaTitle.length}/60 caractères)</span>
                        </label>
                        <input
                            type="text"
                            value={formData.metaTitle}
                            onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                            maxLength={60}
                            className="glass-input w-full px-4 py-2 rounded-lg"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            Meta Description <span className="text-xs text-gray-500">({formData.metaDesc.length}/160 caractères)</span>
                        </label>
                        <textarea
                            value={formData.metaDesc}
                            onChange={(e) => setFormData({ ...formData, metaDesc: e.target.value })}
                            rows={3}
                            maxLength={160}
                            className="glass-input w-full px-4 py-2 rounded-lg resize-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Image OpenGraph (URL)</label>
                        <input
                            type="url"
                            value={formData.ogImage}
                            onChange={(e) => setFormData({ ...formData, ogImage: e.target.value })}
                            className="glass-input w-full px-4 py-2 rounded-lg"
                            placeholder="https://..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">URL Canonique</label>
                        <input
                            type="url"
                            value={formData.canonical}
                            onChange={(e) => setFormData({ ...formData, canonical: e.target.value })}
                            className="glass-input w-full px-4 py-2 rounded-lg"
                            placeholder="https://www.astauria.com/..."
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="noIndex"
                            checked={formData.noIndex}
                            onChange={(e) => setFormData({ ...formData, noIndex: e.target.checked })}
                            className="w-4 h-4 text-gold-500 bg-navy-950 border-white/20 rounded focus:ring-gold-500"
                        />
                        <label htmlFor="noIndex" className="text-sm text-gray-300">Ne pas indexer cette page (noindex)</label>
                    </div>

                    {/* Preview */}
                    <div className="border-t border-white/10 pt-4">
                        <p className="text-xs text-gray-400 mb-2">Aperçu Google</p>
                        <div className="bg-[#202124] p-4 rounded-lg border border-white/5 shadow-inner">
                            <p className="text-[#8ab4f8] text-lg font-medium truncate mb-1 leading-tight">{formData.metaTitle || 'Titre de la page'}</p>
                            <div className="flex items-center gap-2 mb-2">
                                <Globe size={12} className="text-gray-300" />
                                <p className="text-[#bdc1c6] text-sm">www.astauria.com › {selectedPage?.slug}</p>
                            </div>
                            <p className="text-[#bdc1c6] text-sm mt-1 line-clamp-2 leading-relaxed">{formData.metaDesc || 'Description de la page...'}</p>
                        </div>
                    </div>

                    <div className="flex gap-3 justify-end pt-4 border-t border-white/10">
                        <button type="button" onClick={() => setSelectedPage(null)} className="px-4 py-2 text-gray-300 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg font-medium">
                            Annuler
                        </button>
                        <button type="submit" disabled={updateSeoMutation.isPending} className="px-4 py-2 bg-gradient-to-r from-gold-500 to-gold-400 text-navy-950 rounded-lg font-bold hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] transition-all disabled:opacity-50">
                            {updateSeoMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
