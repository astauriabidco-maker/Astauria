import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateArticleDto, UpdateArticleDto } from './dto/article.dto';

@Injectable()
export class BlogService {
    constructor(private prisma: PrismaService) { }

    async create(dto: CreateArticleDto, authorId: string) {
        const article = await this.prisma.article.create({
            data: {
                title: dto.title,
                slug: dto.slug,
                excerpt: dto.excerpt,
                content: dto.content,
                coverImage: dto.imageUrl || null,
                readTime: dto.readTime || null,
                status: dto.isPublished ? 'PUBLISHED' : 'DRAFT',
                publishedAt: dto.isPublished ? new Date() : null,
                author: { connect: { id: authorId } },
                category: {
                    connectOrCreate: {
                        where: { name: dto.category },
                        create: { name: dto.category, slug: this.slugify(dto.category) },
                    },
                },
                tags: {
                    connectOrCreate: this.tagConnections(dto.tags || []),
                },
            },
            include: this.articleIncludes(),
        });
        return this.toAdminArticle(article);
    }

    async findAll(status?: string) {
        const articles = await this.prisma.article.findMany({
            where: status ? { status } : undefined,
            include: this.articleIncludes(),
            orderBy: { createdAt: 'desc' },
        });
        return articles.map(article => this.toAdminArticle(article));
    }

    async findBySlug(slug: string) {
        const article = await this.prisma.article.findFirst({
            where: { slug, status: 'PUBLISHED' },
            include: {
                category: true,
                author: { select: { name: true, avatar: true } },
                tags: true,
                seo: true,
            },
        });
        if (!article) throw new NotFoundException('Article non trouvé');
        return article;
    }

    async update(id: string, dto: UpdateArticleDto) {
        const existing = await this.prisma.article.findUnique({ where: { id } });
        if (!existing) throw new NotFoundException('Article non trouvé');

        const article = await this.prisma.article.update({
            where: { id },
            data: {
                ...(dto.title !== undefined ? { title: dto.title } : {}),
                ...(dto.slug !== undefined ? { slug: dto.slug } : {}),
                ...(dto.excerpt !== undefined ? { excerpt: dto.excerpt } : {}),
                ...(dto.content !== undefined ? { content: dto.content } : {}),
                ...(dto.imageUrl !== undefined ? { coverImage: dto.imageUrl || null } : {}),
                ...(dto.readTime !== undefined ? { readTime: dto.readTime } : {}),
                ...(dto.isPublished !== undefined ? {
                    status: dto.isPublished ? 'PUBLISHED' : 'DRAFT',
                    publishedAt: dto.isPublished
                        ? (existing.publishedAt || new Date())
                        : null,
                } : {}),
                ...(dto.category ? {
                    category: {
                        connectOrCreate: {
                            where: { name: dto.category },
                            create: { name: dto.category, slug: this.slugify(dto.category) },
                        },
                    },
                } : {}),
                ...(dto.tags ? {
                    tags: {
                        set: [],
                        connectOrCreate: this.tagConnections(dto.tags),
                    },
                } : {}),
            },
            include: this.articleIncludes(),
        });
        return this.toAdminArticle(article);
    }

    async remove(id: string) {
        return this.prisma.article.delete({ where: { id } });
    }

    async publish(id: string) {
        return this.prisma.article.update({
            where: { id },
            data: { status: 'PUBLISHED', publishedAt: new Date() },
        });
    }

    // Categories
    async getCategories() {
        return this.prisma.category.findMany({ include: { _count: { select: { articles: true } } } });
    }

    async createCategory(data: { name: string; slug: string; description?: string; color?: string }) {
        return this.prisma.category.create({ data });
    }

    private articleIncludes() {
        return {
            category: true,
            author: { select: { name: true, avatar: true } },
            tags: true,
        } as const;
    }

    private toAdminArticle(article: any) {
        return {
            ...article,
            tags: article.tags.map((tag: { name: string }) => tag.name),
            imageUrl: article.coverImage,
            isPublished: article.status === 'PUBLISHED',
        };
    }

    private tagConnections(tags: string[]) {
        return [...new Set(tags.map(tag => tag.trim()).filter(Boolean))].map(name => ({
            where: { name },
            create: { name, slug: this.slugify(name) },
        }));
    }

    private slugify(value: string) {
        return value
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }
}
