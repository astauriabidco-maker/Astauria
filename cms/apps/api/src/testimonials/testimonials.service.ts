import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TestimonialsService {
    constructor(private prisma: PrismaService) { }

    async create(data: any) { return this.prisma.testimonial.create({ data }); }

    async findAll(onlyActive = false) {
        return this.prisma.testimonial.findMany({
            where: onlyActive ? { isActive: true } : undefined,
            orderBy: { order: 'asc' },
        });
    }

    async update(id: string, data: any) { return this.prisma.testimonial.update({ where: { id }, data }); }
    async remove(id: string) { return this.prisma.testimonial.delete({ where: { id } }); }
}
