import { PrismaService } from '../prisma/prisma.service';
export declare class BlogService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: any, authorId: string): Promise<{
        author: {
            name: string;
            avatar: string | null;
        };
        category: {
            id: string;
            slug: string;
            createdAt: Date;
            name: string;
            description: string | null;
            color: string | null;
        };
    } & {
        id: string;
        slug: string;
        title: string;
        excerpt: string;
        content: string;
        coverImage: string | null;
        readTime: number | null;
        status: string;
        publishedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        authorId: string;
        categoryId: string;
    }>;
    findAll(status?: string): Promise<({
        author: {
            name: string;
            avatar: string | null;
        };
        category: {
            id: string;
            slug: string;
            createdAt: Date;
            name: string;
            description: string | null;
            color: string | null;
        };
        tags: {
            id: string;
            slug: string;
            name: string;
        }[];
    } & {
        id: string;
        slug: string;
        title: string;
        excerpt: string;
        content: string;
        coverImage: string | null;
        readTime: number | null;
        status: string;
        publishedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        authorId: string;
        categoryId: string;
    })[]>;
    findBySlug(slug: string): Promise<({
        author: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            password: string;
            name: string;
            role: string;
            avatar: string | null;
            lastLogin: Date | null;
        };
        category: {
            id: string;
            slug: string;
            createdAt: Date;
            name: string;
            description: string | null;
            color: string | null;
        };
        tags: {
            id: string;
            slug: string;
            name: string;
        }[];
        seo: {
            id: string;
            metaTitle: string | null;
            metaDesc: string | null;
            ogImage: string | null;
            canonical: string | null;
            noIndex: boolean;
            pageId: string | null;
            articleId: string | null;
        } | null;
    } & {
        id: string;
        slug: string;
        title: string;
        excerpt: string;
        content: string;
        coverImage: string | null;
        readTime: number | null;
        status: string;
        publishedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        authorId: string;
        categoryId: string;
    }) | null>;
    update(id: string, data: any): Promise<{
        id: string;
        slug: string;
        title: string;
        excerpt: string;
        content: string;
        coverImage: string | null;
        readTime: number | null;
        status: string;
        publishedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        authorId: string;
        categoryId: string;
    }>;
    remove(id: string): Promise<{
        id: string;
        slug: string;
        title: string;
        excerpt: string;
        content: string;
        coverImage: string | null;
        readTime: number | null;
        status: string;
        publishedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        authorId: string;
        categoryId: string;
    }>;
    publish(id: string): Promise<{
        id: string;
        slug: string;
        title: string;
        excerpt: string;
        content: string;
        coverImage: string | null;
        readTime: number | null;
        status: string;
        publishedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        authorId: string;
        categoryId: string;
    }>;
    getCategories(): Promise<({
        _count: {
            articles: number;
        };
    } & {
        id: string;
        slug: string;
        createdAt: Date;
        name: string;
        description: string | null;
        color: string | null;
    })[]>;
    createCategory(data: {
        name: string;
        slug: string;
        description?: string;
        color?: string;
    }): Promise<{
        id: string;
        slug: string;
        createdAt: Date;
        name: string;
        description: string | null;
        color: string | null;
    }>;
}
