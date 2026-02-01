import { PrismaService } from '../prisma/prisma.service';
export declare class FaqService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: {
        question: string;
        answer: string;
        order?: number;
        isActive?: boolean;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        order: number;
        isActive: boolean;
        question: string;
        answer: string;
        categoryId: string | null;
    }>;
    findAll(onlyActive?: boolean): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        order: number;
        isActive: boolean;
        question: string;
        answer: string;
        categoryId: string | null;
    }[]>;
    update(id: string, data: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        order: number;
        isActive: boolean;
        question: string;
        answer: string;
        categoryId: string | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        order: number;
        isActive: boolean;
        question: string;
        answer: string;
        categoryId: string | null;
    }>;
    reorder(items: {
        id: string;
        order: number;
    }[]): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        order: number;
        isActive: boolean;
        question: string;
        answer: string;
        categoryId: string | null;
    }[]>;
    generateSchemaOrg(): Promise<{
        '@context': string;
        '@type': string;
        mainEntity: {
            '@type': string;
            name: string;
            acceptedAnswer: {
                '@type': string;
                text: string;
            };
        }[];
    }>;
}
