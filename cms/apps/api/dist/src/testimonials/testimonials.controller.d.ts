import { TestimonialsService } from './testimonials.service';
export declare class TestimonialsController {
    private readonly service;
    constructor(service: TestimonialsService);
    create(dto: any): Promise<{
        id: string;
        role: string;
        avatar: string | null;
        createdAt: Date;
        updatedAt: Date;
        order: number;
        isActive: boolean;
        author: string;
        company: string;
        content: string;
        companyLogo: string | null;
        rating: number;
    }>;
    findAll(active?: string): Promise<{
        id: string;
        role: string;
        avatar: string | null;
        createdAt: Date;
        updatedAt: Date;
        order: number;
        isActive: boolean;
        author: string;
        company: string;
        content: string;
        companyLogo: string | null;
        rating: number;
    }[]>;
    update(id: string, dto: any): Promise<{
        id: string;
        role: string;
        avatar: string | null;
        createdAt: Date;
        updatedAt: Date;
        order: number;
        isActive: boolean;
        author: string;
        company: string;
        content: string;
        companyLogo: string | null;
        rating: number;
    }>;
    remove(id: string): Promise<{
        id: string;
        role: string;
        avatar: string | null;
        createdAt: Date;
        updatedAt: Date;
        order: number;
        isActive: boolean;
        author: string;
        company: string;
        content: string;
        companyLogo: string | null;
        rating: number;
    }>;
}
