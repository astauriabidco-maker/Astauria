import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';

@Injectable()
export class NavigationService {
    constructor(private prisma: PrismaService) { }

    async create(dto: CreateMenuItemDto) {
        return this.prisma.menuItem.create({ data: dto });
    }

    async findAll(location?: string) {
        return this.prisma.menuItem.findMany({
            where: location ? { location, parentId: null } : { parentId: null },
            include: { children: { orderBy: { order: 'asc' } } },
            orderBy: { order: 'asc' },
        });
    }

    async findOne(id: string) {
        return this.prisma.menuItem.findUnique({
            where: { id },
            include: { children: true },
        });
    }

    async update(id: string, dto: UpdateMenuItemDto) {
        return this.prisma.menuItem.update({ where: { id }, data: dto });
    }

    async remove(id: string) {
        return this.prisma.menuItem.delete({ where: { id } });
    }

    async reorder(items: { id: string; order: number }[]) {
        const updates = items.map(item =>
            this.prisma.menuItem.update({
                where: { id: item.id },
                data: { order: item.order },
            })
        );
        return this.prisma.$transaction(updates);
    }
}
