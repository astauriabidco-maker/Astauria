import { PrismaService } from '../prisma/prisma.service';
export declare class TestimonialsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: any): Promise<{
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
    findAll(onlyActive?: boolean): Promise<{
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
    update(id: string, data: any): Promise<{
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
