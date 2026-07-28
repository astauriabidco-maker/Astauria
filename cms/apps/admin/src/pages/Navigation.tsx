import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronDown, ChevronUp, ExternalLink, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import ConfirmDialog from '../components/ConfirmDialog';
import Modal from '../components/Modal';
import { toast } from '../components/Toast';
import api from '../services/api';

type Location = 'HEADER' | 'FOOTER';

interface MenuItem {
    id: string;
    label: string;
    url: string;
    location: Location;
    order: number;
    isActive: boolean;
}

const emptyForm = {
    label: '',
    url: '',
    location: 'HEADER' as Location,
    isActive: true,
};

export default function Navigation() {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
    const [deleteItem, setDeleteItem] = useState<MenuItem | null>(null);
    const [formData, setFormData] = useState(emptyForm);

    const { data: menuItems = [], isLoading } = useQuery<MenuItem[]>({
        queryKey: ['navigation'],
        queryFn: async () => (await api.get('/navigation/admin/all')).data,
    });

    const refresh = () => queryClient.invalidateQueries({ queryKey: ['navigation'] });

    const saveMutation = useMutation({
        mutationFn: async () => {
            if (editingItem) {
                return (await api.patch(`/navigation/${editingItem.id}`, formData)).data;
            }
            const siblings = menuItems.filter(item => item.location === formData.location);
            return (await api.post('/navigation', { ...formData, order: siblings.length })).data;
        },
        onSuccess: () => {
            refresh();
            toast.success(editingItem ? 'Élément mis à jour' : 'Élément ajouté');
            closeModal();
        },
        onError: () => toast.error('Impossible d’enregistrer cet élément'),
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => (await api.delete(`/navigation/${id}`)).data,
        onSuccess: () => {
            refresh();
            setDeleteItem(null);
            toast.success('Élément supprimé');
        },
        onError: () => toast.error('Impossible de supprimer cet élément'),
    });

    const reorderMutation = useMutation({
        mutationFn: async (items: MenuItem[]) => (
            await api.post('/navigation/reorder', items.map((item, order) => ({ id: item.id, order })))
        ).data,
        onSuccess: refresh,
        onError: () => toast.error('Impossible de modifier l’ordre'),
    });

    const openCreate = (location: Location = 'HEADER') => {
        setEditingItem(null);
        setFormData({ ...emptyForm, location });
        setIsModalOpen(true);
    };

    const openEdit = (item: MenuItem) => {
        setEditingItem(item);
        setFormData({
            label: item.label,
            url: item.url,
            location: item.location,
            isActive: item.isActive,
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
        setFormData(emptyForm);
    };

    const move = (items: MenuItem[], index: number, direction: -1 | 1) => {
        const destination = index + direction;
        if (destination < 0 || destination >= items.length) return;
        const reordered = [...items];
        [reordered[index], reordered[destination]] = [reordered[destination], reordered[index]];
        reorderMutation.mutate(reordered);
    };

    const renderMenu = (location: Location, title: string) => {
        const items = menuItems
            .filter(item => item.location === location)
            .sort((a, b) => a.order - b.order);

        return (
            <div className="glass-panel rounded-xl">
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <div>
                        <h2 className="font-semibold text-lg text-white">{title}</h2>
                        <p className="text-sm text-gray-400">{items.length} éléments</p>
                    </div>
                    <button
                        onClick={() => openCreate(location)}
                        className="p-2 text-gold-400 hover:bg-white/10 rounded-lg"
                        aria-label={`Ajouter au ${title}`}
                    >
                        <Plus size={18} />
                    </button>
                </div>
                <div className="p-4 space-y-2">
                    {items.map((item, index) => (
                        <div
                            key={item.id}
                            className={`flex items-center gap-3 p-3 bg-white/5 rounded-lg ${item.isActive ? '' : 'opacity-50'}`}
                        >
                            <div className="flex flex-col">
                                <button
                                    onClick={() => move(items, index, -1)}
                                    disabled={index === 0 || reorderMutation.isPending}
                                    className="text-gray-400 hover:text-white disabled:opacity-20"
                                    aria-label="Monter"
                                >
                                    <ChevronUp size={14} />
                                </button>
                                <button
                                    onClick={() => move(items, index, 1)}
                                    disabled={index === items.length - 1 || reorderMutation.isPending}
                                    className="text-gray-400 hover:text-white disabled:opacity-20"
                                    aria-label="Descendre"
                                >
                                    <ChevronDown size={14} />
                                </button>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm text-white truncate">{item.label}</p>
                                <p className="text-xs text-gray-400 truncate">{item.url}</p>
                            </div>
                            <div className="flex items-center gap-1">
                                <a
                                    href={item.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-1.5 hover:bg-white/10 rounded"
                                    aria-label="Ouvrir le lien"
                                >
                                    <ExternalLink size={14} className="text-gray-400" />
                                </a>
                                <button onClick={() => openEdit(item)} className="p-1.5 hover:bg-white/10 rounded" aria-label="Modifier">
                                    <Pencil size={14} className="text-gray-400" />
                                </button>
                                <button onClick={() => setDeleteItem(item)} className="p-1.5 hover:bg-red-500/10 rounded" aria-label="Supprimer">
                                    <Trash2 size={14} className="text-red-400" />
                                </button>
                            </div>
                        </div>
                    ))}
                    {items.length === 0 && (
                        <p className="text-center py-6 text-gray-400">Aucun élément</p>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white text-glow">Navigation</h1>
                    <p className="text-gold-400/80">Gérez les menus du site</p>
                </div>
                <button
                    onClick={() => openCreate()}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gold-500 to-gold-400 text-navy-950 font-bold rounded-lg"
                >
                    <Plus size={18} />
                    <span>Ajouter</span>
                </button>
            </div>

            {isLoading ? (
                <div className="text-center py-12 text-gold-400">Chargement...</div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {renderMenu('HEADER', 'Menu Header')}
                    {renderMenu('FOOTER', 'Menu Footer')}
                </div>
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={editingItem ? 'Modifier le lien' : 'Ajouter un lien'}
            >
                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        saveMutation.mutate();
                    }}
                    className="space-y-4"
                >
                    <div>
                        <label className="block text-sm text-gray-300 mb-2">Libellé *</label>
                        <input
                            required
                            value={formData.label}
                            onChange={event => setFormData({ ...formData, label: event.target.value })}
                            className="glass-input w-full px-4 py-2 rounded-lg"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-300 mb-2">URL *</label>
                        <input
                            required
                            value={formData.url}
                            onChange={event => setFormData({ ...formData, url: event.target.value })}
                            placeholder="/contact.html"
                            className="glass-input w-full px-4 py-2 rounded-lg"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-300 mb-2">Emplacement</label>
                        <select
                            value={formData.location}
                            onChange={event => setFormData({ ...formData, location: event.target.value as Location })}
                            className="glass-input w-full px-4 py-2 rounded-lg"
                        >
                            <option value="HEADER" className="bg-navy-900">Header</option>
                            <option value="FOOTER" className="bg-navy-900">Footer</option>
                        </select>
                    </div>
                    <label className="flex items-center gap-3 text-gray-300">
                        <input
                            type="checkbox"
                            checked={formData.isActive}
                            onChange={event => setFormData({ ...formData, isActive: event.target.checked })}
                        />
                        Visible sur le site
                    </label>
                    <div className="flex justify-end gap-3 pt-3">
                        <button type="button" onClick={closeModal} className="px-4 py-2 text-gray-300">Annuler</button>
                        <button
                            type="submit"
                            disabled={saveMutation.isPending}
                            className="px-4 py-2 bg-gold-500 text-navy-950 font-bold rounded-lg disabled:opacity-50"
                        >
                            {saveMutation.isPending ? 'Enregistrement…' : 'Enregistrer'}
                        </button>
                    </div>
                </form>
            </Modal>

            <ConfirmDialog
                isOpen={Boolean(deleteItem)}
                onClose={() => setDeleteItem(null)}
                onConfirm={() => deleteItem && deleteMutation.mutate(deleteItem.id)}
                title="Supprimer ce lien ?"
                message={`Le lien « ${deleteItem?.label || ''} » sera supprimé définitivement.`}
                confirmText="Supprimer"
                isLoading={deleteMutation.isPending}
            />
        </div>
    );
}
