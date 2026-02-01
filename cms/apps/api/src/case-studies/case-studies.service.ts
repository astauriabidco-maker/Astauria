import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CaseStudiesService {
    constructor(private prisma: PrismaService) { }

    async create(data: any) { return this.prisma.caseStudy.create({ data }); }

    async findAll(onlyActive = false) {
        return this.prisma.caseStudy.findMany({
            where: onlyActive ? { isActive: true } : undefined,
            orderBy: { order: 'asc' },
        });
    }

    async findBySlug(slug: string) { return this.prisma.caseStudy.findUnique({ where: { slug } }); }
    async update(id: string, data: any) { return this.prisma.caseStudy.update({ where: { id }, data }); }
    async remove(id: string) { return this.prisma.caseStudy.delete({ where: { id } }); }
}
