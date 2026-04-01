import { useState, useEffect } from 'react';
import { Sparkles, Loader2, FileText, Wand2, ListTree, PenLine, X, ChevronRight, GripVertical } from 'lucide-react';
import api from '../services/api';
import { toast } from './Toast';

interface AiArticleGeneratorProps {
    isOpen: boolean;
    onClose: () => void;
    onGenerated: (data: {
        title: string;
        slug: string;
        excerpt: string;
        content: string;
        tags: string[];
        category: string;
    }) => void;
}

interface OutlineSection {
    title: string;
    description: string;
}

const LENGTH_OPTIONS = [
    { value: 500, label: 'Court', desc: '~500 mots' },
    { value: 1000, label: 'Moyen', desc: '~1000 mots' },
    { value: 2000, label: 'Long', desc: '~2000 mots' },
];

const TONE_OPTIONS = [
    { value: 'professional', label: 'Professionnel' },
    { value: 'expert', label: 'Expert technique' },
    { value: 'friendly', label: 'Accessible' },
    { value: 'persuasive', label: 'Persuasif' },
];

type Step = 'config' | 'outline' | 'generating' | 'done';

export default function AiArticleGenerator({ isOpen, onClose, onGenerated }: AiArticleGeneratorProps) {
    const [step, setStep] = useState<Step>('config');
    const [subject, setSubject] = useState('');
    const [keyword, setKeyword] = useState('');
    const [tone, setTone] = useState('professional');
    const [length, setLength] = useState(1000);
    const [outline, setOutline] = useState<OutlineSection[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [generatedContent, setGeneratedContent] = useState('');
    const [generatedExcerpt, setGeneratedExcerpt] = useState('');
    const [generatedTags, setGeneratedTags] = useState<string[]>([]);
    const [providerInfo, setProviderInfo] = useState<{provider: string; model: string} | null>(null);

    useEffect(() => {
        api.get('/ai/provider').then(r => setProviderInfo(r.data)).catch(() => {});
    }, []);

    useEffect(() => {
        if (!isOpen) {
            setStep('config');
            setSubject('');
            setKeyword('');
            setOutline([]);
            setGeneratedContent('');
            setGeneratedExcerpt('');
            setGeneratedTags([]);
        }
    }, [isOpen]);

    const generateSlug = (title: string) => {
        return title.toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    };

    const handleGenerateOutline = async () => {
        if (!subject.trim()) { toast.warning('Entrez un sujet pour l\'article.'); return; }
        setIsLoading(true);
        try {
            const { data } = await api.post('/ai/generate', {
                action: 'generate_outline',
                text: subject,
                keyword,
                length,
                tone,
            });

            let parsed: OutlineSection[] = [];
            try {
                // Try to parse JSON from the response
                const jsonMatch = data.content.match(/\[[\s\S]*\]/);
                if (jsonMatch) {
                    parsed = JSON.parse(jsonMatch[0]);
                }
            } catch {
                // Fallback: Create a basic outline
                parsed = [
                    { title: `Introduction : ${subject}`, description: 'Contexte et enjeux.' },
                    { title: 'Les avantages clés', description: 'Bénéfices concrets et mesurables.' },
                    { title: 'Méthodologie', description: 'Comment mettre en place.' },
                    { title: 'Conclusion', description: 'Synthèse et appel à l\'action.' },
                ];
            }
            setOutline(parsed);
            setStep('outline');
        } catch {
            toast.error('Erreur lors de la génération du plan.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateArticle = async () => {
        setStep('generating');
        setIsLoading(true);
        try {
            // 1. Generate full article
            const { data: articleData } = await api.post('/ai/generate', {
                action: 'generate_full_article',
                text: subject,
                keyword,
                length,
                tone,
                outline: JSON.stringify(outline),
            });
            setGeneratedContent(articleData.content);

            // 2. Generate excerpt
            const { data: excerptData } = await api.post('/ai/generate', {
                action: 'generate_excerpt',
                text: articleData.content.substring(0, 2000),
                keyword,
            });
            setGeneratedExcerpt(excerptData.content);

            // 3. Generate tags
            const { data: tagsData } = await api.post('/ai/generate', {
                action: 'suggest_tags',
                text: articleData.content.substring(0, 2000),
                keyword,
            });
            let tags: string[] = [];
            try {
                const jsonMatch = tagsData.content.match(/\[[\s\S]*\]/);
                if (jsonMatch) tags = JSON.parse(jsonMatch[0]);
            } catch {
                tags = [keyword || 'IA', 'automatisation', 'B2B'];
            }
            setGeneratedTags(tags);

            setStep('done');
            toast.success('Article généré avec succès !');
        } catch {
            toast.error('Erreur lors de la génération de l\'article.');
            setStep('outline');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAccept = () => {
        // Extract title from H1 if present, otherwise use subject
        const h1Match = generatedContent.match(/<h1[^>]*>(.*?)<\/h1>/i);
        const title = h1Match ? h1Match[1].replace(/<[^>]*>/g, '') : subject;

        onGenerated({
            title,
            slug: generateSlug(title),
            excerpt: generatedExcerpt,
            content: generatedContent,
            tags: generatedTags,
            category: 'IA & Machine Learning',
        });
        onClose();
    };

    const updateOutlineSection = (index: number, field: keyof OutlineSection, value: string) => {
        setOutline(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s));
    };

    const removeOutlineSection = (index: number) => {
        setOutline(prev => prev.filter((_, i) => i !== index));
    };

    const addOutlineSection = () => {
        setOutline(prev => [...prev, { title: 'Nouvelle section', description: '' }]);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-navy-950/80 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-3xl max-h-[90vh] glass-panel border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-gradient-to-r from-gold-500/10 to-purple-500/10 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-500 to-gold-400 flex items-center justify-center">
                            <Sparkles size={20} className="text-navy-950" />
                        </div>
                        <div>
                            <h2 className="font-bold text-white text-lg">Générateur d'Article IA</h2>
                            <p className="text-xs text-gray-400">
                                {providerInfo
                                    ? `${providerInfo.provider === 'mock' ? '⚠️ Mode simulation' : `✅ ${providerInfo.model}`}`
                                    : 'Chargement...'}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Steps indicator */}
                <div className="flex items-center gap-2 px-6 py-3 border-b border-white/5 bg-black/10 shrink-0">
                    {(['config', 'outline', 'generating', 'done'] as Step[]).map((s, i) => {
                        const labels = ['Configuration', 'Plan', 'Rédaction', 'Terminé'];
                        const icons = [PenLine, ListTree, Wand2, FileText];
                        const Icon = icons[i];
                        const isCurrent = step === s;
                        const isPast = ['config', 'outline', 'generating', 'done'].indexOf(step) > i;
                        return (
                            <div key={s} className="flex items-center gap-2">
                                {i > 0 && <ChevronRight size={14} className="text-gray-600" />}
                                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                    isCurrent ? 'bg-gold-500/20 text-gold-400 border border-gold-500/30'
                                    : isPast ? 'bg-green-500/10 text-green-400'
                                    : 'text-gray-500'
                                }`}>
                                    <Icon size={12} />
                                    {labels[i]}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">

                    {/* Step 1: Config */}
                    {step === 'config' && (
                        <div className="space-y-5 max-w-xl mx-auto">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Sujet de l'article *</label>
                                <textarea
                                    value={subject}
                                    onChange={e => setSubject(e.target.value)}
                                    placeholder="Ex: Comment l'IA transforme la gestion de trésorerie des PME en 2026"
                                    rows={3}
                                    className="glass-input w-full px-4 py-3 rounded-xl resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Mot-clé SEO cible</label>
                                <input
                                    type="text"
                                    value={keyword}
                                    onChange={e => setKeyword(e.target.value)}
                                    placeholder="Ex: automatisation trésorerie"
                                    className="glass-input w-full px-4 py-2 rounded-lg"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Longueur</label>
                                    <div className="flex gap-2">
                                        {LENGTH_OPTIONS.map(opt => (
                                            <button
                                                key={opt.value}
                                                type="button"
                                                onClick={() => setLength(opt.value)}
                                                className={`flex-1 px-3 py-2.5 rounded-lg text-xs font-medium border transition-all ${
                                                    length === opt.value
                                                        ? 'bg-gold-500/20 border-gold-500/30 text-gold-400'
                                                        : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                                                }`}
                                            >
                                                <div className="font-bold">{opt.label}</div>
                                                <div className="text-[10px] opacity-70">{opt.desc}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Tonalité</label>
                                    <select
                                        value={tone}
                                        onChange={e => setTone(e.target.value)}
                                        className="glass-input w-full px-4 py-2.5 rounded-lg"
                                    >
                                        {TONE_OPTIONS.map(t => (
                                            <option key={t.value} value={t.value} className="bg-navy-900">{t.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Outline */}
                    {step === 'outline' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-white font-semibold">Plan de l'article</h3>
                                <button
                                    type="button"
                                    onClick={addOutlineSection}
                                    className="text-xs text-gold-400 hover:text-gold-300 font-medium"
                                >
                                    + Ajouter une section
                                </button>
                            </div>
                            <p className="text-xs text-gray-400 mb-4">Modifiez, réorganisez ou supprimez les sections avant de lancer la rédaction.</p>

                            {outline.map((section, index) => (
                                <div key={index} className="flex items-start gap-3 p-4 bg-white/5 border border-white/10 rounded-xl group hover:bg-white/[0.07] transition-colors">
                                    <GripVertical size={16} className="text-gray-600 mt-2 shrink-0" />
                                    <div className="flex-1 space-y-2">
                                        <input
                                            type="text"
                                            value={section.title}
                                            onChange={e => updateOutlineSection(index, 'title', e.target.value)}
                                            className="w-full bg-transparent text-white font-medium text-sm outline-none border-b border-transparent focus:border-gold-500/30 pb-1 transition-colors"
                                        />
                                        <input
                                            type="text"
                                            value={section.description}
                                            onChange={e => updateOutlineSection(index, 'description', e.target.value)}
                                            placeholder="Description du contenu..."
                                            className="w-full bg-transparent text-gray-400 text-xs outline-none"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeOutlineSection(index)}
                                        className="p-1 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Step 3: Generating */}
                    {step === 'generating' && (
                        <div className="flex flex-col items-center justify-center py-16">
                            <div className="relative mb-6">
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gold-500/20 to-purple-500/20 flex items-center justify-center animate-pulse">
                                    <Sparkles size={32} className="text-gold-400" />
                                </div>
                                <Loader2 size={80} className="absolute inset-0 animate-spin text-gold-500/30" />
                            </div>
                            <p className="text-white font-semibold text-lg mb-2">Rédaction en cours...</p>
                            <p className="text-gray-400 text-sm">L'IA génère votre article, résumé et tags.</p>
                            <p className="text-gray-500 text-xs mt-4">Cela peut prendre 15 à 30 secondes.</p>
                        </div>
                    )}

                    {/* Step 4: Done */}
                    {step === 'done' && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 text-green-400 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3">
                                <FileText size={18} />
                                <span className="text-sm font-medium">Article généré avec succès ! Vérifiez l'aperçu ci-dessous.</span>
                            </div>

                            {generatedExcerpt && (
                                <div>
                                    <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Méta-description</h4>
                                    <p className="text-sm text-gray-300 bg-white/5 border border-white/10 rounded-lg px-4 py-3">{generatedExcerpt}</p>
                                </div>
                            )}

                            {generatedTags.length > 0 && (
                                <div>
                                    <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Tags suggérés</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {generatedTags.map((tag, i) => (
                                            <span key={i} className="px-3 py-1 bg-gold-500/10 border border-gold-500/20 rounded-full text-xs text-gold-400">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div>
                                <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Aperçu du contenu</h4>
                                <div className="bg-white/5 border border-white/10 rounded-xl p-6 max-h-[400px] overflow-y-auto custom-scrollbar">
                                    <div
                                        className="prose prose-sm prose-invert max-w-none prose-headings:text-white prose-a:text-gold-400"
                                        dangerouslySetInnerHTML={{ __html: generatedContent }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-navy-900/95 backdrop-blur-xl shrink-0">
                    <button
                        type="button"
                        onClick={() => {
                            if (step === 'outline') setStep('config');
                            else if (step === 'done') setStep('outline');
                            else onClose();
                        }}
                        className="px-4 py-2 text-gray-300 hover:text-white bg-white/5 border border-white/10 rounded-lg text-sm font-medium transition-colors"
                    >
                        {step === 'config' ? 'Annuler' : '← Retour'}
                    </button>

                    <div className="flex gap-3">
                        {step === 'config' && (
                            <button
                                type="button"
                                onClick={handleGenerateOutline}
                                disabled={isLoading || !subject.trim()}
                                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-gold-500 to-gold-400 text-navy-950 rounded-lg font-bold text-sm hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] disabled:opacity-40 transition-all"
                            >
                                {isLoading ? <Loader2 size={16} className="animate-spin" /> : <ListTree size={16} />}
                                Générer le plan
                            </button>
                        )}
                        {step === 'outline' && (
                            <button
                                type="button"
                                onClick={handleGenerateArticle}
                                disabled={outline.length === 0}
                                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-gold-500 to-gold-400 text-navy-950 rounded-lg font-bold text-sm hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] disabled:opacity-40 transition-all"
                            >
                                <Wand2 size={16} />
                                Rédiger l'article complet
                            </button>
                        )}
                        {step === 'done' && (
                            <button
                                type="button"
                                onClick={handleAccept}
                                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-500 to-green-400 text-white rounded-lg font-bold text-sm hover:shadow-[0_0_15px_rgba(34,197,94,0.4)] transition-all"
                            >
                                <FileText size={16} />
                                Utiliser cet article
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
