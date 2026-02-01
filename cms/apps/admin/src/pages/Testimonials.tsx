import { useQuery } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Star, Building2 } from 'lucide-react';
import api from '../services/api';

export default function Testimonials() {
    const { data: testimonials, isLoading } = useQuery({
        queryKey: ['testimonials'],
        queryFn: async () => (await api.get('/testimonials')).data,
    });

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Témoignages</h1>
                    <p className="text-gray-500">Gérez les témoignages clients ({testimonials?.length || 0})</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-navy-900 text-white rounded-lg hover:bg-navy-800 transition-colors">
                    <Plus size={18} />
                    <span>Ajouter</span>
                </button>
            </div>

            {isLoading ? (
                <div className="text-center py-12 text-gray-500">Chargement...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(testimonials || []).map((t: any) => (
                        <div key={t.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-navy-900 to-navy-700 rounded-full flex items-center justify-center text-white font-semibold">
                                        {t.author?.charAt(0) || '?'}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{t.author}</h3>
                                        <p className="text-sm text-gray-500">{t.role}</p>
                                    </div>
                                </div>
                                <div className={`w-2 h-2 rounded-full ${t.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
                            </div>

                            <div className="flex items-center gap-1 mb-3">
                                <Building2 size={14} className="text-gold-500" />
                                <span className="text-sm font-medium text-gold-600">{t.company}</span>
                            </div>

                            <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                                "{t.content}"
                            </p>

                            <div className="flex items-center justify-between">
                                <div className="flex gap-0.5">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            size={14}
                                            className={i < t.rating ? 'text-gold-500 fill-gold-500' : 'text-gray-200'}
                                        />
                                    ))}
                                </div>
                                <div className="flex gap-1">
                                    <button className="p-1.5 hover:bg-gray-100 rounded transition-colors">
                                        <Pencil size={14} className="text-gray-400" />
                                    </button>
                                    <button className="p-1.5 hover:bg-red-50 rounded transition-colors">
                                        <Trash2 size={14} className="text-red-400" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {(!testimonials || testimonials.length === 0) && (
                        <div className="col-span-full text-center py-12 text-gray-400">
                            Aucun témoignage
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
