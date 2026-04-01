import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, Trash2, Copy, ExternalLink, FileText, X } from 'lucide-react';
import api from '../services/api';
import { useState, useCallback } from 'react';
import ConfirmDialog from '../components/ConfirmDialog';
import { toast } from '../components/Toast';

interface MediaItem {
    id: string;
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    url: string;
    createdAt: string;
}

export default function Media() {
    const queryClient = useQueryClient();
    const [isDragging, setIsDragging] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<number | null>(null);
    const [deleteItem, setDeleteItem] = useState<MediaItem | null>(null);
    const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);

    const { data: mediaItems, isLoading } = useQuery({
        queryKey: ['media'],
        queryFn: async () => (await api.get('/media')).data,
    });

    const uploadMutation = useMutation({
        mutationFn: async (file: File) => {
            const formData = new FormData();
            formData.append('file', file);
            const response = await api.post('/media/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    const percent = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
                    setUploadProgress(percent);
                },
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['media'] });
            toast.success('Fichier téléversé avec succès');
            setUploadProgress(null);
        },
        onError: () => {
            toast.error('Erreur lors du téléversement');
            setUploadProgress(null);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => (await api.delete(`/media/${id}`)).data,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['media'] });
            toast.success('Fichier supprimé');
            setDeleteItem(null);
        },
        onError: () => toast.error('Erreur lors de la suppression'),
    });

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files);
        files.forEach((file) => uploadMutation.mutate(file));
    }, [uploadMutation]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        files.forEach((file) => uploadMutation.mutate(file));
        e.target.value = '';
    };

    const copyUrl = (url: string) => {
        navigator.clipboard.writeText(window.location.origin + url);
        toast.success('URL copiée dans le presse-papier');
    };

    const formatSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const isImage = (mimeType: string) => mimeType.startsWith('image/');

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white text-glow">Médiathèque</h1>
                    <p className="text-gold-400/80">Gérez vos images et fichiers</p>
                </div>
            </div>

            {/* Upload Zone */}
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-xl p-8 mb-6 transition-colors ${isDragging ? 'border-gold-500 bg-gold-500/10' : 'border-white/20 hover:border-white/30 bg-white/5'
                    }`}
            >
                <div className="text-center">
                    <Upload className={`mx-auto mb-3 ${isDragging ? 'text-gold-400' : 'text-gray-400'}`} size={40} />
                    <p className="text-gray-300 mb-1">
                        <span className="font-medium text-white">Glissez-déposez</span> vos fichiers ici, ou{' '}
                        <label className="text-gold-400 hover:text-gold-300 cursor-pointer font-medium transition-colors">
                            parcourez
                            <input type="file" className="hidden" multiple accept="image/*,.pdf" onChange={handleFileSelect} />
                        </label>
                    </p>
                    <p className="text-xs text-gray-500">Images (JPG, PNG, GIF, WebP, SVG) et PDF. Max 5MB.</p>
                </div>
                {uploadProgress !== null && (
                    <div className="absolute inset-0 bg-navy-950/80 backdrop-blur-sm flex items-center justify-center rounded-xl">
                        <div className="text-center w-full max-w-xs">
                            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-2">
                                <div className="h-full bg-gradient-to-r from-gold-500 to-gold-400 transition-all shadow-[0_0_10px_rgba(212,175,55,0.8)]" style={{ width: `${uploadProgress}%` }} />
                            </div>
                            <span className="text-sm font-medium text-white">{uploadProgress}%</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Media Grid */}
            {isLoading ? (
                <div className="text-center py-12 text-gold-400">Chargement...</div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {(mediaItems || []).map((item: MediaItem) => (
                        <div
                            key={item.id}
                            onClick={() => setSelectedItem(item)}
                            className="group relative glass-panel rounded-xl overflow-hidden cursor-pointer hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all border border-white/10"
                        >
                            <div className="aspect-square bg-black/40 flex items-center justify-center overflow-hidden">
                                {isImage(item.mimeType) ? (
                                    <img src={item.url} alt={item.originalName} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                                ) : (
                                    <FileText className="text-gray-500" size={40} />
                                )}
                            </div>
                            <div className="p-3 bg-navy-950/50 backdrop-blur-sm border-t border-white/5">
                                <p className="text-xs font-medium text-white truncate">{item.originalName}</p>
                                <p className="text-xs text-gray-400">{formatSize(item.size)}</p>
                            </div>
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={(e) => { e.stopPropagation(); setDeleteItem(item); }}
                                    className="p-1.5 bg-red-500/80 backdrop-blur-sm text-white rounded-lg hover:bg-red-500 transition-colors"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {(!mediaItems || mediaItems.length === 0) && !isLoading && (
                <div className="text-center py-12 text-gray-400">
                    Aucun fichier. Téléversez des images pour commencer.
                </div>
            )}

            {/* Detail Modal */}
            {selectedItem && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-navy-950/80 backdrop-blur-sm" onClick={() => setSelectedItem(null)} />
                    <div className="relative w-full max-w-2xl glass-panel border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden">
                        <button onClick={() => setSelectedItem(null)} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white rounded-lg bg-black/50 hover:bg-black/70 backdrop-blur-md transition-colors z-10">
                            <X size={20} />
                        </button>
                        <div className="max-h-[50vh] bg-black/40 flex items-center justify-center overflow-hidden relative border-b border-white/10">
                            <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:20px_20px]" />
                            {isImage(selectedItem.mimeType) ? (
                                <img src={selectedItem.url} alt={selectedItem.originalName} className="max-w-full max-h-[50vh] object-contain relative z-10 drop-shadow-2xl" />
                            ) : (
                                <div className="py-12 relative z-10"><FileText className="text-gray-600" size={80} /></div>
                            )}
                        </div>
                        <div className="p-6">
                            <h3 className="font-semibold text-white mb-4 text-glow">{selectedItem.originalName}</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                                <div><span className="text-gray-400">Type:</span> <span className="text-white ml-2">{selectedItem.mimeType}</span></div>
                                <div><span className="text-gray-400">Taille:</span> <span className="text-white ml-2">{formatSize(selectedItem.size)}</span></div>
                            </div>
                            <div className="flex items-center gap-2 p-3 bg-black/20 rounded-lg border border-white/10">
                                <input type="text" readOnly value={window.location.origin + selectedItem.url} className="flex-1 bg-transparent text-sm text-gray-300 outline-none" />
                                <button onClick={() => copyUrl(selectedItem.url)} className="p-2 text-gray-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-lg">
                                    <Copy size={16} />
                                </button>
                                <a href={selectedItem.url} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-lg">
                                    <ExternalLink size={16} />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmDialog
                isOpen={!!deleteItem}
                onClose={() => setDeleteItem(null)}
                onConfirm={() => deleteItem && deleteMutation.mutate(deleteItem.id)}
                title="Supprimer ce fichier ?"
                message={`"${deleteItem?.originalName}" sera définitivement supprimé.`}
                confirmText="Supprimer"
                isLoading={deleteMutation.isPending}
            />
        </div>
    );
}
