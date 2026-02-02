import { BlogService } from './blog.service';
export declare class BlogController {
    private readonly service;
    constructor(service: BlogService);
    create(dto: any, req: any): Promise<{
        category: {
            id: string;
            name: string;
            createdAt: Date;
            slug: string;
            description: string | null;
            color: string | null;
        };
        author: {
            name: string;
            avatar: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        categoryId: string;
        content: string;
        slug: string;
        title: string;
        coverImage: string | null;
        excerpt: string;
        readTime: number | null;
        status: string;
        publishedAt: Date | null;
        authorId: string;
    }>;
    findAll(status?: string): Promise<({
        category: {
            id: string;
            name: string;
            createdAt: Date;
            slug: string;
            description: string | null;
            color: string | null;
        };
        author: {
            name: string;
            avatar: string | null;
        };
        tags: {
            id: string;
            name: string;
            slug: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        categoryId: string;
        content: string;
        slug: string;
        title: string;
        coverImage: string | null;
        excerpt: string;
        readTime: number | null;
        status: string;
        publishedAt: Date | null;
        authorId: string;
    })[]>;
    findOne(slug: string): Promise<({
        category: {
            id: string;
            name: string;
            createdAt: Date;
            slug: string;
            description: string | null;
            color: string | null;
        };
        author: {
            id: string;
            email: string;
            password: string;
            name: string;
            role: string;
            avatar: string | null;
            lastLogin: Date | null;
            createdAt: Date;
            updatedAt: Date;
        };
        tags: {
            id: string;
            name: string;
            slug: string;
        }[];
        seo: {
            id: string;
            pageId: string | null;
            metaTitle: string | null;
            metaDesc: string | null;
            ogImage: string | null;
            canonical: string | null;
            noIndex: boolean;
            articleId: string | null;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        categoryId: string;
        content: string;
        slug: string;
        title: string;
        coverImage: string | null;
        excerpt: string;
        readTime: number | null;
        status: string;
        publishedAt: Date | null;
        authorId: string;
    }) | null>;
    update(id: string, dto: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        categoryId: string;
        content: string;
        slug: string;
        title: string;
        coverImage: string | null;
        excerpt: string;
        readTime: number | null;
        status: string;
        publishedAt: Date | null;
        authorId: string;
    }>;
    publish(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        categoryId: string;
        content: string;
        slug: string;
        title: string;
        coverImage: string | null;
        excerpt: string;
        readTime: number | null;
        status: string;
        publishedAt: Date | null;
        authorId: string;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        categoryId: string;
        content: string;
        slug: string;
        title: string;
        coverImage: string | null;
        excerpt: string;
        readTime: number | null;
        status: string;
        publishedAt: Date | null;
        authorId: string;
    }>;
    getCategories(): Promise<({
        _count: {
            articles: number;
        };
    } & {
        id: string;
        name: string;
        createdAt: Date;
        slug: string;
        description: string | null;
        color: string | null;
    })[]>;
    createCategory(dto: any): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        slug: string;
        description: string | null;
        color: string | null;
    }>;
}
