import { useState } from 'react';
import { Sparkles, Loader2, Lightbulb, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';
import api from '../services/api';
import { toast } from './Toast';

interface AiSeoSuggestionsProps {
    content: string;
    keyword: string;
    onApplySuggestion?: (suggestion: string) => void;
}

export default function AiSeoSuggestions({ content, keyword, onApplySuggestion }: AiSeoSuggestionsProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [seoTitles, setSeoTitles] = useState<string[]>([]);

    const fetchSuggestions = async () => {
        if (!keyword.trim()) {
            toast.warning('Définissez un mot-clé SEO cible d\'abord.');
            return;
        }

        setIsOpen(true);
        setIsLoading(true);
        try {
            // Fetch SEO title ideas
            const { data: titleData } = await api.post('/ai/generate', {
                action: 'seo_ideas',
                text: content.substring(0, 1500),
                keyword,
            });

            // Parse titles from HTML list
            const titleMatches = titleData.content.match(/<li>(.*?)<\/li>/gi) || [];
            const titles = titleMatches.map((m: string) => m.replace(/<\/?li>/gi, '').trim()).filter(Boolean);
            setSeoTitles(titles.slice(0, 5));

            // Build contextual recommendations
            const recs: string[] = [];
            const plainText = content.replace(/<[^>]*>/g, '').toLowerCase();
            const kwLower = keyword.toLowerCase();

            // Check if keyword in first paragraph
            const firstParaEnd = plainText.indexOf('\n') > 0 ? plainText.indexOf('\n') : 200;
            if (!plainText.substring(0, firstParaEnd).includes(kwLower)) {
                recs.push(`Intégrez "${keyword}" dans le premier paragraphe pour renforcer la pertinence.`);
            }

            // Check keyword density
            const wordCount = plainText.split(/\s+/).length;
            const kwCount = (plainText.match(new RegExp(kwLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
            const density = wordCount > 0 ? (kwCount / wordCount) * 100 : 0;
            if (density < 1) {
                recs.push(`Augmentez la fréquence de "${keyword}" (densité actuelle : ${density.toFixed(1)}%, cible : 1-3%).`);
            } else if (density > 3) {
                recs.push(`Réduisez la fréquence de "${keyword}" pour éviter le keyword stuffing (${density.toFixed(1)}%).`);
            }

            // Check headings
            if (!/<h2/i.test(content)) {
                recs.push('Ajoutez au moins 2 sous-titres H2 pour structurer le contenu.');
            }
            if (!new RegExp(`<h[12][^>]*>.*?${kwLower}`, 'i').test(content)) {
                recs.push(`Incluez "${keyword}" dans au moins un titre H2.`);
            }

            // Check content length
            if (wordCount < 300) {
                recs.push(`Allongez votre texte (${wordCount} mots actuellement, minimum recommandé : 300).`);
            }

            // Check images
            if (!/<img/i.test(content)) {
                recs.push('Ajoutez au moins une image avec un attribut alt contenant votre mot-clé.');
            }

            // Check links
            if (!/<a /i.test(content)) {
                recs.push('Ajoutez des liens internes ou externes pour enrichir le maillage.');
            }

            setSuggestions(recs);
        } catch {
            toast.error('Erreur lors de la génération des suggestions.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="mt-3">
            <button
                type="button"
                onClick={() => isOpen ? setIsOpen(false) : fetchSuggestions()}
                className="flex items-center gap-2 text-xs font-medium text-gold-400 hover:text-gold-300 transition-colors"
            >
                <Lightbulb size={14} />
                Suggestions SEO IA
                {isOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>

            {isOpen && (
                <div className="mt-3 glass-panel rounded-xl p-4 border border-gold-500/10 space-y-4">
                    {isLoading ? (
                        <div className="flex items-center gap-3 py-4 justify-center">
                            <Loader2 size={16} className="animate-spin text-gold-400" />
                            <span className="text-xs text-gold-400 animate-pulse">Analyse IA en cours...</span>
                        </div>
                    ) : (
                        <>
                            {/* Recommendations */}
                            {suggestions.length > 0 && (
                                <div>
                                    <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-2.5 flex items-center gap-1.5 text-glow">
                                        <Sparkles size={12} className="text-gold-400 animate-pulse" />
                                        Recommandations Stratégiques
                                    </h4>
                                    <div className="space-y-2">
                                        {suggestions.map((s, i) => (
                                            <div key={i} className="flex items-start gap-2 text-xs text-gray-300 bg-white/5 border border-white/5 rounded-lg px-3 py-2.5 hover:bg-white/10 transition-colors">
                                                <ArrowRight size={12} className="text-gold-500 mt-0.5 shrink-0" />
                                                <span>{s}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {suggestions.length === 0 && !isLoading && (
                                <div className="text-center text-xs text-green-400 py-3 bg-green-500/5 rounded-lg border border-green-500/10">
                                    ✨ Analyse terminée : Votre contenu est parfaitement optimisé !
                                </div>
                            )}

                            {/* SEO Title Ideas */}
                            {seoTitles.length > 0 && (
                                <div className="pt-2">
                                    <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-2.5 text-glow">
                                        Idées de titres SEO
                                    </h4>
                                    <div className="space-y-1.5">
                                        {seoTitles.map((title, i) => (
                                            <button
                                                key={i}
                                                type="button"
                                                onClick={() => {
                                                    if (onApplySuggestion) {
                                                        onApplySuggestion(`<h2>${title}</h2>`);
                                                        toast.success('Titre H2 inséré dans le contenu.');
                                                    }
                                                }}
                                                className="w-full text-left flex items-center gap-2 text-xs text-gray-300 bg-white/5 hover:bg-gold-500/10 hover:text-gold-400 rounded-lg px-3 py-2 transition-colors group"
                                            >
                                                <span className="flex-1">{title}</span>
                                                <span className="text-[10px] text-gray-500 group-hover:text-gold-400 transition-colors">Insérer →</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
