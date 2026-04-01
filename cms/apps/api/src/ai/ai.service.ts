import { Injectable, Logger } from '@nestjs/common';
import { GenerateDto, AiTone } from './dto/generate.dto';

type AiProvider = 'openai' | 'ollama' | 'mock';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private provider: AiProvider = 'mock';
  private openai: any = null;
  private ollamaBaseUrl: string = '';
  private ollamaModel: string = 'mistral';

  constructor() {
    this.initProvider();
  }

  private async initProvider() {
    // Priority 1: OpenAI
    const openaiKey = process.env.OPENAI_API_KEY;
    if (openaiKey && openaiKey.length > 0) {
      try {
        const OpenAI = (await import('openai')).default;
        this.openai = new OpenAI({ apiKey: openaiKey });
        this.provider = 'openai';
        this.logger.log('✅ AI Provider: OpenAI (gpt-4o-mini)');
        return;
      } catch (e) {
        this.logger.warn('OpenAI SDK import failed, trying Ollama...');
      }
    }

    // Priority 2: Ollama (local)
    const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
    const ollamaModel = process.env.OLLAMA_MODEL || 'mistral';
    try {
      const res = await fetch(`${ollamaUrl}/api/tags`, { signal: AbortSignal.timeout(2000) });
      if (res.ok) {
        this.ollamaBaseUrl = ollamaUrl;
        this.ollamaModel = ollamaModel;
        this.provider = 'ollama';
        const data = await res.json();
        const models = (data.models || []).map((m: any) => m.name).join(', ');
        this.logger.log(`✅ AI Provider: Ollama (${ollamaModel}) — Available models: ${models}`);
        return;
      }
    } catch {
      // Ollama not available
    }

    // Fallback: Mock
    this.provider = 'mock';
    this.logger.warn('⚠️ AI Provider: Mock (no OPENAI_API_KEY or Ollama detected). Set OPENAI_API_KEY or run Ollama locally.');
  }

  async getProviderInfo(): Promise<{ provider: AiProvider; model: string }> {
    const model = this.provider === 'openai' ? 'gpt-4o-mini' 
      : this.provider === 'ollama' ? this.ollamaModel 
      : 'mock-simulation';
    return { provider: this.provider, model };
  }

  async generate(dto: GenerateDto): Promise<string> {
    const { action, text, context, tone, keyword, length: wordLength, outline } = dto;

    const systemPrompt = this.buildSystemPrompt(tone);
    const userPrompt = this.buildUserPrompt(action, text, context, keyword, wordLength, outline);

    if (this.provider === 'openai') {
      return this.callOpenAi(systemPrompt, userPrompt);
    }
    if (this.provider === 'ollama') {
      return this.callOllama(systemPrompt, userPrompt);
    }

    // Mock fallback
    await new Promise(resolve => setTimeout(resolve, 800));
    return this.mockResponse(action, text, keyword);
  }

  // ─── Prompt Building ──────────────────────────────────────────────

  private getToneInstruction(tone?: AiTone): string {
    switch (tone) {
      case AiTone.FRIENDLY: return 'Adoptez un ton amical et accessible, tout en restant crédible.';
      case AiTone.EXPERT: return 'Adoptez un ton d\'expert technique, avec des termes précis et des références concrètes.';
      case AiTone.PERSUASIVE: return 'Adoptez un ton persuasif et orienté conversion, avec des arguments forts.';
      case AiTone.PROFESSIONAL:
      default: return 'Adoptez un ton professionnel et C-level, impactant et concis.';
    }
  }

  private buildSystemPrompt(tone?: AiTone): string {
    return `Vous êtes un expert en rédaction web B2B pour Astauria, un cabinet de conseil spécialisé dans l'Intelligence Artificielle, l'automatisation des processus métiers et la transformation digitale.

Votre expertise couvre : l'IA appliquée aux entreprises, les ERP/CRM, le machine learning, l'automatisation RPA, la data science, et le conseil en stratégie digitale.

${this.getToneInstruction(tone)}

Règles de formatage :
- Fournissez vos réponses au format HTML simple (balises p, strong, em, ul, li, h2, h3 uniquement).
- N'incluez jamais de balises html, head, body ou de document complet.
- Utilisez des paragraphes courts et percutants.
- Intégrez des données chiffrées quand pertinent.`;
  }

  private buildUserPrompt(action: string, text: string, context?: string, keyword?: string, wordLength?: number, outline?: string): string {
    const keywordNote = keyword ? `\nMot-clé SEO à intégrer naturellement : "${keyword}"` : '';
    const lengthNote = wordLength ? `\nLongueur cible : environ ${wordLength} mots.` : '';
    const contextNote = context ? `\nContexte additionnel : ${context}` : '';

    switch (action) {
      case 'reformulate':
        return `Reformulez le texte suivant pour qu'il soit plus professionnel, impactant et fluide. Conservez le sens original.${keywordNote}\n\nTexte à reformuler :\n${text}`;

      case 'expand':
        return `Développez le texte suivant en ajoutant 1 à 2 paragraphes d'explications supplémentaires, pertinents et argumentés.${keywordNote}\n\nTexte à développer :\n${text}`;

      case 'generate':
        return `Rédigez un paragraphe ou une section complète sur le sujet suivant :${keywordNote}${lengthNote}${contextNote}\n\nSujet : "${text}"`;

      case 'seo_ideas':
        return `Proposez 5 idées de titres H2 optimisés pour le SEO basées sur ce sujet. Retournez-les en HTML sous forme de liste <ul><li>.${keywordNote}\n\nSujet : ${text}`;

      case 'generate_outline':
        return `Générez un plan d'article structuré sur le sujet suivant. Retournez le résultat en JSON valide sous la forme :
[{"title": "Le titre H2", "description": "brève description du contenu de la section"}]
Proposez entre 4 et 7 sections logiques.${keywordNote}${lengthNote}\n\nSujet : "${text}"`;

      case 'generate_full_article':
        const outlineData = outline ? `\n\nPlan à suivre :\n${outline}` : '';
        return `Rédigez un article de blog complet et professionnel sur le sujet suivant.${keywordNote}${lengthNote}${outlineData}${contextNote}

Incluez :
- Un titre H1 accrocheur
- Des sous-titres H2 pour chaque section
- Des paragraphes argumentés avec des données concrètes
- Une conclusion avec un appel à l'action vers Astauria

Sujet : "${text}"`;

      case 'generate_excerpt':
        return `Rédigez une méta-description SEO percutante (maximum 160 caractères) pour le texte suivant. Retournez UNIQUEMENT le texte de la description, sans balise HTML.${keywordNote}\n\nTexte :\n${text.substring(0, 2000)}`;

      case 'suggest_tags':
        return `Proposez 5 à 8 tags pertinents pour le texte suivant. Retournez UNIQUEMENT un JSON array de strings, ex: ["tag1","tag2"].${keywordNote}\n\nTexte :\n${text.substring(0, 2000)}`;

      case 'improve_seo':
        return `Améliorez le texte suivant pour le référencement SEO en intégrant naturellement le mot-clé "${keyword || 'non spécifié'}" tout en gardant la fluidité. Veillez à la densité optimale (1-3%).${contextNote}\n\nTexte à optimiser :\n${text}`;

      default:
        return `Traitez cette demande :\n\n${text}`;
    }
  }

  // ─── Providers ────────────────────────────────────────────────────

  private async callOpenAi(systemPrompt: string, userPrompt: string): Promise<string> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });
      return response.choices[0].message?.content || '';
    } catch (error) {
      this.logger.error('OpenAI API Error:', error);
      throw new Error("L'intelligence artificielle est momentanément indisponible.");
    }
  }

  private async callOllama(systemPrompt: string, userPrompt: string): Promise<string> {
    try {
      const response = await fetch(`${this.ollamaBaseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.ollamaModel,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          stream: false,
          options: { temperature: 0.7, num_predict: 2000 },
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama returned ${response.status}`);
      }

      const data = await response.json();
      return data.message?.content || '';
    } catch (error) {
      this.logger.error('Ollama API Error:', error);
      throw new Error("L'intelligence artificielle locale (Ollama) est momentanément indisponible.");
    }
  }

  // ─── Mock Responses ───────────────────────────────────────────────

  private mockResponse(action: string, text: string, keyword?: string): string {
    const kw = keyword || 'automatisation';
    switch (action) {
      case 'reformulate':
        return `<p><em>[Mock IA]</em> Version reformulée :</p><p>L'${kw} des processus métiers constitue un levier stratégique majeur pour les entreprises en quête de performance. En intégrant des solutions d'intelligence artificielle, les organisations peuvent réduire leurs coûts opérationnels de 30% tout en améliorant la qualité de service. <strong>(Configurez OPENAI_API_KEY ou Ollama pour une vraie reformulation)</strong></p>`;

      case 'expand':
        return `${text}<p><em>[Mock IA — Développement]</em> Au-delà du gain d'efficacité, l'${kw} apporte une meilleure traçabilité des opérations et facilite la conformité réglementaire. Les entreprises pionnières constatent un ROI supérieur de 40% par rapport aux approches traditionnelles.</p><p>La convergence de l'IA et de l'${kw} ouvre la voie à des processus auto-apprenants, capables de s'adapter en temps réel aux variations de la demande.</p>`;

      case 'generate':
        return `<h2>${text}</h2><p><em>[Mock IA]</em> L'intelligence artificielle redéfinit les standards du B2B en 2026. Les entreprises qui adoptent l'${kw} constatent une amélioration de 55% de leur productivité opérationnelle.</p><p>Astauria accompagne cette transformation en déployant des solutions sur-mesure : de l'audit initial à l'implémentation, chaque étape est pilotée par des experts chevronnés.</p>`;

      case 'seo_ideas':
        return `<ul><li>Comment l'${kw} transforme les PME en 2026</li><li>5 étapes clés pour réussir sa transformation digitale</li><li>ROI de l'IA : ce que disent les chiffres</li><li>Guide complet de l'${kw} B2B</li><li>Pourquoi choisir un cabinet expert en IA</li></ul>`;

      case 'generate_outline':
        return JSON.stringify([
          { title: `Introduction : L'${kw} en 2026`, description: `Contexte et enjeux actuels de l'${kw} pour les entreprises B2B.` },
          { title: 'Les bénéfices concrets', description: 'Gains de productivité, réduction des coûts et amélioration qualité.' },
          { title: 'Comment démarrer', description: 'Méthodologie en 3 étapes pour lancer un projet d\'automatisation.' },
          { title: 'Étude de cas', description: 'Exemple concret d\'un client Astauria ayant multiplié son ROI par 3.' },
          { title: 'Conclusion et appel à l\'action', description: 'Prochaines étapes et contact Astauria.' },
        ]);

      case 'generate_full_article':
        return `<h1>L'${kw} au service de la performance B2B</h1>
<p><em>[Mock IA — Article complet]</em></p>
<h2>Introduction : Le virage digital de 2026</h2>
<p>En 2026, l'${kw} n'est plus un luxe mais une nécessité stratégique. Les entreprises qui tardent à adopter ces technologies accusent un retard compétitif croissant.</p>
<h2>Les bénéfices concrets de l'${kw}</h2>
<p>Les entreprises ayant adopté l'${kw} constatent en moyenne :</p>
<ul><li><strong>+55%</strong> de productivité opérationnelle</li><li><strong>-30%</strong> de coûts de traitement</li><li><strong>x3</strong> de vitesse de traitement des dossiers</li></ul>
<h2>La méthodologie Astauria en 3 étapes</h2>
<p><strong>Étape 1 : Audit et Diagnostic.</strong> Nos experts analysent vos flux existants pour identifier les quick wins.</p>
<p><strong>Étape 2 : Conception et PoC.</strong> Nous développons un prototype fonctionnel en 4 semaines.</p>
<p><strong>Étape 3 : Déploiement et Optimisation.</strong> Mise en production et suivi des KPIs.</p>
<h2>Conclusion</h2>
<p>La transformation digitale est un voyage, pas une destination. <strong>Contactez Astauria</strong> pour un audit gratuit de vos processus.</p>
<p><strong>(Configurez OPENAI_API_KEY ou Ollama pour un vrai article généré par IA)</strong></p>`;

      case 'generate_excerpt':
        return `Découvrez comment l'${kw} des processus B2B booste la productivité de 55%. Guide expert Astauria avec méthodologie et ROI concrets.`;

      case 'suggest_tags':
        return JSON.stringify([kw, 'intelligence artificielle', 'transformation digitale', 'B2B', 'ROI', 'productivité', 'Astauria']);

      case 'improve_seo':
        return `<p><em>[Mock IA — Optimisation SEO]</em> ${text}</p><p>Grâce à l'${kw}, ce processus devient 3 fois plus efficace. L'${kw} des tâches répétitives libère du temps pour les activités à forte valeur ajoutée.</p>`;

      default:
        return text;
    }
  }
}
