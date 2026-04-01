import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, CheckCircle, AlertCircle, MapPin, Phone, Mail, Globe, Palette, Layout, Code } from 'lucide-react';
import api from '../services/api';
import { useState, useEffect } from 'react';

const FOOTER_TEMPLATES = [
    {
        id: 'original',
        name: 'Original',
        description: 'Design actuel du site',
        preview: '┌────────────┐\n│ ✉ Email    │\n│ 🌐 Website │\n│ Présence   │\n└────────────┘',
    },
    {
        id: 'classic',
        name: 'Classique',
        description: 'Adresse + contact + social',
        preview: '┌────┬────┬────┐\n│Adr │Link│Soc │\n└────┴────┴────┘',
    },
    {
        id: 'centered',
        name: 'Centré',
        description: 'Tout centré verticalement',
        preview: '┌────────────┐\n│   Logo     │\n│   Links    │\n│   Contact  │\n└────────────┘',
    },
    {
        id: 'minimal',
        name: 'Minimaliste',
        description: 'Compact, une seule ligne',
        preview: '┌────────────────────────┐\n│ © 2026 | Liens | Email │\n└────────────────────────┘',
    },
];

export default function Settings() {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({
        site_name: '',
        site_tagline: '',
        contact_email: '',
        contact_phone: '',
        address_line1: '',
        address_line2: '',
        address_city: '',
        address_zip: '',
        address_country: '',
        social_linkedin: '',
        social_twitter: '',
        primary_color: '#0a1930',
        secondary_color: '#d4af37',
        footer_template: 'original',
        custom_css: '',
    });
    const [saveResult, setSaveResult] = useState<{ success: boolean; message: string } | null>(null);

    const { data: settings, isLoading } = useQuery({
        queryKey: ['settings'],
        queryFn: async () => (await api.get('/settings')).data,
    });

    useEffect(() => {
        if (settings) {
            setFormData(prev => ({ ...prev, ...settings }));
        }
    }, [settings]);

    const saveMutation = useMutation({
        mutationFn: async (data: typeof formData) => {
            const res = await api.put('/settings', data);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['settings'] });
            setSaveResult({ success: true, message: 'Paramètres sauvegardés !' });
            setTimeout(() => setSaveResult(null), 3000);
        },
        onError: () => {
            setSaveResult({ success: false, message: 'Erreur lors de la sauvegarde' });
            setTimeout(() => setSaveResult(null), 3000);
        },
    });

    const handleChange = (key: string, value: string) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        saveMutation.mutate(formData);
    };

    if (isLoading) {
        return <div className="text-center py-12 text-gray-500">Chargement...</div>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white text-glow">Paramètres</h1>
                    <p className="text-gold-400/80">Configuration générale du site</p>
                </div>
                <button
                    onClick={handleSubmit}
                    disabled={saveMutation.isPending}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gold-500 to-gold-400 text-navy-950 rounded-lg hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] transition-all font-bold disabled:opacity-50"
                >
                    <Save size={18} />
                    <span>{saveMutation.isPending ? 'Sauvegarde...' : 'Sauvegarder'}</span>
                </button>
            </div>

            {/* Save Result Toast */}
            {saveResult && (
                <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 backdrop-blur-md ${saveResult.success
                    ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                    : 'bg-red-500/10 border border-red-500/20 text-red-400'
                    }`}>
                    {saveResult.success ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    <span>{saveResult.message}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Site Identity */}
                <div className="glass-panel rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <Globe size={20} className="text-gold-400" />
                        <h2 className="text-lg font-semibold text-white">Identité du site</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Nom du site</label>
                            <input
                                type="text"
                                value={formData.site_name}
                                onChange={(e) => handleChange('site_name', e.target.value)}
                                className="glass-input w-full px-4 py-3 rounded-xl"
                                placeholder="Astauria"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Slogan</label>
                            <input
                                type="text"
                                value={formData.site_tagline}
                                onChange={(e) => handleChange('site_tagline', e.target.value)}
                                className="glass-input w-full px-4 py-3 rounded-xl"
                                placeholder="IA & Automatisation"
                            />
                        </div>
                    </div>
                </div>

                {/* Footer Template Selection */}
                <div className="glass-panel rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-2">
                        <Layout size={20} className="text-indigo-400" />
                        <h2 className="text-lg font-semibold text-white">Template Footer</h2>
                    </div>
                    <p className="text-sm text-gray-400 mb-6">Choisissez la disposition du footer</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                        {FOOTER_TEMPLATES.map((template) => (
                            <div
                                key={template.id}
                                onClick={() => handleChange('footer_template', template.id)}
                                className={`relative cursor-pointer p-4 rounded-xl border-2 transition-all ${formData.footer_template === template.id
                                    ? 'border-gold-500 bg-gold-500/10'
                                    : 'border-white/10 hover:border-white/20 bg-white/5'
                                    }`}
                            >
                                {formData.footer_template === template.id && (
                                    <div className="absolute top-2 right-2 w-5 h-5 bg-gold-500 rounded-full flex items-center justify-center">
                                        <CheckCircle size={14} className="text-navy-900" />
                                    </div>
                                )}
                                <pre className="text-xs font-mono text-gray-400 mb-3 bg-navy-950 p-3 rounded-lg border border-white/5 overflow-x-auto">
                                    {template.preview}
                                </pre>
                                <h3 className="font-semibold text-white">{template.name}</h3>
                                <p className="text-xs text-gray-400 mt-1">{template.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Address */}
                <div className="glass-panel rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <MapPin size={20} className="text-red-400" />
                        <h2 className="text-lg font-semibold text-white">Adresse (Footer)</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-300 mb-2">Ligne 1</label>
                            <input
                                type="text"
                                value={formData.address_line1}
                                onChange={(e) => handleChange('address_line1', e.target.value)}
                                className="glass-input w-full px-4 py-3 rounded-xl"
                                placeholder="123 Rue de l'Innovation"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-300 mb-2">Ligne 2 (optionnel)</label>
                            <input
                                type="text"
                                value={formData.address_line2}
                                onChange={(e) => handleChange('address_line2', e.target.value)}
                                className="glass-input w-full px-4 py-3 rounded-xl"
                                placeholder="Bâtiment A, 2ème étage"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Code postal</label>
                            <input
                                type="text"
                                value={formData.address_zip}
                                onChange={(e) => handleChange('address_zip', e.target.value)}
                                className="glass-input w-full px-4 py-3 rounded-xl"
                                placeholder="75001"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Ville</label>
                            <input
                                type="text"
                                value={formData.address_city}
                                onChange={(e) => handleChange('address_city', e.target.value)}
                                className="glass-input w-full px-4 py-3 rounded-xl"
                                placeholder="Paris"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-300 mb-2">Pays</label>
                            <input
                                type="text"
                                value={formData.address_country}
                                onChange={(e) => handleChange('address_country', e.target.value)}
                                className="glass-input w-full px-4 py-3 rounded-xl"
                                placeholder="France"
                            />
                        </div>
                    </div>
                </div>

                {/* Contact */}
                <div className="glass-panel rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <Phone size={20} className="text-green-400" />
                        <h2 className="text-lg font-semibold text-white">Contact</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                            <div className="relative">
                                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gold-400" />
                                <input
                                    type="email"
                                    value={formData.contact_email}
                                    onChange={(e) => handleChange('contact_email', e.target.value)}
                                    className="glass-input w-full pl-12 pr-4 py-3 rounded-xl"
                                    placeholder="contact@astauria.com"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Téléphone</label>
                            <div className="relative">
                                <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gold-400" />
                                <input
                                    type="tel"
                                    value={formData.contact_phone}
                                    onChange={(e) => handleChange('contact_phone', e.target.value)}
                                    className="glass-input w-full pl-12 pr-4 py-3 rounded-xl"
                                    placeholder="+33 1 23 45 67 89"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Social */}
                <div className="glass-panel rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <Globe size={20} className="text-blue-400" />
                        <h2 className="text-lg font-semibold text-white">Réseaux sociaux</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">LinkedIn</label>
                            <input
                                type="url"
                                value={formData.social_linkedin}
                                onChange={(e) => handleChange('social_linkedin', e.target.value)}
                                className="glass-input w-full px-4 py-3 rounded-xl"
                                placeholder="https://linkedin.com/company/astauria"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Twitter / X</label>
                            <input
                                type="url"
                                value={formData.social_twitter}
                                onChange={(e) => handleChange('social_twitter', e.target.value)}
                                className="glass-input w-full px-4 py-3 rounded-xl"
                                placeholder="https://twitter.com/astauria"
                            />
                        </div>
                    </div>
                </div>

                {/* Colors */}
                <div className="glass-panel rounded-xl p-6 hidden">
                    <div className="flex items-center gap-2 mb-6">
                        <Palette size={20} className="text-purple-400" />
                        <h2 className="text-lg font-semibold text-white">Couleurs (Désactivé)</h2>
                    </div>
                    <p className="text-sm text-gray-400 mb-4">Les couleurs du site public sont gérées directement via le thème Glassmorphism de l'Axe 3.</p>
                </div>

                {/* Custom CSS */}
                <div className="glass-panel rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Code size={20} className="text-orange-400" />
                        <h2 className="text-lg font-semibold text-white">CSS Personnalisé</h2>
                        <span className="text-xs bg-orange-500/10 border border-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full font-medium">Avancé</span>
                    </div>
                    <p className="text-sm text-gray-400 mb-4">
                        Ajoutez du CSS personnalisé pour modifier le design du site public. Ces styles seront injectés dans toutes les pages.
                    </p>
                    <textarea
                        value={formData.custom_css}
                        onChange={(e) => handleChange('custom_css', e.target.value)}
                        className="w-full h-48 px-4 py-3 border border-white/10 rounded-xl font-mono text-sm focus:ring-2 focus:ring-gold-500 focus:border-transparent bg-navy-950/80 text-green-400 custom-scrollbar resize-none"
                        placeholder={`/* Exemples de personnalisation */

.footer {
  background: linear-gradient(135deg, #0a1930, #1a2940);
}

.footer__address {
  font-size: 14px;
  line-height: 1.6;
}

.btn-primary {
  border-radius: 8px;
}`}
                    />
                    <p className="mt-3 text-xs text-gold-500">
                        ⚠️ Attention : un CSS incorrect peut casser l'affichage du site.
                    </p>
                </div>
            </form>

            {/* Info */}
            <div className="mt-8 p-5 bg-gold-500/10 border border-gold-500/20 rounded-xl text-gold-400 text-sm">
                <strong className="text-gold-300">💡 Astuce :</strong> Après avoir modifié les paramètres, retournez au Dashboard et cliquez sur <strong>"Publier le site"</strong> pour appliquer les changements en production.
            </div>
        </div>
    );
}
