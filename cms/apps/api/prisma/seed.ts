import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

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
