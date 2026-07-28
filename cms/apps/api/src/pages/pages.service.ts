import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';

@Injectable()
export class PagesService {
    constructor(private readonly prisma: PrismaService) { }

    findAll(includeSeo = false) {
        return this.prisma.page.findMany({
            include: {
                sections: { orderBy: { order: 'asc' } },
                seo: includeSeo,
            },
            orderBy: { updatedAt: 'desc' },
        });
    }

    async findOne(id: string) {
        const page = await this.prisma.page.findUnique({
            where: { id },
            include: {
                sections: { orderBy: { order: 'asc' } },
                seo: true,
            },
        });
        if (!page) throw new NotFoundException('Page non trouvée');
        return page;
    }

    create(dto: CreatePageDto) {
        const status = dto.status || 'DRAFT';
        return this.prisma.page.create({
            data: {
                title: dto.title,
                slug: dto.slug,
                template: dto.template || 'default',
                status,
                publishedAt: status === 'PUBLISHED' ? new Date() : null,
                sections: {
                    create: (dto.sections || []).map(section => ({
                        type: section.type,
                        content: section.content,
                        order: section.order,
                    })),
                },
            },
            include: {
                sections: { orderBy: { order: 'asc' } },
                seo: true,
            },
        });
    }

    async update(id: string, dto: UpdatePageDto) {
        await this.findOne(id);
        const { sections, ...pageData } = dto;

        return this.prisma.$transaction(async tx => {
            if (sections) {
                await tx.section.deleteMany({ where: { pageId: id } });
            }

            return tx.page.update({
                where: { id },
                data: {
                    ...pageData,
                    ...(dto.status === 'PUBLISHED' ? { publishedAt: new Date() } : {}),
                    ...(dto.status === 'DRAFT' ? { publishedAt: null } : {}),
                    ...(sections ? {
                        sections: {
                            create: sections.map(section => ({
                                type: section.type,
                                content: section.content,
                                order: section.order,
                            })),
                        },
                    } : {}),
                },
                include: {
                    sections: { orderBy: { order: 'asc' } },
                    seo: true,
                },
            });
        });
    }

    async remove(id: string) {
        await this.findOne(id);
        await this.prisma.page.delete({ where: { id } });
        return { success: true };
    }
}
