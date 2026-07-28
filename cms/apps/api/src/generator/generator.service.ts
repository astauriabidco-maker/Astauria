import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

type ElementBounds = {
    openStart: number;
    openEnd: number;
    closeStart: number;
    closeEnd: number;
};

function escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function findElementByClass(html: string, sectionClass: string): ElementBounds {
    const openingTag = /<([a-z][\w:-]*)\b[^>]*\bclass\s*=\s*(["'])(.*?)\2[^>]*>/gi;
    let match: RegExpExecArray | null;

    while ((match = openingTag.exec(html)) !== null) {
        const classes = match[3].split(/\s+/).filter(Boolean);
        if (!classes.includes(sectionClass)) continue;

        const tagName = match[1];
        const openStart = match.index;
        const openEnd = openingTag.lastIndex;
        const tag = new RegExp(`<\\/?${escapeRegExp(tagName)}\\b[^>]*>`, 'gi');
        tag.lastIndex = openEnd;
        let depth = 1;
        let nested: RegExpExecArray | null;

        while ((nested = tag.exec(html)) !== null) {
            const token = nested[0];
            if (/^<\//.test(token)) {
                depth -= 1;
                if (depth === 0) {
                    return {
                        openStart,
                        openEnd,
                        closeStart: nested.index,
                        closeEnd: tag.lastIndex,
                    };
                }
            } else if (!/\/>$/.test(token)) {
                depth += 1;
            }
        }

        throw new Error(`Unclosed <${tagName}> for .${sectionClass}`);
    }

    throw new Error(`Section .${sectionClass} not found`);
}

/**
 * Replaces the contents of an element while respecting nested elements of the
 * same type. CMS markers make subsequent publications independent of markup
 * depth and avoid the old "first </div>" regex corruption.
 */
export function replaceElementContent(html: string, sectionClass: string, newContent: string): string {
    const markerStart = `<!-- CMS:${sectionClass}:START -->`;
    const markerEnd = `<!-- CMS:${sectionClass}:END -->`;
    const markerStartIndex = html.indexOf(markerStart);

    if (markerStartIndex !== -1) {
        const markerEndIndex = html.indexOf(markerEnd, markerStartIndex + markerStart.length);
        if (markerEndIndex === -1) {
            throw new Error(`Missing end marker for .${sectionClass}`);
        }
        return `${html.slice(0, markerStartIndex)}${markerStart}\n${newContent}\n${html.slice(markerEndIndex)}`;
    }

    const bounds = findElementByClass(html, sectionClass);
    return `${html.slice(0, bounds.openEnd)}\n${markerStart}\n${newContent}\n${markerEnd}\n${html.slice(bounds.closeStart)}`;
}

export function replaceElementByClass(html: string, sectionClass: string, replacement: string): string {
    const bounds = findElementByClass(html, sectionClass);
    return `${html.slice(0, bounds.openStart)}${replacement}${html.slice(bounds.closeEnd)}`;
}

@Injectable()
export class GeneratorService {
    private readonly logger = new Logger(GeneratorService.name);
    private readonly outputDir: string;
    private pendingFiles: Map<string, string> | null = null;

    constructor(private prisma: PrismaService) {
        const configuredOutputDir = process.env.SITE_OUTPUT_DIR;
        if (!configuredOutputDir && process.env.NODE_ENV === 'production') {
            throw new Error('SITE_OUTPUT_DIR is required in production');
        }
        this.outputDir = path.resolve(configuredOutputDir || path.join(process.cwd(), '../../..'));
    }

    /**
     * Génère/met à jour tous les fichiers HTML du site
     */
    async generateAll(): Promise<{ success: boolean; generated: string[] }> {
        this.assertOutputDirectory();
        this.pendingFiles = new Map();

        try {
            await this.updateFaqSection();
            await this.updateTestimonialsSection();
            await this.updateCaseStudiesSection();
            await this.updateBlogPage();
            await this.updateFooter();

            const generated = this.commitPendingFiles();
            this.logger.log(
                generated.length > 0
                    ? `Published ${generated.length} changed file(s)`
                    : 'Publication completed: no file changed',
            );
            return { success: true, generated };
        } catch (error) {
            this.logger.error('Generation failed', error);
            throw error;
        } finally {
            this.pendingFiles = null;
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

        const htmlFiles = this.listHtmlFiles().filter(file => {
            const html = this.readOutputFile(file);
            return /\bfooter__contact-info\b/.test(html);
        });

        for (const file of htmlFiles) {
            await this.replaceSection(file, 'footer__contact-info', footerHtml.trim(), true);
        }

        if (config.custom_css) {
            for (const file of this.listHtmlFiles()) {
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
        let html = this.readOutputFile(filename);

        // Remove existing custom CSS block if present
        html = html.replace(/<!-- CMS-CUSTOM-CSS-START -->[\s\S]*?<!-- CMS-CUSTOM-CSS-END -->/g, '');

        // Inject new custom CSS before </head>
        const customCssBlock = `<!-- CMS-CUSTOM-CSS-START -->
    <style id="cms-custom-styles">
${customCss}
    </style>
    <!-- CMS-CUSTOM-CSS-END -->`;

        if (!html.includes('</head>')) {
            throw new Error(`Cannot inject custom CSS: </head> not found in ${filename}`);
        }
        html = html.replace('</head>', `${customCssBlock}\n</head>`);

        this.stageOutputFile(filename, html);
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

        await this.replaceSection('index.html', 'testimonials__grid', testimonialsHtml);
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
                                <span class="case-study-card__metric-value">${this.escapeHtml(String(m.value || ''))}</span>
                                <span class="case-study-card__metric-label">${this.escapeHtml(String(m.label || ''))}</span>
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
            include: { category: true },
            orderBy: { publishedAt: 'desc' },
        });

        const articlesHtml = articles.map(a => `
                <article class="article-card" data-animate>
                    ${a.coverImage ? `
                    <div class="article-card__image">
                        <img src="${this.escapeHtml(a.coverImage)}" alt="${this.escapeHtml(a.title)}" loading="lazy">
                        <span class="article-card__tag">${this.escapeHtml(a.category?.name || 'Non classé')}</span>
                    </div>` : ''}
                    <div class="article-card__content">
                        <span class="article-card__date">${this.formatDate(a.publishedAt)}</span>
                        <h2 class="article-card__title">${this.escapeHtml(a.title)}</h2>
                        <p class="article-card__excerpt">${this.escapeHtml(a.excerpt)}</p>
                        <a href="article-${this.escapeHtml(a.slug)}.html" class="article-card__link">
                            Lire l'article <i data-lucide="arrow-right"></i>
                        </a>
                    </div>
                </article>`).join('\n');

        await this.replaceSection('blog.html', 'articles-grid', articlesHtml);

        const articleTemplate = this.readOutputFile('article-questions-ia.html');
        for (const article of articles) {
            if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(article.slug)) {
                throw new Error(`Unsafe article slug: ${article.slug}`);
            }

            let articleHtml = articleTemplate;
            articleHtml = articleHtml.replace(
                /<title>[\s\S]*?<\/title>/i,
                `<title>${this.escapeHtml(article.title)} — Astauria</title>`,
            );
            articleHtml = articleHtml.replace(
                /<meta\b[^>]*name=["']description["'][^>]*>/i,
                `<meta name="description" content="${this.escapeHtml(article.excerpt)}">`,
            );
            articleHtml = replaceElementContent(
                articleHtml,
                'article-hero__tag',
                this.escapeHtml(article.category?.name || 'Non classé'),
            );
            articleHtml = replaceElementContent(
                articleHtml,
                'article-hero__date',
                this.formatDate(article.publishedAt),
            );
            articleHtml = replaceElementContent(
                articleHtml,
                'article-hero__title',
                this.escapeHtml(article.title),
            );
            articleHtml = replaceElementContent(
                articleHtml,
                'article-hero__excerpt',
                this.escapeHtml(article.excerpt),
            );
            articleHtml = replaceElementContent(
                articleHtml,
                'article-content__inner',
                this.normalizeArticleContent(article.content),
            );
            this.stageOutputFile(`article-${article.slug}.html`, articleHtml);
        }

        this.logger.log(`Updated blog with ${articles.length} published articles`);
    }

    /**
     * Remplace une section dans un fichier HTML.
     * Une section absente est une erreur de publication, jamais un faux succès.
     */
    private async replaceSection(
        filename: string,
        sectionClass: string,
        newContent: string,
        replaceWholeElement = false,
    ): Promise<void> {
        const html = this.readOutputFile(filename);
        const updated = replaceWholeElement
            ? replaceElementByClass(html, sectionClass, newContent)
            : replaceElementContent(html, sectionClass, newContent);

        this.stageOutputFile(filename, updated);
        this.logger.log(`Updated section .${sectionClass} in ${filename}`);
    }

    private normalizeArticleContent(content: string): string {
        if (!content) return '<p>Contenu à venir.</p>';
        return /<[a-z][\s\S]*>/i.test(content)
            ? content
            : `<p>${this.escapeHtml(content)}</p>`;
    }

    private assertOutputDirectory(): void {
        if (!fs.existsSync(this.outputDir) || !fs.statSync(this.outputDir).isDirectory()) {
            throw new Error(`SITE_OUTPUT_DIR does not exist or is not a directory: ${this.outputDir}`);
        }
        fs.accessSync(this.outputDir, fs.constants.R_OK | fs.constants.W_OK);
        for (const requiredFile of ['index.html', 'blog.html', 'article-questions-ia.html']) {
            const requiredPath = path.join(this.outputDir, requiredFile);
            if (!fs.existsSync(requiredPath)) {
                throw new Error(`Required publication file not found: ${requiredPath}`);
            }
        }
    }

    private listHtmlFiles(): string[] {
        const files = new Set(
            fs.readdirSync(this.outputDir)
                .filter(file => file.endsWith('.html') && fs.statSync(path.join(this.outputDir, file)).isFile()),
        );
        for (const filename of this.pendingFiles?.keys() || []) {
            if (filename.endsWith('.html')) files.add(filename);
        }
        return [...files].sort();
    }

    private readOutputFile(filename: string): string {
        const staged = this.pendingFiles?.get(filename);
        if (staged !== undefined) return staged;

        const filePath = path.join(this.outputDir, filename);
        if (!fs.existsSync(filePath)) {
            throw new Error(`Publication file not found: ${filePath}`);
        }
        return fs.readFileSync(filePath, 'utf-8');
    }

    private stageOutputFile(filename: string, content: string): void {
        if (path.basename(filename) !== filename) {
            throw new Error(`Invalid publication filename: ${filename}`);
        }
        if (this.pendingFiles) {
            this.pendingFiles.set(filename, content);
            return;
        }
        this.atomicWriteFile(filename, content);
    }

    private commitPendingFiles(): string[] {
        if (!this.pendingFiles) return [];
        const changed: string[] = [];

        for (const [filename, content] of this.pendingFiles) {
            const filePath = path.join(this.outputDir, filename);
            const existing = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf-8') : null;
            if (existing === content) continue;
            this.atomicWriteFile(filename, content);
            changed.push(filename);
        }

        return changed.sort();
    }

    private atomicWriteFile(filename: string, content: string): void {
        const filePath = path.join(this.outputDir, filename);
        const tempPath = path.join(
            this.outputDir,
            `.${filename}.${process.pid}.${Date.now()}.tmp`,
        );
        try {
            fs.writeFileSync(tempPath, content, { encoding: 'utf-8', mode: 0o644 });
            fs.renameSync(tempPath, filePath);
        } catch (error) {
            if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
            throw error;
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
