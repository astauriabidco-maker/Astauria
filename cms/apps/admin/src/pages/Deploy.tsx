import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Rocket, Clock, CheckCircle, AlertCircle, RefreshCw, History, Calendar } from 'lucide-react';
import api from '../services/api';
import { useState } from 'react';
import { toast } from '../components/Toast';

interface DeploymentHistory {
    id: string;
    status: 'success' | 'failed' | 'pending';
    triggeredBy: string;
    timestamp: string;
    duration: number;
    changes: number;
}

export default function Deploy() {
    const queryClient = useQueryClient();
    const [scheduleDate, setScheduleDate] = useState('');

    const { data: status } = useQuery({
        queryKey: ['deploy-status'],
        queryFn: async () => (await api.get('/generator/status')).data,
        refetchInterval: 10000,
    });

    const { data: history } = useQuery<DeploymentHistory[]>({
        queryKey: ['deploy-history'],
        queryFn: async () => {
            // Mock history for now - would be stored in DB
            return [
                { id: '1', status: 'success' as const, triggeredBy: 'Admin', timestamp: new Date().toISOString(), duration: 12, changes: 5 },
                { id: '2', status: 'success' as const, triggeredBy: 'Système', timestamp: new Date(Date.now() - 86400000).toISOString(), duration: 8, changes: 2 },
                { id: '3', status: 'failed' as const, triggeredBy: 'Admin', timestamp: new Date(Date.now() - 172800000).toISOString(), duration: 3, changes: 0 },
            ];
        },
    });

    const publishMutation = useMutation({
        mutationFn: async () => (await api.post('/generator/publish')).data,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['deploy-status'] });
            toast.success('Site publié avec succès !');
        },
        onError: () => toast.error('Erreur lors de la publication'),
    });

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const pendingChanges = status?.pendingChanges || 0;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Déploiement</h1>
                    <p className="text-gray-500">Publiez et gérez les versions de votre site</p>
                </div>
            </div>

            {/* Status Cards */}
            <div className="grid grid-cols-3 gap-6 mb-8">
                {/* Publish Button */}
                <div className="col-span-2 bg-gradient-to-br from-navy-900 to-navy-800 rounded-2xl p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-semibold mb-2">Prêt à publier</h2>
                            <p className="text-navy-200 mb-4">
                                {pendingChanges > 0
                                    ? `${pendingChanges} modification${pendingChanges > 1 ? 's' : ''} en attente de publication`
                                    : 'Aucune modification en attente'}
                            </p>
                            <button
                                onClick={() => publishMutation.mutate()}
                                disabled={publishMutation.isPending}
                                className="flex items-center gap-2 px-6 py-3 bg-gold-500 text-navy-900 rounded-xl font-semibold hover:bg-gold-400 transition-colors disabled:opacity-50"
                            >
                                {publishMutation.isPending ? (
                                    <>
                                        <RefreshCw size={20} className="animate-spin" />
                                        <span>Publication en cours...</span>
                                    </>
                                ) : (
                                    <>
                                        <Rocket size={20} />
                                        <span>Publier maintenant</span>
                                    </>
                                )}
                            </button>
                        </div>
                        <div className="w-24 h-24 rounded-full bg-navy-700/50 flex items-center justify-center">
                            <Rocket size={40} className="text-gold-400" />
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-sm font-medium text-gray-500 mb-4">Dernière publication</h3>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                            <CheckCircle size={20} className="text-green-600" />
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900">Réussie</p>
                            <p className="text-xs text-gray-500">{history?.[0] ? formatDate(history[0].timestamp) : 'Jamais'}</p>
                        </div>
                    </div>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Durée</span>
                            <span className="font-medium">{history?.[0]?.duration || 0}s</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Changements</span>
                            <span className="font-medium">{history?.[0]?.changes || 0} fichiers</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Schedule Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                    <Calendar className="text-gold-500" size={24} />
                    <h2 className="text-lg font-semibold text-gray-900">Publication programmée</h2>
                </div>
                <div className="flex items-center gap-4">
                    <input
                        type="datetime-local"
                        value={scheduleDate}
                        onChange={(e) => setScheduleDate(e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                    />
                    <button
                        onClick={() => {
                            if (scheduleDate) {
                                toast.success(`Publication programmée pour ${new Date(scheduleDate).toLocaleString('fr-FR')}`);
                                setScheduleDate('');
                            }
                        }}
                        disabled={!scheduleDate}
                        className="px-4 py-2 bg-navy-900 text-white rounded-lg font-medium hover:bg-navy-800 disabled:opacity-50"
                    >
                        Programmer
                    </button>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                    La publication sera déclenchée automatiquement à la date et heure spécifiées.
                </p>
            </div>

            {/* History */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
                    <History className="text-gray-400" size={20} />
                    <h2 className="font-semibold text-gray-900">Historique des publications</h2>
                </div>
                <div className="divide-y divide-gray-50">
                    {(history || []).map((item: DeploymentHistory) => (
                        <div key={item.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.status === 'success' ? 'bg-green-100' : item.status === 'failed' ? 'bg-red-100' : 'bg-amber-100'
                                }`}>
                                {item.status === 'success' ? (
                                    <CheckCircle size={20} className="text-green-600" />
                                ) : item.status === 'failed' ? (
                                    <AlertCircle size={20} className="text-red-600" />
                                ) : (
                                    <Clock size={20} className="text-amber-600" />
                                )}
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-gray-900">
                                    Publication {item.status === 'success' ? 'réussie' : item.status === 'failed' ? 'échouée' : 'en cours'}
                                </p>
                                <p className="text-sm text-gray-500">Par {item.triggeredBy} • {item.changes} changements</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-900">{formatDate(item.timestamp)}</p>
                                <p className="text-xs text-gray-400">{item.duration}s</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
