import { useQuery } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Eye, Calendar, Clock, Tag } from 'lucide-react';
import api from '../services/api';

export default function Articles() {
    const { data: articles, isLoading } = useQuery({
        queryKey: ['articles'],
        queryFn: async () => (await api.get('/blog/articles')).data,
    });

    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => (await api.get('/blog/categories')).data,
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PUBLISHED':
                return 'bg-green-100 text-green-700';
            case 'DRAFT':
                return 'bg-yellow-100 text-yellow-700';
            default:
                return 'bg-gray-100 text-gray-600';
        }
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Articles</h1>
                    <p className="text-gray-500">Gérez les articles du blog ({articles?.length || 0})</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-navy-900 text-white rounded-lg hover:bg-navy-800 transition-colors">
                    <Plus size={18} />
                    <span>Nouvel article</span>
                </button>
            </div>

            {/* Categories filter */}
            {categories && categories.length > 0 && (
                <div className="flex gap-2 mb-6 flex-wrap">
                    <button className="px-3 py-1.5 text-sm font-medium bg-navy-900 text-white rounded-full">
                        Tous
                    </button>
                    {categories.map((cat: any) => (
                        <button
                            key={cat.id}
                            className="px-3 py-1.5 text-sm font-medium bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
                        >
                            {cat.name} ({cat._count?.articles || 0})
                        </button>
                    ))}
                </div>
            )}

            {isLoading ? (
                <div className="text-center py-12 text-gray-500">Chargement...</div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Article</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Catégorie</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Statut</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {(articles || []).map((article: any) => (
                                <tr key={article.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div>
                                            <h3 className="font-medium text-gray-900">{article.title}</h3>
                                            <p className="text-sm text-gray-500 line-clamp-1">{article.excerpt}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1">
                                            <Tag size={12} className="text-gray-400" />
                                            <span className="text-sm text-gray-600">{article.category?.name || 'Non classé'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(article.status)}`}>
                                            {article.status === 'PUBLISHED' ? 'Publié' : 'Brouillon'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1 text-sm text-gray-500">
                                            <Calendar size={12} />
                                            <span>{article.publishedAt ? formatDate(article.publishedAt) : formatDate(article.createdAt)}</span>
                                        </div>
                                        {article.readTime && (
                                            <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                                                <Clock size={10} />
                                                <span>{article.readTime} min</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-end gap-1">
                                            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                                <Eye size={16} className="text-gray-400" />
                                            </button>
                                            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                                <Pencil size={16} className="text-gray-400" />
                                            </button>
                                            <button className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                                                <Trash2 size={16} className="text-red-400" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {(!articles || articles.length === 0) && (
                        <div className="text-center py-12 text-gray-400">
                            Aucun article
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
