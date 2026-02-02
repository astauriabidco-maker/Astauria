import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, Image as ImageIcon, Trash2, Copy, ExternalLink, FileText, X } from 'lucide-react';
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
                    <h1 className="text-2xl font-bold text-gray-900">Médiathèque</h1>
                    <p className="text-gray-500">Gérez vos images et fichiers</p>
                </div>
            </div>

            {/* Upload Zone */}
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-xl p-8 mb-6 transition-colors ${isDragging ? 'border-gold-500 bg-gold-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
            >
                <div className="text-center">
                    <Upload className={`mx-auto mb-3 ${isDragging ? 'text-gold-500' : 'text-gray-400'}`} size={40} />
                    <p className="text-gray-600 mb-1">
                        <span className="font-medium">Glissez-déposez</span> vos fichiers ici, ou{' '}
                        <label className="text-gold-600 hover:text-gold-700 cursor-pointer font-medium">
                            parcourez
                            <input type="file" className="hidden" multiple accept="image/*,.pdf" onChange={handleFileSelect} />
                        </label>
                    </p>
                    <p className="text-xs text-gray-400">Images (JPG, PNG, GIF, WebP, SVG) et PDF. Max 5MB.</p>
                </div>
                {uploadProgress !== null && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-xl">
                        <div className="text-center">
                            <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
                                <div className="h-full bg-gold-500 transition-all" style={{ width: `${uploadProgress}%` }} />
                            </div>
                            <span className="text-sm text-gray-600">{uploadProgress}%</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Media Grid */}
            {isLoading ? (
                <div className="text-center py-12 text-gray-500">Chargement...</div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {(mediaItems || []).map((item: MediaItem) => (
                        <div
                            key={item.id}
                            onClick={() => setSelectedItem(item)}
                            className="group relative bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                        >
                            <div className="aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
                                {isImage(item.mimeType) ? (
                                    <img src={item.url} alt={item.originalName} className="w-full h-full object-cover" />
                                ) : (
                                    <FileText className="text-gray-300" size={40} />
                                )}
                            </div>
                            <div className="p-2">
                                <p className="text-xs font-medium text-gray-700 truncate">{item.originalName}</p>
                                <p className="text-xs text-gray-400">{formatSize(item.size)}</p>
                            </div>
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={(e) => { e.stopPropagation(); setDeleteItem(item); }}
                                    className="p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600"
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
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedItem(null)} />
                    <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden">
                        <button onClick={() => setSelectedItem(null)} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-lg bg-white/80">
                            <X size={20} />
                        </button>
                        <div className="max-h-[50vh] bg-gray-100 flex items-center justify-center overflow-hidden">
                            {isImage(selectedItem.mimeType) ? (
                                <img src={selectedItem.url} alt={selectedItem.originalName} className="max-w-full max-h-[50vh] object-contain" />
                            ) : (
                                <div className="py-12"><FileText className="text-gray-300" size={80} /></div>
                            )}
                        </div>
                        <div className="p-6">
                            <h3 className="font-semibold text-gray-900 mb-4">{selectedItem.originalName}</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                                <div><span className="text-gray-500">Type:</span> <span className="text-gray-900">{selectedItem.mimeType}</span></div>
                                <div><span className="text-gray-500">Taille:</span> <span className="text-gray-900">{formatSize(selectedItem.size)}</span></div>
                            </div>
                            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                <input type="text" readOnly value={window.location.origin + selectedItem.url} className="flex-1 bg-transparent text-sm text-gray-600 outline-none" />
                                <button onClick={() => copyUrl(selectedItem.url)} className="p-2 text-gray-500 hover:text-gray-700">
                                    <Copy size={16} />
                                </button>
                                <a href={selectedItem.url} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-500 hover:text-gray-700">
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
