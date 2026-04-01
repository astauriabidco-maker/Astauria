import { useQuery } from '@tanstack/react-query';
import { Plus, GripVertical, Pencil, Trash2, ExternalLink } from 'lucide-react';
import api from '../services/api';

export default function Navigation() {
    const { data: menuItems, isLoading } = useQuery({
        queryKey: ['navigation'],
        queryFn: async () => (await api.get('/navigation')).data,
    });

    const headerItems = (menuItems || []).filter((item: any) => item.location === 'HEADER');
    const footerItems = (menuItems || []).filter((item: any) => item.location === 'FOOTER');

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white text-glow">Navigation</h1>
                    <p className="text-gold-400/80">Gérez les menus du site (header et footer)</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gold-500 to-gold-400 text-navy-950 font-bold rounded-lg hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] transition-all">
                    <Plus size={18} />
                    <span>Ajouter</span>
                </button>
            </div>

            {isLoading ? (
                <div className="text-center py-12 text-gold-400">Chargement...</div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Header Menu */}
                    <div className="glass-panel rounded-xl">
                        <div className="p-4 border-b border-white/10">
                            <h2 className="font-semibold text-lg text-white">Menu Header</h2>
                            <p className="text-sm text-gray-400">{headerItems.length} éléments</p>
                        </div>
                        <div className="p-4 space-y-2">
                            {headerItems.map((item: any) => (
                                <div
                                    key={item.id}
                                    className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                                >
                                    <GripVertical size={16} className="text-gray-400 cursor-grab" />
                                    <div className="flex-1">
                                        <p className="font-medium text-sm text-white">{item.label}</p>
                                        <p className="text-xs text-gray-400">{item.url}</p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button className="p-1.5 hover:bg-white/5 rounded transition-colors">
                                            <ExternalLink size={14} className="text-gray-400" />
                                        </button>
                                        <button className="p-1.5 hover:bg-white/5 rounded transition-colors">
                                            <Pencil size={14} className="text-gray-400" />
                                        </button>
                                        <button className="p-1.5 hover:bg-red-500/10 rounded transition-colors">
                                            <Trash2 size={14} className="text-red-400" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {headerItems.length === 0 && (
                                <p className="text-center py-6 text-gray-400">Aucun élément dans le header</p>
                            )}
                        </div>
                    </div>

                    {/* Footer Menu */}
                    <div className="glass-panel rounded-xl">
                        <div className="p-4 border-b border-white/10">
                            <h2 className="font-semibold text-lg text-white">Menu Footer</h2>
                            <p className="text-sm text-gray-400">{footerItems.length} éléments</p>
                        </div>
                        <div className="p-4 space-y-2">
                            {footerItems.map((item: any) => (
                                <div
                                    key={item.id}
                                    className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                                >
                                    <GripVertical size={16} className="text-gray-400 cursor-grab" />
                                    <div className="flex-1">
                                        <p className="font-medium text-sm text-white">{item.label}</p>
                                        <p className="text-xs text-gray-400">{item.url}</p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button className="p-1.5 hover:bg-white/5 rounded transition-colors">
                                            <Pencil size={14} className="text-gray-400" />
                                        </button>
                                        <button className="p-1.5 hover:bg-red-500/10 rounded transition-colors">
                                            <Trash2 size={14} className="text-red-400" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {footerItems.length === 0 && (
                                <p className="text-center py-6 text-gray-400">Aucun élément dans le footer</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
