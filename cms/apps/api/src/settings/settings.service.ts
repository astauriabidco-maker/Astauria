import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const MASKED_VALUE = '••••••••';
const SECRET_KEY_PATTERN = /(secret|password|private[_-]?key|api[_-]?key|access[_-]?token|api[_-]?token)/i;
const SETTING_KEY_PATTERN = /^[a-z][a-z0-9_-]{0,99}$/i;

@Injectable()
export class SettingsService {
    constructor(private prisma: PrismaService) { }

    async getAll() {
        const settings = await this.prisma.setting.findMany();
        return settings.reduce((acc, s) => {
            acc[s.key] = this.deserialize(s.value, s.type);
            return acc;
        }, {} as Record<string, any>);
    }

    async getAllMasked() {
        const settings = await this.getAll();
        for (const key of Object.keys(settings)) {
            if (this.isSecretKey(key) && settings[key]) {
                settings[key] = MASKED_VALUE;
            }
        }
        return settings;
    }

    async get(key: string) {
        const setting = await this.prisma.setting.findUnique({ where: { key } });
        if (!setting) return null;
        return this.deserialize(setting.value, setting.type);
    }

    async set(key: string, value: string, type: string = 'string') {
        return this.prisma.setting.upsert({
            where: { key },
            update: { value, type },
            create: { key, value, type },
        });
    }

    async updateAll(settings: Record<string, any>) {
        if (!settings || typeof settings !== 'object' || Array.isArray(settings)) {
            throw new BadRequestException('Le corps doit être un objet de paramètres');
        }

        const entries = Object.entries(settings);
        if (entries.length > 100) {
            throw new BadRequestException('Trop de paramètres dans une seule requête');
        }

        const updates = entries
            .filter(([key, value]) => !(this.isSecretKey(key) && value === MASKED_VALUE))
            .map(([key, value]) => {
            if (!SETTING_KEY_PATTERN.test(key) || ['__proto__', 'prototype', 'constructor'].includes(key)) {
                throw new BadRequestException(`Clé de paramètre invalide: ${key}`);
            }
            if (value === undefined || typeof value === 'function') {
                throw new BadRequestException(`Valeur invalide pour le paramètre: ${key}`);
            }

            const type = typeof value === 'object' ? 'json' : 'string';
            let stringValue: string;
            try {
                stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
            } catch {
                throw new BadRequestException(`Valeur non sérialisable pour le paramètre: ${key}`);
            }
            if (stringValue.length > 100_000) {
                throw new BadRequestException(`Valeur trop longue pour le paramètre: ${key}`);
            }

            return this.prisma.setting.upsert({
                where: { key },
                update: { value: stringValue, type },
                create: { key, value: stringValue, type },
            });
        });
        if (updates.length) {
            await this.prisma.$transaction(updates);
        }
        return this.getAllMasked();
    }

    private isSecretKey(key: string) {
        return SECRET_KEY_PATTERN.test(key);
    }

    private deserialize(value: string, type: string) {
        if (type !== 'json') return value;
        try {
            return JSON.parse(value);
        } catch {
            return null;
        }
    }
}
