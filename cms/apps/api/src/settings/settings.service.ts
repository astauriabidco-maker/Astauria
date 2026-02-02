import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SettingsService {
    constructor(private prisma: PrismaService) { }

    async getAll() {
        const settings = await this.prisma.setting.findMany();
        // Convert to key-value object
        return settings.reduce((acc, s) => {
            acc[s.key] = s.type === 'json' ? JSON.parse(s.value) : s.value;
            return acc;
        }, {} as Record<string, any>);
    }

    async get(key: string) {
        const setting = await this.prisma.setting.findUnique({ where: { key } });
        if (!setting) return null;
        return setting.type === 'json' ? JSON.parse(setting.value) : setting.value;
    }

    async set(key: string, value: string, type: string = 'string') {
        return this.prisma.setting.upsert({
            where: { key },
            update: { value, type },
            create: { key, value, type },
        });
    }

    async updateAll(settings: Record<string, any>) {
        const updates = Object.entries(settings).map(([key, value]) => {
            const type = typeof value === 'object' ? 'json' : 'string';
            const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
            return this.prisma.setting.upsert({
                where: { key },
                update: { value: stringValue, type },
                create: { key, value: stringValue, type },
            });
        });
        await this.prisma.$transaction(updates);
        return this.getAll();
    }
}
