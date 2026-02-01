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
                    <h1 className="text-2xl font-bold text-gray-900">Navigation</h1>
                    <p className="text-gray-500">Gérez les menus du site (header et footer)</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-navy-900 text-white rounded-lg hover:bg-navy-800 transition-colors">
                    <Plus size={18} />
                    <span>Ajouter</span>
                </button>
            </div>

            {isLoading ? (
                <div className="text-center py-12 text-gray-500">Chargement...</div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Header Menu */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="p-4 border-b border-gray-100">
                            <h2 className="font-semibold text-lg">Menu Header</h2>
                            <p className="text-sm text-gray-500">{headerItems.length} éléments</p>
                        </div>
                        <div className="p-4 space-y-2">
                            {headerItems.map((item: any) => (
                                <div
                                    key={item.id}
                                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <GripVertical size={16} className="text-gray-400 cursor-grab" />
                                    <div className="flex-1">
                                        <p className="font-medium text-sm">{item.label}</p>
                                        <p className="text-xs text-gray-500">{item.url}</p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button className="p-1.5 hover:bg-white rounded transition-colors">
                                            <ExternalLink size={14} className="text-gray-400" />
                                        </button>
                                        <button className="p-1.5 hover:bg-white rounded transition-colors">
                                            <Pencil size={14} className="text-gray-400" />
                                        </button>
                                        <button className="p-1.5 hover:bg-red-50 rounded transition-colors">
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
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="p-4 border-b border-gray-100">
                            <h2 className="font-semibold text-lg">Menu Footer</h2>
                            <p className="text-sm text-gray-500">{footerItems.length} éléments</p>
                        </div>
                        <div className="p-4 space-y-2">
                            {footerItems.map((item: any) => (
                                <div
                                    key={item.id}
                                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <GripVertical size={16} className="text-gray-400 cursor-grab" />
                                    <div className="flex-1">
                                        <p className="font-medium text-sm">{item.label}</p>
                                        <p className="text-xs text-gray-500">{item.url}</p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button className="p-1.5 hover:bg-white rounded transition-colors">
                                            <Pencil size={14} className="text-gray-400" />
                                        </button>
                                        <button className="p-1.5 hover:bg-red-50 rounded transition-colors">
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
