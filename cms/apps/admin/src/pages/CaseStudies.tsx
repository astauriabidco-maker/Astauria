import { useQuery } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, ExternalLink, TrendingUp, Clock, Target } from 'lucide-react';
import api from '../services/api';

export default function CaseStudies() {
    const { data: caseStudies, isLoading } = useQuery({
        queryKey: ['case-studies'],
        queryFn: async () => (await api.get('/case-studies')).data,
    });

    const parseMetrics = (metricsStr: string) => {
        try {
            return JSON.parse(metricsStr);
        } catch {
            return [];
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Cas d'étude</h1>
                    <p className="text-gray-500">Gérez les études de cas clients ({caseStudies?.length || 0})</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-navy-900 text-white rounded-lg hover:bg-navy-800 transition-colors">
                    <Plus size={18} />
                    <span>Ajouter</span>
                </button>
            </div>

            {isLoading ? (
                <div className="text-center py-12 text-gray-500">Chargement...</div>
            ) : (
                <div className="space-y-4">
                    {(caseStudies || []).map((c: any) => {
                        const metrics = parseMetrics(c.metrics);
                        return (
                            <div key={c.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                                {c.isActive ? 'Actif' : 'Inactif'}
                                            </span>
                                            <span className="px-2 py-1 text-xs font-medium bg-navy-100 text-navy-700 rounded-full">
                                                {c.sector}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900">{c.title}</h3>
                                    </div>
                                    <div className="flex gap-1">
                                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                            <ExternalLink size={16} className="text-gray-400" />
                                        </button>
                                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                            <Pencil size={16} className="text-gray-400" />
                                        </button>
                                        <button className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                                            <Trash2 size={16} className="text-red-400" />
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                    <div className="flex items-start gap-2">
                                        <Target size={16} className="text-red-500 mt-0.5" />
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase">Défi</p>
                                            <p className="text-sm text-gray-700">{c.challenge}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <TrendingUp size={16} className="text-green-500 mt-0.5" />
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase">Solution</p>
                                            <p className="text-sm text-gray-700">{c.solution}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <Clock size={16} className="text-blue-500 mt-0.5" />
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase">Durée</p>
                                            <p className="text-sm text-gray-700">{c.timeline}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Metrics */}
                                <div className="flex gap-4 pt-4 border-t border-gray-100">
                                    {metrics.map((m: any, idx: number) => (
                                        <div
                                            key={idx}
                                            className={`px-4 py-2 rounded-lg ${m.isHighlight ? 'bg-gold-100 border border-gold-300' : 'bg-gray-50'}`}
                                        >
                                            <p className={`text-lg font-bold ${m.isHighlight ? 'text-gold-600' : 'text-navy-900'}`}>
                                                {m.value}
                                            </p>
                                            <p className="text-xs text-gray-500">{m.label}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                    {(!caseStudies || caseStudies.length === 0) && (
                        <div className="text-center py-12 text-gray-400 bg-white rounded-xl">
                            Aucune étude de cas
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
