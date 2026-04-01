import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, Eye, EyeOff, FileCode, GripVertical, ExternalLink } from 'lucide-react';
import api from '../services/api';
import { useState } from 'react';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { toast } from '../components/Toast';
import RichTextEditor from '../components/RichTextEditor';

interface Page {
    id: string;
    slug: string;
    title: string;
    template: string;
    status: string;
    sections: Section[];
    createdAt: string;
    updatedAt: string;
}

interface Section {
    id: string;
    type: string;
    content: string;
    order: number;
}

const TEMPLATES = ['default', 'landing', 'article', 'contact', 'about'];
const SECTION_TYPES = [
    { value: 'hero', label: 'Hero (Titre + CTA)', icon: '🎯' },
    { value: 'text', label: 'Texte riche', icon: '📝' },
    { value: 'image-text', label: 'Image + Texte', icon: '🖼️' },
    { value: 'cta', label: 'Call to Action', icon: '🔘' },
    { value: 'stats', label: 'Statistiques', icon: '📊' },
    { value: 'testimonials', label: 'Témoignages', icon: '💬' },
    { value: 'faq', label: 'FAQ', icon: '❓' },
];

export default function Pages() {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Page | null>(null);
    const [deleteItem, setDeleteItem] = useState<Page | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        template: 'default',
        status: 'DRAFT',
        sections: [] as { type: string; content: string; order: number }[],
    });

    const { data: pages, isLoading } = useQuery({
        queryKey: ['pages'],
        queryFn: async () => (await api.get('/pages')).data,
    });

    const createMutation = useMutation({
        mutationFn: async (data: typeof formData) => (await api.post('/pages', data)).data,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pages'] });
            toast.success('Page créée avec succès');
            closeModal();
        },
        onError: () => toast.error('Erreur lors de la création'),
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: typeof formData }) =>
            (await api.patch(`/pages/${id}`, data)).data,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pages'] });
            toast.success('Page mise à jour');
            closeModal();
        },
        onError: () => toast.error('Erreur lors de la mise à jour'),
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => (await api.delete(`/pages/${id}`)).data,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pages'] });
            toast.success('Page supprimée');
            setDeleteItem(null);
        },
        onError: () => toast.error('Erreur lors de la suppression'),
    });

    const generateSlug = (title: string) => {
        return title.toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    };

    const openCreateModal = () => {
        setEditingItem(null);
        setFormData({ title: '', slug: '', template: 'default', status: 'DRAFT', sections: [] });
        setIsModalOpen(true);
    };

    const openEditModal = (item: Page) => {
        setEditingItem(item);
        setFormData({
            title: item.title,
            slug: item.slug,
            template: item.template,
            status: item.status,
            sections: item.sections?.map(s => ({ type: s.type, content: s.content, order: s.order })) || [],
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
    };

    const handleTitleChange = (title: string) => {
        setFormData({
            ...formData,
            title,
            slug: editingItem ? formData.slug : generateSlug(title),
        });
    };

    const addSection = (type: string) => {
        const newSection = { type, content: '', order: formData.sections.length };
        setFormData({ ...formData, sections: [...formData.sections, newSection] });
    };

    const updateSectionContent = (index: number, content: string) => {
        const newSections = [...formData.sections];
        newSections[index].content = content;
        setFormData({ ...formData, sections: newSections });
    };

    const removeSection = (index: number) => {
        setFormData({
            ...formData,
            sections: formData.sections.filter((_, i) => i !== index).map((s, i) => ({ ...s, order: i })),
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title.trim() || !formData.slug.trim()) {
            toast.warning('Veuillez remplir le titre et le slug');
            return;
        }
        if (editingItem) {
            updateMutation.mutate({ id: editingItem.id, data: formData });
        } else {
            createMutation.mutate(formData);
        }
    };

    const isPending = createMutation.isPending || updateMutation.isPending;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white text-glow">Pages</h1>
                    <p className="text-gold-400/80">Gérez les pages de votre site</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gold-500 to-gold-400 text-navy-950 rounded-lg font-bold hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] transition-all"
                >
                    <Plus size={18} />
                    <span>Nouvelle page</span>
                </button>
            </div>

            {isLoading ? (
                <div className="text-center py-12 text-gold-400">Chargement...</div>
            ) : (
                <div className="glass-panel rounded-xl overflow-hidden border border-white/10">
                    <table className="w-full">
                        <thead className="bg-black/20 border-b border-white/10">
                            <tr>
                                <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase">Page</th>
                                <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase">Template</th>
                                <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase">Statut</th>
                                <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase">Sections</th>
                                <th className="text-right px-6 py-3 text-xs font-medium text-gray-400 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {(pages || []).map((item: Page) => (
                                <tr key={item.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <FileCode className="text-gold-400" size={20} />
                                            <div>
                                                <p className="font-medium text-white">{item.title}</p>
                                                <p className="text-xs text-gray-400">/{item.slug}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs bg-white/5 border border-white/10 text-gray-300 px-2 py-1 rounded capitalize">{item.template}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {item.status === 'PUBLISHED' ? (
                                            <span className="inline-flex items-center gap-1 text-xs text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-1 rounded">
                                                <Eye size={12} /> Publié
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-xs text-gray-400 bg-white/5 border border-white/10 px-2 py-1 rounded">
                                                <EyeOff size={12} /> Brouillon
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-300">{item.sections?.length || 0}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-end gap-1">
                                            <a href={`/${item.slug}.html`} target="_blank" className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors">
                                                <ExternalLink size={16} />
                                            </a>
                                            <button onClick={() => openEditModal(item)} className="p-2 text-gray-400 hover:text-gold-400 hover:bg-white/10 rounded-lg transition-colors">
                                                <Edit2 size={16} />
                                            </button>
                                            <button onClick={() => setDeleteItem(item)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {(!pages || pages.length === 0) && (
                        <div className="text-center py-12 text-gray-400">
                            Aucune page. Cliquez sur "Nouvelle page" pour commencer.
                        </div>
                    )}
                </div>
            )}

            {/* Create/Edit Modal */}
            <Modal isOpen={isModalOpen} onClose={closeModal} title={editingItem ? 'Modifier la page' : 'Nouvelle page'} size="xl">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Titre *</label>
                            <input type="text" value={formData.title} onChange={(e) => handleTitleChange(e.target.value)}
                                className="glass-input w-full px-4 py-2 rounded-lg" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Slug (URL) *</label>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-400">/</span>
                                <input type="text" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    className="glass-input flex-1 px-3 py-2 rounded-lg font-mono text-sm" />
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Template</label>
                            <select value={formData.template} onChange={(e) => setFormData({ ...formData, template: e.target.value })}
                                className="glass-input w-full px-4 py-2 rounded-lg capitalize">
                                {TEMPLATES.map(t => <option key={t} value={t} className="capitalize bg-navy-950 text-white">{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Statut</label>
                            <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="glass-input w-full px-4 py-2 rounded-lg">
                                <option value="DRAFT" className="bg-navy-950 text-white">Brouillon</option>
                                <option value="PUBLISHED" className="bg-navy-950 text-white">Publié</option>
                            </select>
                        </div>
                    </div>

                    {/* Sections */}
                    <div className="border-t border-white/10 pt-4">
                        <div className="flex justify-between items-center mb-3">
                            <label className="text-sm font-medium text-gray-300">Sections</label>
                            <div className="relative group">
                                <button type="button" className="text-sm text-gold-400 hover:text-gold-300 transition-colors font-medium">+ Ajouter une section</button>
                                <div className="absolute right-0 top-full mt-1 glass-panel border border-white/10 rounded-lg py-2 min-w-[200px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                                    {SECTION_TYPES.map(st => (
                                        <button key={st.value} type="button" onClick={() => addSection(st.value)}
                                            className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/5 flex items-center gap-2 transition-colors">
                                            <span>{st.icon}</span> {st.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        {formData.sections.length === 0 && (
                            <p className="text-sm text-gray-400 text-center py-4">Aucune section. Ajoutez des sections pour construire votre page.</p>
                        )}
                        <div className="space-y-3">
                            {formData.sections.map((section, index) => {
                                const sectionType = SECTION_TYPES.find(st => st.value === section.type);
                                return (
                                    <div key={index} className="border border-white/10 rounded-xl p-4 bg-white/5">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <GripVertical className="text-gray-400 cursor-grab" size={16} />
                                                <span className="text-sm font-medium text-white">{sectionType?.icon} {sectionType?.label}</span>
                                            </div>
                                            <button type="button" onClick={() => removeSection(index)} className="text-gray-400 hover:text-red-400 transition-colors">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                        {section.type === 'text' ? (
                                            <RichTextEditor content={section.content} onChange={(c) => updateSectionContent(index, c)} placeholder="Contenu de la section..." />
                                        ) : (
                                            <textarea value={section.content} onChange={(e) => updateSectionContent(index, e.target.value)} rows={3}
                                                className="glass-input w-full px-3 py-2 rounded-lg text-sm resize-none" placeholder="Contenu JSON ou texte..." />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex gap-3 justify-end pt-4 border-t border-white/10">
                        <button type="button" onClick={closeModal} className="px-4 py-2 text-gray-300 bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg font-medium transition-colors">Annuler</button>
                        <button type="submit" disabled={isPending} className="px-4 py-2 bg-gradient-to-r from-gold-500 to-gold-400 text-navy-950 rounded-lg font-bold hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] disabled:opacity-50 transition-all">
                            {isPending ? 'Enregistrement...' : editingItem ? 'Mettre à jour' : 'Créer'}
                        </button>
                    </div>
                </form>
            </Modal>

            <ConfirmDialog isOpen={!!deleteItem} onClose={() => setDeleteItem(null)} onConfirm={() => deleteItem && deleteMutation.mutate(deleteItem.id)}
                title="Supprimer cette page ?" message={`"${deleteItem?.title}" sera définitivement supprimée.`} confirmText="Supprimer" isLoading={deleteMutation.isPending} />
        </div>
    );
}
