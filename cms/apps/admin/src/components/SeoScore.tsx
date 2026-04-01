import { useMemo } from 'react';
import { CheckCircle2, AlertCircle, XCircle, TrendingUp } from 'lucide-react';

interface SeoScoreProps {
    content: string;
    targetKeyword: string;
    excerpt?: string;
}

interface CriteriaResult {
    label: string;
    detail: string;
    status: 'pass' | 'warn' | 'fail';
    points: number;
    maxPoints: number;
}

export default function SeoScore({ content, targetKeyword, excerpt }: SeoScoreProps) {
    const analysis = useMemo(() => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        const plainText = tempDiv.textContent || tempDiv.innerText || '';

        const wordCount = plainText.trim().split(/\s+/).filter(w => w.length > 0).length;
        const keyword = targetKeyword.trim().toLowerCase();
        const sentences = plainText.split(/[.!?]+/).filter(s => s.trim().length > 5);
        const avgSentenceLength = sentences.length > 0
            ? sentences.reduce((sum, s) => sum + s.trim().split(/\s+/).length, 0) / sentences.length
            : 0;

        const criteria: CriteriaResult[] = [];

        // 1. Word count (max 15 pts)
        let lengthPts = 0;
        let lengthStatus: CriteriaResult['status'] = 'fail';
        if (wordCount >= 600) { lengthPts = 15; lengthStatus = 'pass'; }
        else if (wordCount >= 300) { lengthPts = 10; lengthStatus = 'warn'; }
        else if (wordCount >= 100) { lengthPts = 5; lengthStatus = 'warn'; }
        criteria.push({
            label: 'Longueur du texte',
            detail: `${wordCount} mots (recommandé : >300, idéal : >600)`,
            status: lengthStatus, points: lengthPts, maxPoints: 15,
        });

        // 2. Heading structure (max 15 pts)
        const hasH1 = /<h1[^>]*>.*?<\/h1>/i.test(content);
        const hasH2 = /<h2[^>]*>.*?<\/h2>/i.test(content);
        const h2Count = (content.match(/<h2/gi) || []).length;
        let headingPts = 0;
        if (hasH2 && h2Count >= 2) headingPts = 15;
        else if (hasH1 || hasH2) headingPts = 8;
        criteria.push({
            label: 'Structure (H1/H2)',
            detail: hasH1 || hasH2
                ? `${h2Count} sous-titre(s) H2 détecté(s)${hasH1 ? ' + H1' : ''}`
                : 'Ajoutez des titres H1/H2 pour structurer.',
            status: headingPts >= 15 ? 'pass' : headingPts > 0 ? 'warn' : 'fail',
            points: headingPts, maxPoints: 15,
        });

        // 3. Keyword presence (max 20 pts) — only if keyword defined
        if (keyword) {
            const regex = new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
            const matches = plainText.match(regex);
            const count = matches ? matches.length : 0;
            const density = wordCount > 0 ? (count / wordCount) * 100 : 0;
            let kwPts = 0;
            if (density >= 1 && density <= 3) kwPts = 20;
            else if (count > 0) kwPts = 10;
            criteria.push({
                label: 'Mot-clé dans le texte',
                detail: count > 0
                    ? `"${targetKeyword}" trouvé ${count}x (densité : ${density.toFixed(1)}%, idéal : 1-3%)`
                    : `"${targetKeyword}" absent du texte.`,
                status: kwPts >= 20 ? 'pass' : kwPts > 0 ? 'warn' : 'fail',
                points: kwPts, maxPoints: 20,
            });

            // 4. Keyword in headings (max 10 pts)
            const headingRegex = new RegExp(`<h[12][^>]*>.*?${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}.*?</h[12]>`, 'gi');
            const kwInHeadings = headingRegex.test(content);
            criteria.push({
                label: 'Mot-clé dans les titres',
                detail: kwInHeadings
                    ? `"${targetKeyword}" présent dans un titre H1/H2.`
                    : `Intégrez "${targetKeyword}" dans un titre H2.`,
                status: kwInHeadings ? 'pass' : 'fail',
                points: kwInHeadings ? 10 : 0, maxPoints: 10,
            });
        } else {
            criteria.push({
                label: 'Mot-clé SEO',
                detail: 'Définissez un mot-clé cible pour une analyse complète.',
                status: 'warn', points: 0, maxPoints: 30,
            });
        }

        // 5. Readability / sentence length (max 15 pts)
        let readPts = 0;
        let readStatus: CriteriaResult['status'] = 'fail';
        if (sentences.length > 0) {
            if (avgSentenceLength <= 20 && avgSentenceLength > 5) { readPts = 15; readStatus = 'pass'; }
            else if (avgSentenceLength <= 30) { readPts = 8; readStatus = 'warn'; }
            else { readPts = 3; readStatus = 'fail'; }
        }
        criteria.push({
            label: 'Lisibilité',
            detail: sentences.length > 0
                ? `~${Math.round(avgSentenceLength)} mots/phrase (idéal : 10-20)`
                : 'Pas assez de texte pour évaluer.',
            status: readStatus, points: readPts, maxPoints: 15,
        });

        // 6. Images with alt (max 10 pts)
        const images = content.match(/<img[^>]*>/gi) || [];
        const imagesWithAlt = images.filter(img => /alt="[^"]+"/i.test(img));
        let imgPts = 0;
        if (images.length === 0) imgPts = 5; // no images is acceptable
        else if (imagesWithAlt.length === images.length) imgPts = 10;
        else if (imagesWithAlt.length > 0) imgPts = 5;
        criteria.push({
            label: 'Images (attribut alt)',
            detail: images.length === 0
                ? 'Aucune image détectée (ajoutez-en pour enrichir).'
                : `${imagesWithAlt.length}/${images.length} image(s) avec attribut alt.`,
            status: imgPts >= 10 ? 'pass' : imgPts > 0 ? 'warn' : 'fail',
            points: imgPts, maxPoints: 10,
        });

        // 7. Internal links (max 5 pts)
        const links = content.match(/<a[^>]*href/gi) || [];
        criteria.push({
            label: 'Liens internes',
            detail: links.length > 0
                ? `${links.length} lien(s) détecté(s).`
                : 'Ajoutez des liens pour améliorer le maillage.',
            status: links.length > 0 ? 'pass' : 'warn',
            points: links.length > 0 ? 5 : 0, maxPoints: 5,
        });

        // 8. Excerpt / meta-description (max 10 pts)
        const excerptText = excerpt?.trim() || '';
        let excPts = 0;
        if (excerptText.length >= 50 && excerptText.length <= 160) excPts = 10;
        else if (excerptText.length > 0) excPts = 5;
        criteria.push({
            label: 'Méta-description',
            detail: excerptText.length > 0
                ? `${excerptText.length} caractères (idéal : 120-160)`
                : 'Ajoutez un extrait/résumé pour la méta-description.',
            status: excPts >= 10 ? 'pass' : excPts > 0 ? 'warn' : 'fail',
            points: excPts, maxPoints: 10,
        });

        const totalPoints = criteria.reduce((s, c) => s + c.points, 0);
        const maxPoints = criteria.reduce((s, c) => s + c.maxPoints, 0);
        const score = maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 0;

        return { score, criteria, wordCount };
    }, [content, targetKeyword, excerpt]);

    const getScoreColor = (score: number) => {
        if (score >= 75) return '#22c55e';
        if (score >= 45) return '#f59e0b';
        return '#ef4444';
    };

    const getScoreLabel = (score: number) => {
        if (score >= 75) return 'Excellent';
        if (score >= 45) return 'À améliorer';
        return 'Faible';
    };

    const scoreColor = getScoreColor(analysis.score);
    // SVG circular gauge
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (analysis.score / 100) * circumference;

    const getCriteriaIcon = (status: CriteriaResult['status']) => {
        if (status === 'pass') return <CheckCircle2 size={16} className="text-green-400 shrink-0" />;
        if (status === 'warn') return <AlertCircle size={16} className="text-amber-400 shrink-0" />;
        return <XCircle size={16} className="text-red-400 shrink-0" />;
    };

    return (
        <div className="glass-panel rounded-xl p-5 border border-white/10">
            {/* Header with circular gauge */}
            <div className="flex items-center gap-5 mb-5">
                <div className="relative w-24 h-24 shrink-0">
                    <svg className="w-24 h-24 -rotate-90 drop-shadow-[0_0_8px_rgba(255,255,255,0.05)]" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
                        <circle
                            cx="50" cy="50" r={radius} fill="none"
                            stroke={scoreColor}
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                            style={{ 
                                transition: 'stroke-dashoffset 0.8s ease-out, stroke 0.5s ease',
                                filter: `drop-shadow(0 0 5px ${scoreColor}44)`
                            }}
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-white text-glow">{analysis.score}</span>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider">/ 100</span>
                    </div>
                </div>
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <TrendingUp size={18} style={{ color: scoreColor }} />
                        <h3 className="font-bold text-white text-lg text-glow">Score SEO IA</h3>
                    </div>
                    <p className="text-sm font-medium" style={{ color: scoreColor }}>{getScoreLabel(analysis.score)}</p>
                    <p className="text-xs text-gray-400 mt-1">{analysis.wordCount} mots • {analysis.criteria.length} critères analysés</p>
                </div>
            </div>

            {/* Criteria list */}
            <div className="space-y-3">
                {analysis.criteria.map((c, i) => (
                    <div key={i} className="flex items-start gap-3 group">
                        {getCriteriaIcon(c.status)}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-white">{c.label}</span>
                                <span className={`text-xs font-mono px-1.5 py-0.5 rounded ${
                                    c.status === 'pass' ? 'bg-green-500/10 text-green-400'
                                    : c.status === 'warn' ? 'bg-amber-500/10 text-amber-400'
                                    : 'bg-red-500/10 text-red-400'
                                }`}>{c.points}/{c.maxPoints}</span>
                            </div>
                            <p className="text-xs text-gray-400 mt-0.5">{c.detail}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
