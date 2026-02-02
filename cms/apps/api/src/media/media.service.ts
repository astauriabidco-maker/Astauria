import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { join } from 'path';
import * as fs from 'fs';

interface CreateMediaDto {
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    url: string;
}

@Injectable()
export class MediaService {
    private readonly logger = new Logger(MediaService.name);

    constructor(private readonly prisma: PrismaService) { }

    async create(data: CreateMediaDto) {
        const media = await this.prisma.media.create({
            data: {
                filename: data.filename,
                originalName: data.originalName,
                mimeType: data.mimeType,
                size: data.size,
                url: data.url,
            },
        });
        this.logger.log(`Media uploaded: ${data.originalName}`);
        return media;
    }

    async findAll() {
        return this.prisma.media.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }

    async remove(id: string) {
        const media = await this.prisma.media.findUnique({ where: { id } });
        if (!media) {
            throw new NotFoundException('Média non trouvé');
        }

        // Delete file from disk
        const filePath = join(process.cwd(), '..', '..', 'assets', 'uploads', media.filename);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        await this.prisma.media.delete({ where: { id } });
        this.logger.log(`Media deleted: ${media.originalName}`);
        return { success: true };
    }
}
