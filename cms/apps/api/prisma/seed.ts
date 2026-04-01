import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding Astauria CMS with real website data...');

    // ========== ADMIN USER ==========
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@astauria.com' },
        update: {},
        create: {
            email: 'admin@astauria.com',
            password: hashedPassword,
            name: 'Admin Astauria',
            role: 'ADMIN',
        },
    });
    console.log('✅ Admin:', admin.email);

    // ========== NAVIGATION - HEADER ==========
    const headerMenuItems = [
        { id: 'nav-1', label: 'Solutions', url: 'solutions.html', order: 0, location: 'HEADER' },
        { id: 'nav-2', label: "Cas d'usage", url: 'cas-usage.html', order: 1, location: 'HEADER' },
        { id: 'nav-3', label: 'Pourquoi Astauria', url: 'pourquoi-astauria.html', order: 2, location: 'HEADER' },
        { id: 'nav-4', label: 'Ressources', url: 'blog.html', order: 3, location: 'HEADER' },
        { id: 'nav-5', label: 'Audit IA', url: 'audit-ia.html', order: 4, location: 'HEADER' },
    ];

    for (const item of headerMenuItems) {
        await prisma.menuItem.upsert({ where: { id: item.id }, update: item, create: item });
    }

    // ========== NAVIGATION - FOOTER ==========
    const footerMenuItems = [
        { id: 'footer-1', label: 'Accueil', url: 'index.html', order: 0, location: 'FOOTER' },
        { id: 'footer-2', label: 'Solutions', url: 'solutions.html', order: 1, location: 'FOOTER' },
        { id: 'footer-3', label: "Cas d'usage", url: 'cas-usage.html', order: 2, location: 'FOOTER' },
        { id: 'footer-4', label: 'Pourquoi Astauria', url: 'pourquoi-astauria.html', order: 3, location: 'FOOTER' },
        { id: 'footer-5', label: 'Ressources', url: 'blog.html', order: 4, location: 'FOOTER' },
        { id: 'footer-6', label: 'Mentions légales', url: 'mentions-legales.html', order: 5, location: 'FOOTER' },
        { id: 'footer-7', label: 'Confidentialité', url: 'politique-confidentialite.html', order: 6, location: 'FOOTER' },
    ];

    for (const item of footerMenuItems) {
        await prisma.menuItem.upsert({ where: { id: item.id }, update: item, create: item });
    }
    console.log('✅ Navigation: 12 menu items');

    // ========== FAQ (6 questions from index.html) ==========
    const faqs = [
        {
            id: 'faq-1',
            question: 'Combien coûte un projet IA typique ?',
            answer: "Nos projets commencent généralement à partir de 5 000€ pour un POC (preuve de concept) et peuvent aller jusqu'à 50 000€+ pour des solutions complètes. L'audit IA gratuit permet de cadrer précisément votre besoin et d'estimer le budget avant tout engagement.",
            order: 0,
        },
        {
            id: 'faq-2',
            question: 'Combien de temps faut-il pour déployer une solution IA ?',
            answer: "Un POC peut être livré en 4 à 8 semaines. Une solution complète prend généralement 3 à 6 mois selon la complexité. Notre approche agile permet d'avoir des premiers résultats rapidement tout en itérant sur la solution.",
            order: 1,
        },
        {
            id: 'faq-3',
            question: 'Avons-nous besoin de beaucoup de données pour commencer ?',
            answer: "Cela dépend du cas d'usage. Pour de l'automatisation simple, peu de données suffisent. Pour du machine learning prédictif, il faut généralement 6 à 12 mois d'historique. L'audit IA évalue la qualité et la quantité de vos données disponibles.",
            order: 2,
        },
        {
            id: 'faq-4',
            question: "L'IA va-t-elle remplacer mes employés ?",
            answer: "Notre approche est celle de l'augmentation, pas du remplacement. L'IA prend en charge les tâches répétitives et à faible valeur ajoutée, libérant vos équipes pour des missions plus stratégiques. Nous accompagnons aussi la conduite du changement.",
            order: 3,
        },
        {
            id: 'faq-5',
            question: 'Travaillez-vous avec les PME ou seulement les grands groupes ?',
            answer: "Nous travaillons principalement avec les PME et ETI (20 à 500 employés). Notre expertise est d'adapter les technologies IA aux contraintes et budgets des entreprises de taille moyenne, sans les coûts des grands cabinets de conseil.",
            order: 4,
        },
        {
            id: 'faq-6',
            question: 'Que se passe-t-il si le projet IA ne fonctionne pas ?',
            answer: "C'est pour cela que nous commençons toujours par un POC à périmètre limité. Si les résultats ne sont pas concluants, vous n'aurez investi que sur cette phase de test. Notre taux de réussite est de 85% grâce à notre méthodologie de qualification rigoureuse.",
            order: 5,
        },
    ];

    for (const faq of faqs) {
        await prisma.faqItem.upsert({ where: { id: faq.id }, update: faq, create: faq });
    }
    console.log('✅ FAQ: 6 questions');

    // ========== TESTIMONIALS (7 clients from index.html) ==========
    const testimonials = [
        {
            id: 'test-1',
            author: 'Directeur des Opérations',
            role: 'Directeur des Opérations',
            company: 'Green Logistics',
            content: "L'automatisation de notre chaîne d'approvisionnement nous a permis de réduire les délais de 40% et d'optimiser nos stocks.",
            companyLogo: 'assets/clients/green-logistics.png',
            rating: 5,
            order: 0,
        },
        {
            id: 'test-2',
            author: 'Responsable R&D',
            role: 'Responsable R&D',
            company: 'Cekha Labs',
            content: 'Le système de prédiction de la qualité des formulations a transformé notre R&D. Nous économisons des semaines de travail.',
            companyLogo: 'assets/clients/cekha-labs.png',
            rating: 5,
            order: 1,
        },
        {
            id: 'test-3',
            author: 'Directeur Commercial',
            role: 'Directeur Commercial',
            company: 'H&O Access',
            content: "L'analyse automatique des documents fonciers nous a fait gagner un temps précieux. Un vrai avantage concurrentiel.",
            companyLogo: 'assets/clients/ho-access.png',
            rating: 5,
            order: 2,
        },
        {
            id: 'test-4',
            author: 'Directeur Technique',
            role: 'Directeur Technique',
            company: 'Integral BTP',
            content: 'Le tableau de bord prédictif pour nos chantiers a révolutionné notre gestion de projet avec une précision remarquable.',
            companyLogo: 'assets/clients/integral-btp.png',
            rating: 5,
            order: 3,
        },
        {
            id: 'test-5',
            author: 'Directrice Associée',
            role: 'Directrice Associée',
            company: 'Krinch & Partners',
            content: "L'IA a transformé notre processus de recrutement. Nous identifions les meilleurs profils 3 fois plus vite.",
            companyLogo: 'assets/clients/krinch-partners.png',
            rating: 5,
            order: 4,
        },
        {
            id: 'test-6',
            author: 'Directeur Commercial',
            role: 'Directeur Commercial',
            company: 'Saunya Cosmetics',
            content: 'Le système de prédiction des tendances nous a permis de réduire nos ruptures de stock de 65%.',
            companyLogo: 'assets/clients/saunya-cosmetics.png',
            rating: 5,
            order: 5,
        },
        {
            id: 'test-7',
            author: 'Responsable Réseau',
            role: 'Responsable Réseau',
            company: 'Saucare',
            content: "L'automatisation de la prise de rendez-vous a optimisé notre planning. Nos instituts fonctionnent à 95% de capacité.",
            companyLogo: 'assets/clients/saucare.png',
            rating: 5,
            order: 6,
        },
    ];

    for (const t of testimonials) {
        await prisma.testimonial.upsert({ where: { id: t.id }, update: t, create: t });
    }
    console.log('✅ Témoignages: 7 clients');

    // ========== CASE STUDIES (from index.html + cas-usage) ==========
    const caseStudies = [
        {
            id: 'case-1',
            slug: 'reporting-financier-eti',
            title: 'Automatisation du reporting financier',
            sector: 'ETI Industrielle',
            sectorIcon: 'building-2',
            timeline: '8 semaines',
            challenge: '40h/mois perdues à consolider des rapports Excel',
            solution: "Pipeline d'extraction + génération automatique avec IA",
            metrics: JSON.stringify([
                { value: '-85%', label: 'Temps de reporting' },
                { value: '32k€', label: 'Économie/an' },
                { value: 'ROI 4x', label: 'Année 1', isHighlight: true },
            ]),
            order: 0,
        },
        {
            id: 'case-2',
            slug: 'prediction-ruptures-stock',
            title: 'Prédiction des ruptures de stock',
            sector: 'Logistique',
            sectorIcon: 'truck',
            timeline: '12 semaines',
            challenge: '15% de pertes sur les ruptures et surstocks',
            solution: 'ML prédictif sur historiques + facteurs externes',
            metrics: JSON.stringify([
                { value: '-60%', label: 'Ruptures' },
                { value: '180k€', label: 'Économie/an' },
                { value: 'ROI 6x', label: 'Année 1', isHighlight: true },
            ]),
            order: 1,
        },
        {
            id: 'case-3',
            slug: 'churn-ecommerce',
            title: 'Prédiction du churn e-commerce',
            sector: 'E-commerce',
            sectorIcon: 'shopping-cart',
            timeline: '10 semaines',
            challenge: '25% de clients perdus chaque année sans signe avant-coureur',
            solution: 'Scoring ML temps réel + alertes automatiques',
            metrics: JSON.stringify([
                { value: '-35%', label: 'Churn réduit' },
                { value: '240k€', label: 'Revenus récupérés' },
                { value: 'ROI 8x', label: 'Année 1', isHighlight: true },
            ]),
            order: 2,
        },
        {
            id: 'case-4',
            slug: 'nlp-juridique',
            title: 'Analyse NLP de contrats juridiques',
            sector: 'Juridique',
            sectorIcon: 'scale',
            timeline: '6 semaines',
            challenge: '20h/semaine passées à lire des contrats pour extraire des clauses',
            solution: 'NLP extraction automatique + classification des risques',
            metrics: JSON.stringify([
                { value: '-80%', label: 'Temps analyse' },
                { value: '95%', label: 'Précision' },
                { value: 'ROI 5x', label: 'Année 1', isHighlight: true },
            ]),
            order: 3,
        },
        {
            id: 'case-5',
            slug: 'vision-industrie',
            title: 'Détection de défauts par vision',
            sector: 'Industrie',
            sectorIcon: 'factory',
            timeline: '14 semaines',
            challenge: '3% de produits défectueux passent les contrôles manuels',
            solution: 'Vision par ordinateur temps réel sur ligne de production',
            metrics: JSON.stringify([
                { value: '99.2%', label: 'Taux détection' },
                { value: '-70%', label: 'Retours clients' },
                { value: 'ROI 7x', label: 'Année 1', isHighlight: true },
            ]),
            order: 4,
        },
        {
            id: 'case-6',
            slug: 'sentiment-service-client',
            title: 'Analyse sentiment service client',
            sector: 'Service',
            sectorIcon: 'headphones',
            timeline: '8 semaines',
            challenge: 'Impossible de mesurer la satisfaction client en temps réel',
            solution: 'NLP sur conversations + tableau de bord temps réel',
            metrics: JSON.stringify([
                { value: '+25%', label: 'Satisfaction' },
                { value: '-40%', label: 'Temps résolution' },
                { value: 'ROI 4x', label: 'Année 1', isHighlight: true },
            ]),
            order: 5,
        },
    ];

    for (const c of caseStudies) {
        await prisma.caseStudy.upsert({ where: { id: c.id }, update: c, create: c });
    }
    console.log('✅ Cas d\'étude: 6 études');

    // ========== BLOG CATEGORIES ==========
    const categories = [
        { id: 'cat-1', name: 'Intelligence Artificielle', slug: 'ia', color: '#0a1930' },
        { id: 'cat-2', name: 'Automatisation', slug: 'automatisation', color: '#d4af37' },
        { id: 'cat-3', name: 'Études de cas', slug: 'etudes-de-cas', color: '#2563eb' },
        { id: 'cat-4', name: 'Guide pratique', slug: 'guide', color: '#10b981' },
        { id: 'cat-5', name: 'Secteur Santé', slug: 'sante', color: '#ef4444' },
    ];

    for (const cat of categories) {
        await prisma.category.upsert({ where: { id: cat.id }, update: cat, create: cat });
    }
    console.log('✅ Catégories blog: 5');

    // ========== BLOG ARTICLES (from existing HTML files) ==========
    const articles = [
        {
            id: 'art-1',
            slug: 'questions-avant-investir-ia',
            title: '5 questions clés avant d\'investir dans l\'IA',
            excerpt: "Avant de vous lancer dans un projet IA, posez-vous ces questions essentielles pour maximiser vos chances de succès.",
            content: "L'intelligence artificielle promet des gains significatifs, mais l'investissement doit être réfléchi...",
            coverImage: 'assets/blog/questions-ia.jpg',
            readTime: 8,
            status: 'PUBLISHED',
            publishedAt: new Date('2026-01-15'),
            authorId: admin.id,
            categoryId: 'cat-1',
        },
        {
            id: 'art-2',
            slug: 'automatisation-sans-perturber-equipes',
            title: 'Automatiser sans perturber vos équipes',
            excerpt: "Comment implémenter l'automatisation de manière progressive et inclusive pour vos collaborateurs.",
            content: "L'automatisation peut faire peur aux équipes. Voici comment l'aborder sereinement...",
            coverImage: 'assets/blog/automatisation.jpg',
            readTime: 6,
            status: 'PUBLISHED',
            publishedAt: new Date('2026-01-20'),
            authorId: admin.id,
            categoryId: 'cat-2',
        },
        {
            id: 'art-3',
            slug: 'cas-pme-reporting-60-pourcent',
            title: 'PME : -60% de temps sur le reporting',
            excerpt: "Étude de cas : comment une PME industrielle a réduit son temps de reporting de 60% grâce à l'automatisation.",
            content: "Cette PME de 80 personnes passait 2 jours par semaine à produire des rapports...",
            coverImage: 'assets/blog/cas-reporting.jpg',
            readTime: 10,
            status: 'PUBLISHED',
            publishedAt: new Date('2026-01-25'),
            authorId: admin.id,
            categoryId: 'cat-3',
        },
        {
            id: 'art-4',
            slug: 'guide-audit-ia-entreprise',
            title: 'Guide complet : Réussir son audit IA',
            excerpt: "Tout ce que vous devez savoir pour préparer et réussir votre audit IA d'entreprise.",
            content: "Un audit IA bien préparé est la clé d'un projet réussi...",
            coverImage: 'assets/blog/guide-audit.jpg',
            readTime: 12,
            status: 'PUBLISHED',
            publishedAt: new Date('2026-01-28'),
            authorId: admin.id,
            categoryId: 'cat-4',
        },
        {
            id: 'art-5',
            slug: 'ia-secteur-hospitalier',
            title: 'L\'IA dans le secteur hospitalier',
            excerpt: "Comment l'intelligence artificielle transforme la gestion hospitalière et les parcours patients.",
            content: "Les hôpitaux font face à des défis croissants...",
            coverImage: 'assets/blog/ia-hopital.jpg',
            readTime: 9,
            status: 'PUBLISHED',
            publishedAt: new Date('2026-01-30'),
            authorId: admin.id,
            categoryId: 'cat-5',
        },
        {
            id: 'art-6',
            slug: 'donnees-prerequis-projet-ia',
            title: 'Quelles données pour un projet IA ?',
            excerpt: "Les prérequis data essentiels pour lancer un projet d'intelligence artificielle réussi.",
            content: "Pas de données, pas d'IA. Mais de quelles données parle-t-on exactement ?...",
            coverImage: 'assets/blog/donnees-ia.jpg',
            readTime: 7,
            status: 'PUBLISHED',
            publishedAt: new Date('2026-02-01'),
            authorId: admin.id,
            categoryId: 'cat-1',
        },
    ];

    for (const art of articles) {
        await prisma.article.upsert({ where: { id: art.id }, update: art, create: art });
    }
    console.log('✅ Articles blog: 6');

    // ========== SETTINGS ==========
    const settings = [
        { id: 'set-1', key: 'site_name', value: 'Astauria', type: 'string' },
        { id: 'set-2', key: 'site_tagline', value: 'IA & Automatisation au service des entreprises', type: 'string' },
        { id: 'set-3', key: 'contact_email', value: 'contact@astauria.com', type: 'string' },
        { id: 'set-4', key: 'ga_tracking_id', value: 'G-QZF5RYSS4V', type: 'string' },
        { id: 'set-5', key: 'primary_color', value: '#0a1930', type: 'string' },
        { id: 'set-6', key: 'secondary_color', value: '#d4af37', type: 'string' },
    ];

    for (const s of settings) {
        await prisma.setting.upsert({ where: { id: s.id }, update: s, create: s });
    }
    console.log('✅ Paramètres: 6');

    // ========== SITE PAGES ==========
    const pages = [
        {
            id: 'page-index',
            slug: 'index',
            title: 'Accueil',
            template: 'homepage',
            status: 'PUBLISHED',
            sections: [
                { type: 'hero', order: 0, content: JSON.stringify({ title: "L'IA qui résout vos vrais problèmes métiers", subtitle: "Nous déployons des solutions d'intelligence artificielle concrètes : prédiction, analyse automatique, détection d'anomalies. Pas de la tech pour la tech, mais des résultats mesurables.", badge: 'Cabinet IA & Automatisation', cta: { text: 'Demander un audit IA gratuit', url: 'audit-ia.html' } }) },
                { type: 'stats', order: 1, content: JSON.stringify([{ value: '15+', label: 'Projets IA déployés' }, { value: '6', label: "Secteurs d'expertise" }, { value: '40%', label: 'Gain de temps moyen' }]) },
                { type: 'clients', order: 2, content: JSON.stringify({ title: 'Ils nous font confiance', logos: ['green-logistics', 'cekha-labs', 'ho-access', 'integral-btp', 'krinch-partners', 'saunya-cosmetics', 'saucare'] }) },
                { type: 'use-cases', order: 3, content: JSON.stringify({ title: "Des résultats concrets dans tous les secteurs", subtitle: "Découvrez comment nous avons aidé des entreprises comme la vôtre" }) },
                { type: 'testimonials', order: 4, content: JSON.stringify({ title: 'Ce que disent nos clients' }) },
                { type: 'faq', order: 5, content: JSON.stringify({ title: 'Questions fréquentes' }) },
                { type: 'cta', order: 6, content: JSON.stringify({ title: "Prêt à explorer le potentiel de l'IA ?", buttonText: 'Demander un audit IA', buttonUrl: 'audit-ia.html' }) },
            ],
        },
        {
            id: 'page-solutions',
            slug: 'solutions',
            title: 'Nos Solutions',
            template: 'solutions',
            status: 'PUBLISHED',
            sections: [
                { type: 'hero', order: 0, content: JSON.stringify({ title: "Des solutions IA et d'automatisation adaptées aux PME", subtitle: "Astauria conçoit et intègre des solutions d'intelligence artificielle et d'automatisation pragmatiques, connectées à vos systèmes métiers, pour générer des résultats concrets." }) },
                { type: 'approach', order: 1, content: JSON.stringify({ title: 'Une approche simple, orientée résultats', intro: 'Nous partons toujours de votre réalité :', points: ['Vos processus', 'Vos outils', 'Vos contraintes'], philosophy: "L'IA n'est jamais un objectif en soi. C'est un levier pour gagner du temps, fiabiliser vos opérations et mieux piloter votre activité." }) },
                { type: 'solution', order: 2, content: JSON.stringify({ icon: 'bot', title: 'Assistant IA & ERP', problem: 'Les données sont présentes dans votre ERP, mais difficiles à exploiter rapidement.', solution: "Nous intégrons un assistant intelligent qui permet : D'accéder à vos données métiers, De générer des tableaux de bord, D'obtenir des indicateurs clés en quelques secondes", results: ["Gain de temps dans l'accès à l'information", 'Meilleure visibilité', 'Décisions plus rapides'] }) },
                { type: 'solution', order: 3, content: JSON.stringify({ icon: 'refresh-cw', title: 'Automatisation intelligente des processus', problem: "Trop de tâches manuelles, répétitives et sources d'erreurs.", solution: 'Nous automatisons vos processus clés : Facturation, Traitement de documents, Échanges entre outils métiers', results: ['Réduction du temps administratif', 'Moins d\'erreurs humaines', 'Processus plus fiables'] }) },
                { type: 'solution', order: 4, content: JSON.stringify({ icon: 'bar-chart-3', title: "IA d'aide à la décision", problem: 'Les décisions sont souvent prises sans visibilité claire sur les données.', solution: "Nous mettons en place des outils d'analyse et d'alerte pour : Anticiper les variations d'activité, Détecter les anomalies, Identifier les risques", results: ['Meilleure anticipation', 'Décisions basées sur des faits', 'Pilotage plus serein'] }) },
                { type: 'methodology', order: 5, content: JSON.stringify({ title: 'Une méthodologie claire et maîtrisée', steps: [{ number: 1, title: 'Audit IA & Automatisation', desc: 'Analyse de vos processus et identification des opportunités' }, { number: 2, title: 'POC ciblé', desc: 'Validation rapide de la solution sur un cas concret' }, { number: 3, title: 'Déploiement progressif', desc: 'Intégration dans vos outils existants' }, { number: 4, title: 'Accompagnement & support', desc: 'Suivi, ajustements et amélioration continue' }] }) },
                { type: 'cta', order: 6, content: JSON.stringify({ title: 'Une entrée sans risque', benefits: ["Vision claire avant d'investir", 'Recommandations exploitables', 'Audit offert si projet lancé'], buttonText: 'Demander mon audit IA', buttonUrl: 'audit-ia.html' }) },
            ],
        },
        {
            id: 'page-pourquoi',
            slug: 'pourquoi-astauria',
            title: 'Pourquoi Astauria',
            template: 'about',
            status: 'PUBLISHED',
            sections: [
                { type: 'hero', order: 0, content: JSON.stringify({ title: "Un partenaire de confiance pour l'IA et l'automatisation des PME", subtitle: "Astauria accompagne les PME en France et au Cameroun dans l'intégration de solutions d'IA et d'automatisation pragmatiques, orientées résultats et adaptées à leur réalité métier." }) },
                { type: 'conviction', order: 1, content: JSON.stringify({ title: "L'IA n'a de valeur que si elle produit des résultats", intro: "Chez Astauria, nous sommes convaincus que l'intelligence artificielle n'est pas une finalité. Elle doit avant tout :", points: ['Simplifier le travail des équipes', 'Fiabiliser les processus', 'Aider à prendre de meilleures décisions'], highlight: 'Notre approche est concrète, mesurée et responsable.' }) },
                { type: 'approach', order: 2, content: JSON.stringify({ title: 'Une approche claire, sans promesses excessives', intro: 'Nous intervenons avec une méthode simple :', steps: ['Partir de vos processus existants', 'Identifier les gains rapides', 'Intégrer des solutions maîtrisées', 'Accompagner dans la durée'], statements: ['Pas de discours complexe.', 'Pas de solutions hors-sol.'] }) },
                { type: 'expertise', order: 3, content: JSON.stringify({ title: 'Une double compétence métier et technique', intro: "Astauria s'appuie sur :", cards: ['Une solide expérience en intégration de systèmes et ERP', 'Une connaissance fine des processus PME', 'Une maîtrise des enjeux de données et d\'automatisation'], highlight: 'Cette double compétence nous permet de proposer des solutions réalistes et efficaces.' }) },
                { type: 'locations', order: 4, content: JSON.stringify({ title: 'France & Cameroun : la proximité comme force', locations: ['France', 'Cameroun'], benefits: ['De comprendre les réalités terrain', "D'être proches de nos clients", 'De proposer des solutions adaptées à chaque contexte'], note: 'Même méthode, même exigence de qualité.' }) },
                { type: 'partnership', order: 5, content: JSON.stringify({ title: "Plus qu'un prestataire, un partenaire", intro: 'Nous travaillons avec nos clients dans une logique de :', values: ['Transparence', 'Collaboration', 'Montée en compétences'], statement: 'Notre objectif n\'est pas de vendre un projet ponctuel, mais de construire une relation durable et utile.' }) },
                { type: 'commitments', order: 6, content: JSON.stringify({ title: 'Des engagements clairs', intro: "Astauria s'engage à :", items: ['Proposer uniquement des solutions utiles', 'Expliquer clairement chaque étape', 'Sécuriser vos données et vos systèmes', 'Mesurer les résultats obtenus'], note: 'Votre confiance est notre priorité.' }) },
                { type: 'cta', order: 7, content: JSON.stringify({ title: 'Une approche responsable et sans risque', buttonText: 'Demander mon audit IA', buttonUrl: 'audit-ia.html' }) },
            ],
        },
        {
            id: 'page-cas-usage',
            slug: 'cas-usage',
            title: "Cas d'usage",
            template: 'case-studies',
            status: 'PUBLISHED',
            sections: [
                { type: 'hero', order: 0, content: JSON.stringify({ title: "L'IA en action : des résultats concrets", subtitle: "Découvrez comment nous avons aidé des entreprises à transformer leurs processus grâce à l'intelligence artificielle et l'automatisation." }) },
                { type: 'case-list', order: 1, content: JSON.stringify({ title: 'Nos études de cas', description: 'Chaque projet est unique. Voici quelques exemples de transformations réussies.' }) },
            ],
        },
        {
            id: 'page-audit',
            slug: 'audit-ia',
            title: 'Audit IA & Automatisation',
            template: 'audit',
            status: 'PUBLISHED',
            sections: [
                { type: 'hero', order: 0, content: JSON.stringify({ title: "Audit IA & Automatisation gratuit", subtitle: "En 30 minutes, identifiez les opportunités d'IA et d'automatisation adaptées à votre entreprise. Sans engagement.", badge: 'Offert si projet lancé' }) },
                { type: 'benefits', order: 1, content: JSON.stringify({ title: "Ce que vous obtiendrez", items: ['Diagnostic de vos processus actuels', 'Identification des quick wins', 'Estimation du ROI potentiel', 'Feuille de route personnalisée'] }) },
                { type: 'process', order: 2, content: JSON.stringify({ title: "Comment ça marche ?", steps: ['Prise de contact (5 min)', 'Audit téléphonique (30 min)', 'Restitution personnalisée'] }) },
                { type: 'form', order: 3, content: JSON.stringify({ title: "Demander votre audit gratuit", fields: ['Nom', 'Email', 'Entreprise', 'Téléphone', 'Message'] }) },
            ],
        },
        {
            id: 'page-blog',
            slug: 'blog',
            title: 'Ressources',
            template: 'blog',
            status: 'PUBLISHED',
            sections: [
                { type: 'hero', order: 0, content: JSON.stringify({ title: "Ressources & Actualités IA", subtitle: "Articles, guides et études de cas pour comprendre et implémenter l'IA dans votre entreprise." }) },
                { type: 'article-list', order: 1, content: JSON.stringify({ title: 'Derniers articles', showCategories: true }) },
            ],
        },
        {
            id: 'page-contact',
            slug: 'contact',
            title: 'Contact',
            template: 'contact',
            status: 'PUBLISHED',
            sections: [
                { type: 'hero', order: 0, content: JSON.stringify({ title: "Parlons de votre projet", subtitle: "Une question ? Un projet ? Contactez-nous et discutons de vos besoins en IA et automatisation." }) },
                { type: 'contact-info', order: 1, content: JSON.stringify({ email: 'contact@astauria.com', phone: '+33 1 23 45 67 89', locations: ['France', 'Cameroun'] }) },
                { type: 'form', order: 2, content: JSON.stringify({ title: 'Envoyez-nous un message' }) },
            ],
        },
    ];

    for (const pageData of pages) {
        const { sections, ...page } = pageData;
        const createdPage = await prisma.page.upsert({
            where: { id: page.id },
            update: { ...page, publishedAt: new Date() },
            create: { ...page, publishedAt: new Date() },
        });

        // Delete existing sections and recreate
        await prisma.section.deleteMany({ where: { pageId: createdPage.id } });
        for (const section of sections) {
            await prisma.section.create({
                data: {
                    type: section.type,
                    content: section.content,
                    order: section.order,
                    pageId: createdPage.id,
                },
            });
        }
    }
    console.log('✅ Pages du site: 7 pages avec sections');

    console.log('\n🎉 Seeding complet !');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 Résumé:');
    console.log('   • 1 utilisateur admin');
    console.log('   • 12 éléments de navigation');
    console.log('   • 6 FAQ');
    console.log('   • 7 témoignages clients');
    console.log('   • 6 études de cas');
    console.log('   • 5 catégories blog');
    console.log('   • 6 articles blog');
    console.log('   • 6 paramètres');
    console.log('   • 7 pages du site');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
