import { FaqService } from './faq.service';
export declare class FaqController {
    private readonly service;
    constructor(service: FaqService);
    create(dto: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        order: number;
        isActive: boolean;
        question: string;
        answer: string;
        categoryId: string | null;
    }>;
    findAll(active?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        order: number;
        isActive: boolean;
        question: string;
        answer: string;
        categoryId: string | null;
    }[]>;
    getSchemaOrg(): Promise<{
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
    update(id: string, dto: any): Promise<{
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
}
