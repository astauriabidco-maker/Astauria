import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FaqService {
    constructor(private prisma: PrismaService) { }

    async create(data: { question: string; answer: string; order?: number; isActive?: boolean }) {
        return this.prisma.faqItem.create({ data });
    }

    async findAll(onlyActive = false) {
        return this.prisma.faqItem.findMany({
            where: onlyActive ? { isActive: true } : undefined,
            orderBy: { order: 'asc' },
        });
    }

    async update(id: string, data: any) {
        return this.prisma.faqItem.update({ where: { id }, data });
    }

    async remove(id: string) {
        return this.prisma.faqItem.delete({ where: { id } });
    }

    async reorder(items: { id: string; order: number }[]) {
        const updates = items.map(item =>
            this.prisma.faqItem.update({ where: { id: item.id }, data: { order: item.order } })
        );
        return this.prisma.$transaction(updates);
    }

    // Generate Schema.org JSON-LD
    async generateSchemaOrg() {
        const faqs = await this.findAll(true);
        return {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqs.map(faq => ({
                '@type': 'Question',
                name: faq.question,
                acceptedAnswer: { '@type': 'Answer', text: faq.answer },
            })),
        };
    }
}
