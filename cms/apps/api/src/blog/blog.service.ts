import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BlogService {
    constructor(private prisma: PrismaService) { }

    async create(data: any, authorId: string) {
        return this.prisma.article.create({
            data: { ...data, authorId },
            include: { category: true, author: { select: { name: true, avatar: true } } },
        });
    }

    async findAll(status?: string) {
        return this.prisma.article.findMany({
            where: status ? { status } : undefined,
            include: {
                category: true,
                author: { select: { name: true, avatar: true } },
                tags: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findBySlug(slug: string) {
        return this.prisma.article.findUnique({
            where: { slug },
            include: { category: true, author: true, tags: true, seo: true },
        });
    }

    async update(id: string, data: any) {
        return this.prisma.article.update({ where: { id }, data });
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
}
