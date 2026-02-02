import { NavigationService } from './navigation.service';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
export declare class NavigationController {
    private readonly service;
    constructor(service: NavigationService);
    create(dto: CreateMenuItemDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        label: string;
        url: string;
        icon: string | null;
        order: number;
        isActive: boolean;
        location: string;
        parentId: string | null;
    }>;
    findAll(location?: string): Promise<({
        children: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            label: string;
            url: string;
            icon: string | null;
            order: number;
            isActive: boolean;
            location: string;
            parentId: string | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        label: string;
        url: string;
        icon: string | null;
        order: number;
        isActive: boolean;
        location: string;
        parentId: string | null;
    })[]>;
    findOne(id: string): Promise<({
        children: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            label: string;
            url: string;
            icon: string | null;
            order: number;
            isActive: boolean;
            location: string;
            parentId: string | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        label: string;
        url: string;
        icon: string | null;
        order: number;
        isActive: boolean;
        location: string;
        parentId: string | null;
    }) | null>;
    update(id: string, dto: UpdateMenuItemDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        label: string;
        url: string;
        icon: string | null;
        order: number;
        isActive: boolean;
        location: string;
        parentId: string | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        label: string;
        url: string;
        icon: string | null;
        order: number;
        isActive: boolean;
        location: string;
        parentId: string | null;
    }>;
    reorder(items: {
        id: string;
        order: number;
    }[]): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        label: string;
        url: string;
        icon: string | null;
        order: number;
        isActive: boolean;
        location: string;
        parentId: string | null;
    }[]>;
}
