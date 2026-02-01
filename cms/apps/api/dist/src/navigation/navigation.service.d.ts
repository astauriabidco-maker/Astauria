import { PrismaService } from '../prisma/prisma.service';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
export declare class NavigationService {
    private prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateMenuItemDto): Promise<{
        id: string;
        label: string;
        url: string;
        icon: string | null;
        order: number;
        isActive: boolean;
        location: string;
        createdAt: Date;
        updatedAt: Date;
        parentId: string | null;
    }>;
    findAll(location?: string): Promise<({
        children: {
            id: string;
            label: string;
            url: string;
            icon: string | null;
            order: number;
            isActive: boolean;
            location: string;
            createdAt: Date;
            updatedAt: Date;
            parentId: string | null;
        }[];
    } & {
        id: string;
        label: string;
        url: string;
        icon: string | null;
        order: number;
        isActive: boolean;
        location: string;
        createdAt: Date;
        updatedAt: Date;
        parentId: string | null;
    })[]>;
    findOne(id: string): Promise<({
        children: {
            id: string;
            label: string;
            url: string;
            icon: string | null;
            order: number;
            isActive: boolean;
            location: string;
            createdAt: Date;
            updatedAt: Date;
            parentId: string | null;
        }[];
    } & {
        id: string;
        label: string;
        url: string;
        icon: string | null;
        order: number;
        isActive: boolean;
        location: string;
        createdAt: Date;
        updatedAt: Date;
        parentId: string | null;
    }) | null>;
    update(id: string, dto: UpdateMenuItemDto): Promise<{
        id: string;
        label: string;
        url: string;
        icon: string | null;
        order: number;
        isActive: boolean;
        location: string;
        createdAt: Date;
        updatedAt: Date;
        parentId: string | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        label: string;
        url: string;
        icon: string | null;
        order: number;
        isActive: boolean;
        location: string;
        createdAt: Date;
        updatedAt: Date;
        parentId: string | null;
    }>;
    reorder(items: {
        id: string;
        order: number;
    }[]): Promise<{
        id: string;
        label: string;
        url: string;
        icon: string | null;
        order: number;
        isActive: boolean;
        location: string;
        createdAt: Date;
        updatedAt: Date;
        parentId: string | null;
    }[]>;
}
