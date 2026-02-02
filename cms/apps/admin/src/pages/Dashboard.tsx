import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BarChart3, FileText, HelpCircle, MessageSquare, Menu, Rocket, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { useState } from 'react';

export default function Dashboard() {
    const queryClient = useQueryClient();
    const [publishResult, setPublishResult] = useState<{ success: boolean; message: string } | null>(null);

    // Fetch real stats from API
    const { data: navData } = useQuery({
        queryKey: ['navigation'],
        queryFn: async () => (await api.get('/navigation')).data,
    });

    const { data: faqData } = useQuery({
        queryKey: ['faq'],
        queryFn: async () => (await api.get('/faq')).data,
    });

    const { data: testimonialData } = useQuery({
        queryKey: ['testimonials'],
        queryFn: async () => (await api.get('/testimonials')).data,
    });

    const { data: caseStudyData } = useQuery({
        queryKey: ['case-studies'],
        queryFn: async () => (await api.get('/case-studies')).data,
    });

    const { data: articleData } = useQuery({
        queryKey: ['articles'],
        queryFn: async () => (await api.get('/blog/articles')).data,
    });

    // Publish mutation
    const publishMutation = useMutation({
        mutationFn: async () => {
            const res = await api.post('/generator/publish');
            return res.data;
        },
        onSuccess: (data) => {
            setPublishResult({ success: true, message: data.message });
            setTimeout(() => setPublishResult(null), 5000);
        },
        onError: (error: any) => {
            setPublishResult({
                success: false,
                message: error.response?.data?.message || 'Erreur lors de la publication'
            });
            setTimeout(() => setPublishResult(null), 5000);
        },
    });

    const stats = [
        { label: 'Navigation', value: navData?.length ?? 0, icon: Menu, color: 'bg-navy-900', link: '/navigation' },
        { label: 'Articles', value: articleData?.length ?? 0, icon: FileText, color: 'bg-blue-500', link: '/articles' },
        { label: 'FAQ', value: faqData?.length ?? 0, icon: HelpCircle, color: 'bg-green-500', link: '/faq' },
        { label: 'Témoignages', value: testimonialData?.length ?? 0, icon: MessageSquare, color: 'bg-purple-500', link: '/testimonials' },
        { label: "Cas d'étude", value: caseStudyData?.length ?? 0, icon: BarChart3, color: 'bg-gold-500', link: '/case-studies' },
    ];

    return (
        <div>
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
                    <p className="text-gray-500">Vue d'ensemble du contenu Astauria</p>
                </div>

                {/* Publish Button */}
                <button
                    onClick={() => publishMutation.mutate()}
                    disabled={publishMutation.isPending}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all shadow-lg ${publishMutation.isPending
                            ? 'bg-gray-400 cursor-wait'
                            : 'bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 hover:scale-105'
                        }`}
                >
                    <Rocket size={20} className={publishMutation.isPending ? 'animate-bounce' : ''} />
                    <span>{publishMutation.isPending ? 'Publication...' : 'Publier le site'}</span>
                </button>
            </div>

            {/* Publish Result Toast */}
            {publishResult && (
                <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${publishResult.success
                        ? 'bg-green-50 border border-green-200 text-green-800'
                        : 'bg-red-50 border border-red-200 text-red-800'
                    }`}>
                    {publishResult.success ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    <span>{publishResult.message}</span>
                </div>
            )}

            {/* Stats grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                {stats.map((stat) => (
                    <Link
                        key={stat.label}
                        to={stat.link}
                        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                    >
                        <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center mb-3`}>
                            <stat.icon className="text-white" size={20} />
                        </div>
                        <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                        <p className="text-gray-500 text-sm">{stat.label}</p>
                    </Link>
                ))}
            </div>

            {/* Info box */}
            <div className="bg-gradient-to-r from-navy-900 to-navy-800 rounded-xl p-6 text-white mb-8">
                <h2 className="text-lg font-semibold mb-2">💡 Comment ça marche ?</h2>
                <ol className="list-decimal list-inside space-y-1 text-gray-300 text-sm">
                    <li>Modifiez votre contenu dans les différentes sections (FAQ, Témoignages, etc.)</li>
                    <li>Cliquez sur <strong className="text-gold-400">"Publier le site"</strong> pour appliquer vos modifications</li>
                    <li>Les fichiers HTML sont automatiquement mis à jour avec le nouveau contenu</li>
                </ol>
            </div>

            {/* Recent content preview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Testimonials */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">Témoignages récents</h2>
                        <Link to="/testimonials" className="text-gold-500 text-sm hover:underline">Voir tout</Link>
                    </div>
                    <div className="space-y-3">
                        {(testimonialData || []).slice(0, 3).map((t: any) => (
                            <div key={t.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <div className="w-10 h-10 bg-navy-100 rounded-full flex items-center justify-center text-navy-600 font-medium">
                                    {t.author?.charAt(0) || '?'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm truncate">{t.author}</p>
                                    <p className="text-xs text-gray-500 truncate">{t.company}</p>
                                </div>
                            </div>
                        ))}
                        {(!testimonialData || testimonialData.length === 0) && (
                            <p className="text-gray-400 text-center py-4">Aucun témoignage</p>
                        )}
                    </div>
                </div>

                {/* Recent Case Studies */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">Cas d'étude</h2>
                        <Link to="/case-studies" className="text-gold-500 text-sm hover:underline">Voir tout</Link>
                    </div>
                    <div className="space-y-3">
                        {(caseStudyData || []).slice(0, 3).map((c: any) => (
                            <div key={c.id} className="p-3 bg-gray-50 rounded-lg">
                                <p className="font-medium text-sm">{c.title}</p>
                                <p className="text-xs text-gray-500">{c.sector} • {c.timeline}</p>
                            </div>
                        ))}
                        {(!caseStudyData || caseStudyData.length === 0) && (
                            <p className="text-gray-400 text-center py-4">Aucune étude de cas</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
