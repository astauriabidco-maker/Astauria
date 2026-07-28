import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, CheckCircle, FileCheck2, RefreshCw, Rocket } from 'lucide-react';
import { useState } from 'react';
import { toast } from '../components/Toast';
import api from '../services/api';

interface PublishResult {
    success: boolean;
    message?: string;
    generated: string[];
}

export default function Deploy() {
    const queryClient = useQueryClient();
    const [lastResult, setLastResult] = useState<PublishResult | null>(null);

    const { data: status, isError: statusError } = useQuery({
        queryKey: ['deploy-status'],
        queryFn: async () => (await api.get('/generator/status')).data,
        refetchInterval: 30000,
    });

    const publishMutation = useMutation({
        mutationFn: async () => (await api.post<PublishResult>('/generator/publish')).data,
        onSuccess: (result) => {
            setLastResult(result);
            queryClient.invalidateQueries({ queryKey: ['deploy-status'] });
            toast.success(result.message || `${result.generated.length} fichier(s) publié(s)`);
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'La publication a échoué';
            toast.error(Array.isArray(message) ? message.join(', ') : message);
        },
    });

    const isReady = !statusError && status?.status === 'ready';

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-white text-glow">Publication</h1>
                <p className="text-gold-400/80">Régénérez le site statique depuis les contenus validés du CMS</p>
            </div>

            <div className="glass-panel rounded-2xl p-6 border border-white/10 mb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            {isReady ? (
                                <CheckCircle size={22} className="text-green-400" />
                            ) : (
                                <AlertCircle size={22} className="text-amber-400" />
                            )}
                            <h2 className="text-xl font-semibold text-white">
                                {isReady ? 'Générateur prêt' : 'Générateur indisponible'}
                            </h2>
                        </div>
                        <p className="text-gray-300 max-w-2xl">
                            {status?.message || (
                                statusError
                                    ? 'Le statut du générateur ne peut pas être récupéré.'
                                    : 'Vérification du générateur…'
                            )}
                        </p>
                    </div>
                    <button
                        onClick={() => publishMutation.mutate()}
                        disabled={!isReady || publishMutation.isPending}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-gold-500 to-gold-400 text-navy-950 rounded-xl font-bold disabled:opacity-50"
                    >
                        {publishMutation.isPending ? (
                            <>
                                <RefreshCw size={20} className="animate-spin" />
                                <span>Publication en cours…</span>
                            </>
                        ) : (
                            <>
                                <Rocket size={20} />
                                <span>Publier maintenant</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div className="glass-panel rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                    <FileCheck2 className="text-gold-400" size={22} />
                    <h2 className="text-lg font-semibold text-white">Résultat de cette session</h2>
                </div>
                {!lastResult ? (
                    <p className="text-gray-400">
                        Aucune publication lancée depuis l’ouverture de cette page.
                    </p>
                ) : lastResult.generated.length === 0 ? (
                    <p className="text-gray-300">Publication terminée : aucun fichier n’avait besoin d’être modifié.</p>
                ) : (
                    <div>
                        <p className="text-gray-300 mb-3">
                            {lastResult.generated.length} fichier(s) généré(s) avec succès :
                        </p>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {lastResult.generated.map(filename => (
                                <li key={filename} className="px-3 py-2 bg-white/5 rounded-lg text-sm text-gray-300">
                                    {filename}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}
