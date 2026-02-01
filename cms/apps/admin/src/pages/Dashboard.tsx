import { useQuery } from '@tanstack/react-query';
import { BarChart3, FileText, HelpCircle, MessageSquare, Menu, Eye, Users, Settings } from 'lucide-react';
import api from '../services/api';
import { Link } from 'react-router-dom';

export default function Dashboard() {
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

    const stats = [
        { label: 'Navigation', value: navData?.length ?? 0, icon: Menu, color: 'bg-navy-900', link: '/navigation' },
        { label: 'Articles', value: articleData?.length ?? 0, icon: FileText, color: 'bg-blue-500', link: '/articles' },
        { label: 'FAQ', value: faqData?.length ?? 0, icon: HelpCircle, color: 'bg-green-500', link: '/faq' },
        { label: 'Témoignages', value: testimonialData?.length ?? 0, icon: MessageSquare, color: 'bg-purple-500', link: '/testimonials' },
        { label: "Cas d'étude", value: caseStudyData?.length ?? 0, icon: BarChart3, color: 'bg-gold-500', link: '/case-studies' },
    ];

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
                <p className="text-gray-500">Vue d'ensemble du contenu Astauria</p>
            </div>

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
