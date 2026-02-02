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
                    <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
                    <p className="text-gray-500">Configuration générale du site</p>
                </div>
                <button
                    onClick={handleSubmit}
                    disabled={saveMutation.isPending}
                    className="flex items-center gap-2 px-4 py-2 bg-navy-900 text-white rounded-lg hover:bg-navy-800 transition-colors disabled:opacity-50"
                >
                    <Save size={18} />
                    <span>{saveMutation.isPending ? 'Sauvegarde...' : 'Sauvegarder'}</span>
                </button>
            </div>

            {/* Save Result Toast */}
            {saveResult && (
                <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${saveResult.success
                    ? 'bg-green-50 border border-green-200 text-green-800'
                    : 'bg-red-50 border border-red-200 text-red-800'
                    }`}>
                    {saveResult.success ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    <span>{saveResult.message}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Site Identity */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-4">
                        <Globe size={20} className="text-navy-900" />
                        <h2 className="text-lg font-semibold">Identité du site</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nom du site</label>
                            <input
                                type="text"
                                value={formData.site_name}
                                onChange={(e) => handleChange('site_name', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                                placeholder="Astauria"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Slogan</label>
                            <input
                                type="text"
                                value={formData.site_tagline}
                                onChange={(e) => handleChange('site_tagline', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                                placeholder="IA & Automatisation"
                            />
                        </div>
                    </div>
                </div>

                {/* Footer Template Selection */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-4">
                        <Layout size={20} className="text-indigo-500" />
                        <h2 className="text-lg font-semibold">Template Footer</h2>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">Choisissez la disposition du footer</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {FOOTER_TEMPLATES.map((template) => (
                            <div
                                key={template.id}
                                onClick={() => handleChange('footer_template', template.id)}
                                className={`relative cursor-pointer p-4 rounded-xl border-2 transition-all ${formData.footer_template === template.id
                                    ? 'border-gold-500 bg-gold-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                {formData.footer_template === template.id && (
                                    <div className="absolute top-2 right-2 w-5 h-5 bg-gold-500 rounded-full flex items-center justify-center">
                                        <CheckCircle size={14} className="text-white" />
                                    </div>
                                )}
                                <pre className="text-xs font-mono text-gray-400 mb-3 bg-gray-100 p-2 rounded">
                                    {template.preview}
                                </pre>
                                <h3 className="font-semibold text-gray-900">{template.name}</h3>
                                <p className="text-xs text-gray-500">{template.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Address */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-4">
                        <MapPin size={20} className="text-red-500" />
                        <h2 className="text-lg font-semibold">Adresse (Footer)</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ligne 1</label>
                            <input
                                type="text"
                                value={formData.address_line1}
                                onChange={(e) => handleChange('address_line1', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                                placeholder="123 Rue de l'Innovation"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ligne 2 (optionnel)</label>
                            <input
                                type="text"
                                value={formData.address_line2}
                                onChange={(e) => handleChange('address_line2', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                                placeholder="Bâtiment A, 2ème étage"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Code postal</label>
                            <input
                                type="text"
                                value={formData.address_zip}
                                onChange={(e) => handleChange('address_zip', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                                placeholder="75001"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                            <input
                                type="text"
                                value={formData.address_city}
                                onChange={(e) => handleChange('address_city', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                                placeholder="Paris"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Pays</label>
                            <input
                                type="text"
                                value={formData.address_country}
                                onChange={(e) => handleChange('address_country', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                                placeholder="France"
                            />
                        </div>
                    </div>
                </div>

                {/* Contact */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-4">
                        <Phone size={20} className="text-green-500" />
                        <h2 className="text-lg font-semibold">Contact</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="email"
                                    value={formData.contact_email}
                                    onChange={(e) => handleChange('contact_email', e.target.value)}
                                    className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                                    placeholder="contact@astauria.com"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                            <div className="relative">
                                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="tel"
                                    value={formData.contact_phone}
                                    onChange={(e) => handleChange('contact_phone', e.target.value)}
                                    className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                                    placeholder="+33 1 23 45 67 89"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Social */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-4">
                        <Globe size={20} className="text-blue-500" />
                        <h2 className="text-lg font-semibold">Réseaux sociaux</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                            <input
                                type="url"
                                value={formData.social_linkedin}
                                onChange={(e) => handleChange('social_linkedin', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                                placeholder="https://linkedin.com/company/astauria"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Twitter / X</label>
                            <input
                                type="url"
                                value={formData.social_twitter}
                                onChange={(e) => handleChange('social_twitter', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                                placeholder="https://twitter.com/astauria"
                            />
                        </div>
                    </div>
                </div>

                {/* Colors */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-4">
                        <Palette size={20} className="text-purple-500" />
                        <h2 className="text-lg font-semibold">Couleurs</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Couleur principale</label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="color"
                                    value={formData.primary_color}
                                    onChange={(e) => handleChange('primary_color', e.target.value)}
                                    className="w-12 h-10 rounded cursor-pointer border-0"
                                />
                                <input
                                    type="text"
                                    value={formData.primary_color}
                                    onChange={(e) => handleChange('primary_color', e.target.value)}
                                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent font-mono text-sm"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Couleur secondaire (accent)</label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="color"
                                    value={formData.secondary_color}
                                    onChange={(e) => handleChange('secondary_color', e.target.value)}
                                    className="w-12 h-10 rounded cursor-pointer border-0"
                                />
                                <input
                                    type="text"
                                    value={formData.secondary_color}
                                    onChange={(e) => handleChange('secondary_color', e.target.value)}
                                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent font-mono text-sm"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Custom CSS */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-4">
                        <Code size={20} className="text-orange-500" />
                        <h2 className="text-lg font-semibold">CSS Personnalisé</h2>
                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">Avancé</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">
                        Ajoutez du CSS personnalisé pour modifier le design du site. Ces styles seront injectés dans toutes les pages.
                    </p>
                    <textarea
                        value={formData.custom_css}
                        onChange={(e) => handleChange('custom_css', e.target.value)}
                        className="w-full h-48 px-4 py-3 border border-gray-200 rounded-lg font-mono text-sm focus:ring-2 focus:ring-gold-500 focus:border-transparent bg-gray-900 text-green-400"
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
                    <p className="mt-2 text-xs text-gray-400">
                        ⚠️ Attention : un CSS incorrect peut casser l'affichage du site.
                    </p>
                </div>
            </form>

            {/* Info */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl text-blue-800 text-sm">
                <strong>💡 Astuce :</strong> Après avoir modifié les paramètres, retournez au Dashboard et cliquez sur <strong>"Publier le site"</strong> pour appliquer les changements.
            </div>
        </div>
    );
}
