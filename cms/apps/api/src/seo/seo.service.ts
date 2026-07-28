import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { promises as fs } from 'fs';
import * as path from 'path';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSeoDto } from './dto/update-seo.dto';

@Injectable()
export class SeoService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly config: ConfigService,
    ) { }

    async updatePageSeo(pageId: string, dto: UpdateSeoDto) {
        const page = await this.prisma.page.findUnique({ where: { id: pageId } });
        if (!page) throw new NotFoundException('Page non trouvée');

        return this.prisma.seo.upsert({
            where: { pageId },
            update: dto,
            create: { ...dto, pageId },
        });
    }

    async generateSitemap() {
        const siteUrl = (this.config.get<string>('PUBLIC_URL') || 'https://www.astauria.com').replace(/\/$/, '');
        const outputDir = this.config.get<string>('SITE_OUTPUT_DIR')
            || path.resolve(process.cwd(), '../../..');
        const pages = await this.prisma.page.findMany({
            where: {
                status: 'PUBLISHED',
                OR: [
                    { seo: null },
                    { seo: { is: { noIndex: false } } },
                ],
            },
            select: { slug: true, updatedAt: true },
            orderBy: { slug: 'asc' },
        });
        const articles = await this.prisma.article.findMany({
            where: {
                status: 'PUBLISHED',
                OR: [
                    { seo: null },
                    { seo: { is: { noIndex: false } } },
                ],
            },
            select: { slug: true, updatedAt: true },
            orderBy: { slug: 'asc' },
        });
        const staticRoutes = [
            '',
            'solutions.html',
            'automatisation-processus.html',
            'integration-systemes.html',
            'intelligence-artificielle.html',
            'audit-ia.html',
            'cas-usage.html',
            'pourquoi-astauria.html',
            'blog.html',
            'contact.html',
            'article-automatisation.html',
            'article-cas-reporting.html',
            'article-donnees-ia.html',
            'article-guide-audit.html',
            'article-ia-hospitalier.html',
            'article-questions-ia.html',
            'cas-churn-ecommerce.html',
            'cas-nlp-juridique.html',
            'cas-readmissions-ia.html',
            'cas-sentiment-service.html',
            'cas-urgences-ia.html',
            'cas-vision-industrie.html',
            'mentions-legales.html',
            'politique-confidentialite.html',
            'cgv.html',
            'traitement-donnees.html',
        ];
        const generatedAt = new Date();
        const urlsByLocation = new Map(staticRoutes.map(route => {
            const loc = route ? `${siteUrl}/${route}` : `${siteUrl}/`;
            return [loc, { loc, lastmod: generatedAt }];
        }));
        const dynamicUrls = [
            ...pages.map(page => ({
                loc: page.slug === 'index' ? `${siteUrl}/` : `${siteUrl}/${page.slug}.html`,
                lastmod: page.updatedAt,
            })),
            ...articles.map(article => ({
                loc: `${siteUrl}/article-${article.slug}.html`,
                lastmod: article.updatedAt,
            })),
        ];
        dynamicUrls.forEach(url => urlsByLocation.set(url.loc, url));
        const urls = Array.from(urlsByLocation.values());
        const escapeXml = (value: string) => value
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
        const xml = [
            '<?xml version="1.0" encoding="UTF-8"?>',
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
            ...urls.map(url => [
                '  <url>',
                `    <loc>${escapeXml(url.loc)}</loc>`,
                `    <lastmod>${url.lastmod.toISOString()}</lastmod>`,
                '  </url>',
            ].join('\n')),
            '</urlset>',
            '',
        ].join('\n');

        await fs.mkdir(outputDir, { recursive: true });
        const target = path.join(outputDir, 'sitemap.xml');
        const temporary = `${target}.tmp`;
        await fs.writeFile(temporary, xml, 'utf8');
        await fs.rename(temporary, target);
        return { success: true, generated: 'sitemap.xml', urls: urls.length };
    }
}
