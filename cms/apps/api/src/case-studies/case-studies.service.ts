import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCaseStudyDto, UpdateCaseStudyDto } from './dto/case-study.dto';

@Injectable()
export class CaseStudiesService {
    constructor(private prisma: PrismaService) { }

    async create(dto: CreateCaseStudyDto) {
        return this.prisma.caseStudy.create({
            data: {
                title: dto.title,
                slug: dto.slug || this.slugify(dto.title),
                sector: dto.sector,
                sectorIcon: dto.sectorIcon || null,
                timeline: dto.timeline,
                challenge: dto.challenge,
                solution: dto.solution,
                metrics: JSON.stringify(dto.metrics),
                fullContent: dto.fullContent || null,
                coverImage: dto.coverImage || null,
                order: dto.order ?? 0,
                isActive: dto.isActive ?? true,
            },
        });
    }

    async findAll(onlyActive = false) {
        return this.prisma.caseStudy.findMany({
            where: onlyActive ? { isActive: true } : undefined,
            orderBy: { order: 'asc' },
        });
    }

    async findBySlug(slug: string) {
        const caseStudy = await this.prisma.caseStudy.findFirst({
            where: { slug, isActive: true },
        });
        if (!caseStudy) throw new NotFoundException('Cas d’étude non trouvé');
        return caseStudy;
    }

    async update(id: string, dto: UpdateCaseStudyDto) {
        const { metrics, ...data } = dto;
        return this.prisma.caseStudy.update({
            where: { id },
            data: {
                ...data,
                ...(metrics !== undefined ? { metrics: JSON.stringify(metrics) } : {}),
            },
        });
    }
    async remove(id: string) { return this.prisma.caseStudy.delete({ where: { id } }); }

    private slugify(value: string) {
        return value
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }
}
