import { useQuery, useMutation } from '@tanstack/react-query';
import { BarChart3, FileText, HelpCircle, MessageSquare, Menu, Rocket, CheckCircle, AlertCircle, Users, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { useState } from 'react';

export default function Dashboard() {
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

    const { data: leadsData } = useQuery({
        queryKey: ['leads'],
        queryFn: async () => (await api.get('/leads')).data,
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
        { label: 'Leads', value: leadsData?.length ?? 0, icon: Users, color: 'bg-red-500', link: '/leads' },
    ];

    // Transformation pour le graphique
    const leadsPipelineData = [
        { name: 'Nouveau', count: leadsData?.filter((l: any) => l.status === 'NEW').length || 0, color: '#f59e0b' },
        { name: 'Découverte', count: leadsData?.filter((l: any) => l.status === 'DISCOVERY').length || 0, color: '#3b82f6' },
        { name: 'POC', count: leadsData?.filter((l: any) => l.status === 'POC').length || 0, color: '#8b5cf6' },
        { name: 'Gagné', count: leadsData?.filter((l: any) => l.status === 'CLOSED_WON').length || 0, color: '#10b981' },
    ];

    return (
        <div>
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white text-glow">Tableau de bord</h1>
                    <p className="text-gold-400/80">Vue d'ensemble du contenu Astauria</p>
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
                <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 backdrop-blur-md border ${publishResult.success
                        ? 'bg-green-500/10 border-green-500/20 text-green-400'
                        : 'bg-red-500/10 border-red-500/20 text-red-400'
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
                        className="glass-panel rounded-xl p-6 hover:shadow-[0_0_15px_rgba(212,175,55,0.15)] transition-all group"
                    >
                        <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                            <stat.icon className="text-white" size={20} />
                        </div>
                        <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
                        <p className="text-gray-400 text-sm">{stat.label}</p>
                    </Link>
                ))}
            </div>

            {/* Info box */}
            <div className="glass-panel bg-gradient-to-r from-navy-900/80 to-navy-800/80 rounded-xl p-6 text-white mb-8 border-gold-500/20">
                <h2 className="text-lg font-semibold mb-2 flex items-center gap-2"><div className="text-glow">💡 Comment ça marche ?</div></h2>
                <ol className="list-decimal list-inside space-y-1 text-gray-300 text-sm">
                    <li>Modifiez votre contenu dans les différentes sections (FAQ, Témoignages, etc.)</li>
                    <li>Cliquez sur <strong className="text-gold-400">"Publier le site"</strong> pour appliquer vos modifications</li>
                    <li>Les fichiers HTML sont automatiquement mis à jour avec le nouveau contenu</li>
                </ol>
            </div>

            {/* Recharts Analytics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Graphics */}
                <div className="lg:col-span-2 glass-panel rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <Activity className="text-gold-400" size={24} />
                        <h2 className="text-lg font-semibold text-white">Entonnoir de Conversion des Leads</h2>
                    </div>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={leadsPipelineData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} allowDecimals={false} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    contentStyle={{ borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(10, 25, 48, 0.8)', backdropFilter: 'blur(10px)', color: '#fff' }}
                                />
                                <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={60}>
                                    {leadsPipelineData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Conversion KPIs */}
                <div className="glass-panel bg-gradient-to-br from-navy-900/60 to-navy-800/40 rounded-xl p-6 text-white flex flex-col justify-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <Users size={120} />
                    </div>
                    <h2 className="text-lg font-semibold mb-6 flex items-center gap-2 relative z-10">
                        <BarChart3 className="text-gold-400" size={20} /> Performance CRM
                    </h2>
                    
                    <div className="space-y-6 relative z-10">
                        <div>
                            <p className="text-navy-200 text-sm mb-1">Total des Opportunités</p>
                            <p className="text-4xl font-bold">{leadsData?.length || 0}</p>
                        </div>
                        
                        <div className="h-px bg-navy-700 w-full"></div>
                        
                        <div>
                            <p className="text-navy-200 text-sm mb-1">Taux de Conversion (Gagné)</p>
                            <p className="text-3xl font-bold text-green-400">
                                {leadsData?.length > 0 
                                    ? Math.round((leadsData.filter((l: any) => l.status === 'CLOSED_WON').length / leadsData.length) * 100)
                                    : 0}%
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent content preview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Leads */}
                <div className="glass-panel rounded-xl p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-white">Opportunités récentes</h2>
                        <Link to="/leads" className="text-gold-400 text-sm hover:underline">Voir tout</Link>
                    </div>
                    <div className="space-y-3">
                        {(leadsData || []).slice(0, 3).map((l: any) => (
                            <div key={l.id} className="flex flex-col gap-1 p-3 bg-white/5 border border-white/5 rounded-lg hover:bg-white/10 transition-colors">
                                <div className="flex justify-between items-center">
                                    <p className="font-medium text-sm text-gray-200">{l.name}</p>
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-navy-800 border border-navy-700 text-gray-300">{l.status}</span>
                                </div>
                                <p className="text-xs text-gray-400 truncate">{l.message}</p>
                            </div>
                        ))}
                        {(!leadsData || leadsData.length === 0) && (
                            <p className="text-gray-500 text-center py-4">Aucun prospect récent</p>
                        )}
                    </div>
                </div>

                {/* Recent Case Studies */}
                <div className="glass-panel rounded-xl p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-white">Cas d'étude</h2>
                        <Link to="/case-studies" className="text-gold-400 text-sm hover:underline">Voir tout</Link>
                    </div>
                    <div className="space-y-3">
                        {(caseStudyData || []).slice(0, 3).map((c: any) => (
                            <div key={c.id} className="p-3 bg-white/5 border border-white/5 rounded-lg hover:bg-white/10 transition-colors">
                                <p className="font-medium text-sm text-gray-200">{c.title}</p>
                                <p className="text-xs text-gray-400">{c.sector} • {c.timeline}</p>
                            </div>
                        ))}
                        {(!caseStudyData || caseStudyData.length === 0) && (
                            <p className="text-gray-500 text-center py-4">Aucune étude de cas</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
