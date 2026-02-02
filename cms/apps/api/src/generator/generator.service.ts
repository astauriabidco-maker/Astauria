import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class GeneratorService {
    private readonly logger = new Logger(GeneratorService.name);
    private readonly outputDir = path.resolve(__dirname, '../../../../../');

    constructor(private prisma: PrismaService) { }

    /**
     * Génère/met à jour tous les fichiers HTML du site
     */
    async generateAll(): Promise<{ success: boolean; generated: string[] }> {
        const generated: string[] = [];

        try {
            // 1. Mettre à jour la section FAQ sur index.html
            await this.updateFaqSection();
            generated.push('FAQ section (index.html)');

            // 2. Mettre à jour les témoignages sur index.html
            await this.updateTestimonialsSection();
            generated.push('Testimonials section (index.html)');

            // 3. Mettre à jour les cas d'étude
            await this.updateCaseStudiesSection();
            generated.push('Case studies section (index.html)');

            // 4. Mettre à jour le blog
            await this.updateBlogPage();
            generated.push('Blog page (blog.html)');

            // 5. Mettre à jour le footer avec adresse et contact
            await this.updateFooter();
            generated.push('Footer (all pages)');

            this.logger.log(`Generated ${generated.length} sections successfully`);
            return { success: true, generated };
        } catch (error) {
            this.logger.error('Generation failed', error);
            throw error;
        }
    }

    /**
     * Met à jour le footer avec l'adresse et les informations de contact
     * Utilise le template sélectionné dans les paramètres
     */
    async updateFooter(): Promise<void> {
        const settings = await this.prisma.setting.findMany();
        const config = settings.reduce((acc, s) => {
            acc[s.key] = s.value;
            return acc;
        }, {} as Record<string, string>);

        // Build address parts
        const addressParts: string[] = [];
        if (config.address_line1) addressParts.push(config.address_line1);
        if (config.address_line2) addressParts.push(config.address_line2);
        if (config.address_zip || config.address_city) {
            addressParts.push(`${config.address_zip || ''} ${config.address_city || ''}`.trim());
        }
        if (config.address_country) addressParts.push(config.address_country);

        // Generate footer HTML based on selected template
        const template = config.footer_template || 'classic';
        const footerHtml = this.generateFooterByTemplate(template, config, addressParts);

        // Update footer in all HTML files
        const htmlFiles = ['index.html', 'solutions.html', 'cas-usage.html', 'pourquoi-astauria.html', 'contact.html', 'blog.html'];

        for (const file of htmlFiles) {
            await this.replaceSection(file, 'footer__contact-info', footerHtml.trim());
            // Also inject custom CSS
            if (config.custom_css) {
                await this.injectCustomCss(file, config.custom_css);
            }
        }

        this.logger.log(`Updated footer with template "${template}"`);
    }

    /**
     * Génère le HTML du footer selon le template choisi
     */
    private generateFooterByTemplate(template: string, config: Record<string, string>, addressParts: string[]): string {
        const addressHtml = addressParts.length > 0
            ? `<address>${addressParts.join('<br>')}</address>`
            : '';

        const emailHtml = config.contact_email
            ? `<a href="mailto:${config.contact_email}" class="footer__email"><i data-lucide="mail"></i><span>${config.contact_email}</span></a>`
            : '';

        const phoneHtml = config.contact_phone
            ? `<a href="tel:${config.contact_phone.replace(/\s/g, '')}" class="footer__phone"><i data-lucide="phone"></i><span>${config.contact_phone}</span></a>`
            : '';

        const socialHtml = `
            ${config.social_linkedin ? `<a href="${config.social_linkedin}" target="_blank" rel="noopener" class="footer__social-link"><i data-lucide="linkedin"></i></a>` : ''}
            ${config.social_twitter ? `<a href="${config.social_twitter}" target="_blank" rel="noopener" class="footer__social-link"><i data-lucide="twitter"></i></a>` : ''}
        `;

        switch (template) {
            case 'original':
                // Reproduces the exact current footer structure
                return `
                    <div class="footer__contact-info">
                        <div class="footer__contact-item">
                            <i data-lucide="mail"></i>
                            <a href="mailto:${config.contact_email || 'contact@astauria.com'}">${config.contact_email || 'contact@astauria.com'}</a>
                        </div>
                        <div class="footer__contact-item">
                            <i data-lucide="globe"></i>
                            <a href="https://www.astauria.com">www.astauria.com</a>
                        </div>
                        ${config.contact_phone ? `
                        <div class="footer__contact-item">
                            <i data-lucide="phone"></i>
                            <a href="tel:${config.contact_phone.replace(/\s/g, '')}">${config.contact_phone}</a>
                        </div>` : ''}
                    </div>
                    ${addressParts.length > 0 ? `
                    <div class="footer__presence">
                        <p class="footer__presence-label">Adresse</p>
                        <div class="footer__presence-tags">
                            ${addressParts.map(part => `<span class="footer__presence-tag">${part}</span>`).join('')}
                        </div>
                    </div>` : ''}`;

            case 'centered':
                return `
                    <div class="footer__contact-info footer__contact-info--centered">
                        <div class="footer__logo-section">
                            <img src="assets/logo.svg" alt="${config.site_name || 'Astauria'}" class="footer__logo">
                            <span class="footer__tagline">${config.site_tagline || ''}</span>
                        </div>
                        <div class="footer__address-centered">
                            <i data-lucide="map-pin"></i>
                            ${addressHtml}
                        </div>
                        <div class="footer__contact-centered">
                            ${emailHtml}
                            ${phoneHtml}
                        </div>
                        <div class="footer__social-centered">
                            ${socialHtml}
                        </div>
                    </div>`;

            case 'minimal':
                return `
                    <div class="footer__contact-info footer__contact-info--minimal">
                        <span class="footer__copyright">© ${new Date().getFullYear()} ${config.site_name || 'Astauria'}</span>
                        <nav class="footer__links-inline">
                            <a href="pourquoi-astauria.html">À propos</a>
                            <a href="contact.html">Contact</a>
                            <a href="mentions-legales.html">Mentions légales</a>
                        </nav>
                        <div class="footer__contact-inline">
                            ${config.contact_email ? `<span>${config.contact_email}</span>` : ''}
                        </div>
                    </div>`;

            case 'classic':
            default:
                return `
                    <div class="footer__contact-info footer__contact-info--classic">
                        <div class="footer__address">
                            <i data-lucide="map-pin"></i>
                            ${addressHtml}
                        </div>
                        ${emailHtml}
                        ${phoneHtml}
                        <div class="footer__social">
                            ${socialHtml}
                        </div>
                    </div>`;
        }
    }

    /**
     * Injecte le CSS personnalisé dans un fichier HTML
     */
    private async injectCustomCss(filename: string, customCss: string): Promise<void> {
        const filePath = path.join(this.outputDir, filename);

        if (!fs.existsSync(filePath)) return;

        let html = fs.readFileSync(filePath, 'utf-8');

        // Remove existing custom CSS block if present
        html = html.replace(/<!-- CMS-CUSTOM-CSS-START -->[\s\S]*?<!-- CMS-CUSTOM-CSS-END -->/g, '');

        // Inject new custom CSS before </head>
        const customCssBlock = `<!-- CMS-CUSTOM-CSS-START -->
    <style id="cms-custom-styles">
${customCss}
    </style>
    <!-- CMS-CUSTOM-CSS-END -->`;

        html = html.replace('</head>', `${customCssBlock}\n</head>`);

        fs.writeFileSync(filePath, html, 'utf-8');
        this.logger.log(`Injected custom CSS into ${filename}`);
    }

    /**
     * Met à jour la section FAQ dans index.html
     */
    async updateFaqSection(): Promise<void> {
        const faqs = await this.prisma.faqItem.findMany({
            where: { isActive: true },
            orderBy: { order: 'asc' },
        });

        const faqHtml = faqs.map(faq => `
                    <div class="faq__item" itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
                        <button class="faq__question" aria-expanded="false">
                            <span itemprop="name">${this.escapeHtml(faq.question)}</span>
                            <i data-lucide="chevron-down" class="faq__icon"></i>
                        </button>
                        <div class="faq__answer" itemscope itemprop="acceptedAnswer"
                            itemtype="https://schema.org/Answer">
                            <div itemprop="text">
                                <p>${this.escapeHtml(faq.answer)}</p>
                            </div>
                        </div>
                    </div>`).join('\n');

        await this.replaceSection('index.html', 'faq__grid', faqHtml);
        this.logger.log(`Updated FAQ section with ${faqs.length} items`);
    }

    /**
     * Met à jour les témoignages dans index.html
     */
    async updateTestimonialsSection(): Promise<void> {
        const testimonials = await this.prisma.testimonial.findMany({
            where: { isActive: true },
            orderBy: { order: 'asc' },
        });

        const testimonialsHtml = testimonials.map(t => `
                            <div class="testimonial-card">
                                <div class="testimonial-card__quote"><i data-lucide="quote"></i></div>
                                <p class="testimonial-card__text">${this.escapeHtml(t.content)}</p>
                                <div class="testimonial-card__author">
                                    ${t.companyLogo ? `<img src="${t.companyLogo}" alt="${this.escapeHtml(t.company)}" class="testimonial-card__logo">` : ''}
                                    <div class="testimonial-card__info">
                                        <span class="testimonial-card__name">${this.escapeHtml(t.author)}</span>
                                        <span class="testimonial-card__company">${this.escapeHtml(t.company)}</span>
                                    </div>
                                </div>
                            </div>`).join('\n');

        await this.replaceSection('index.html', 'carousel__track', testimonialsHtml);
        this.logger.log(`Updated testimonials with ${testimonials.length} items`);
    }

    /**
     * Met à jour les cas d'étude
     */
    async updateCaseStudiesSection(): Promise<void> {
        const caseStudies = await this.prisma.caseStudy.findMany({
            where: { isActive: true },
            orderBy: { order: 'asc' },
            take: 2, // Only show 2 on homepage
        });

        const casesHtml = caseStudies.map(c => {
            const metrics = this.parseMetrics(c.metrics);
            return `
                    <article class="case-study-card" data-animate>
                        <div class="case-study-card__header">
                            <div class="case-study-card__sector">
                                <i data-lucide="${c.sectorIcon || 'building-2'}"></i>
                                <span>${this.escapeHtml(c.sector)}</span>
                            </div>
                            <span class="case-study-card__timeline">Déployé en ${this.escapeHtml(c.timeline)}</span>
                        </div>

                        <h3 class="case-study-card__title">${this.escapeHtml(c.title)}</h3>

                        <div class="case-study-card__challenge">
                            <strong>Défi :</strong> ${this.escapeHtml(c.challenge)}
                        </div>

                        <div class="case-study-card__solution">
                            <strong>Solution :</strong> ${this.escapeHtml(c.solution)}
                        </div>

                        <div class="case-study-card__results">
                            ${metrics.map((m: any) => `
                            <div class="case-study-card__metric${m.isHighlight ? ' case-study-card__metric--highlight' : ''}">
                                <span class="case-study-card__metric-value">${m.value}</span>
                                <span class="case-study-card__metric-label">${m.label}</span>
                            </div>`).join('')}
                        </div>

                        <a href="cas-usage.html#${c.slug}" class="case-study-card__link">
                            Voir le détail <i data-lucide="arrow-right"></i>
                        </a>
                    </article>`;
        }).join('\n');

        await this.replaceSection('index.html', 'case-studies__grid', casesHtml);
        this.logger.log(`Updated case studies with ${caseStudies.length} items`);
    }

    /**
     * Met à jour la page blog
     */
    async updateBlogPage(): Promise<void> {
        const articles = await this.prisma.article.findMany({
            where: { status: 'PUBLISHED' },
            include: { category: true, author: true },
            orderBy: { publishedAt: 'desc' },
        });

        // Generate article cards for blog.html
        const articlesHtml = articles.map(a => `
                <article class="blog-card" data-animate>
                    ${a.coverImage ? `<img src="${a.coverImage}" alt="${this.escapeHtml(a.title)}" class="blog-card__image">` : ''}
                    <div class="blog-card__content">
                        <div class="blog-card__meta">
                            <span class="blog-card__category">${this.escapeHtml(a.category?.name || 'Non classé')}</span>
                            <span class="blog-card__date">${this.formatDate(a.publishedAt)}</span>
                        </div>
                        <h3 class="blog-card__title">${this.escapeHtml(a.title)}</h3>
                        <p class="blog-card__excerpt">${this.escapeHtml(a.excerpt)}</p>
                        <a href="article-${a.slug}.html" class="blog-card__link">
                            Lire l'article <i data-lucide="arrow-right"></i>
                        </a>
                    </div>
                </article>`).join('\n');

        await this.replaceSection('blog.html', 'blog__grid', articlesHtml);
        this.logger.log(`Updated blog with ${articles.length} articles`);
    }

    /**
     * Remplace une section dans un fichier HTML
     */
    private async replaceSection(filename: string, sectionClass: string, newContent: string): Promise<void> {
        const filePath = path.join(this.outputDir, filename);

        if (!fs.existsSync(filePath)) {
            this.logger.warn(`File not found: ${filePath}`);
            return;
        }

        let html = fs.readFileSync(filePath, 'utf-8');

        // Create regex to find the section by class
        const regex = new RegExp(
            `(<div[^>]*class="[^"]*${sectionClass}[^"]*"[^>]*>)([\\s\\S]*?)(<\\/div>)`,
            'i'
        );

        if (regex.test(html)) {
            html = html.replace(regex, `$1\n${newContent}\n                $3`);
            fs.writeFileSync(filePath, html, 'utf-8');
            this.logger.log(`Updated section .${sectionClass} in ${filename}`);
        } else {
            this.logger.warn(`Section .${sectionClass} not found in ${filename}`);
        }
    }

    private escapeHtml(text: string): string {
        if (!text) return '';
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    private parseMetrics(metricsStr: string): any[] {
        try {
            return JSON.parse(metricsStr);
        } catch {
            return [];
        }
    }

    private formatDate(date: Date | null): string {
        if (!date) return '';
        return new Date(date).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    }
}
