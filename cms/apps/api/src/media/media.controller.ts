import { Controller, Post, Get, Delete, Param, UseInterceptors, UploadedFile, UseGuards, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';
import { mkdirSync } from 'fs';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MediaService } from './media.service';
import { v4 as uuidv4 } from 'uuid';

const SITE_OUTPUT_DIR = process.env.SITE_OUTPUT_DIR || join(process.cwd(), '..', '..', '..');
const UPLOAD_PATH = join(SITE_OUTPUT_DIR, 'assets', 'uploads');
mkdirSync(UPLOAD_PATH, { recursive: true });

const MIME_EXTENSIONS: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'application/pdf': '.pdf',
};

@Controller('api/media')
@UseGuards(JwtAuthGuard)
export class MediaController {
    constructor(private readonly mediaService: MediaService) { }

    @Post('upload')
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: UPLOAD_PATH,
                filename: (req, file, callback) => {
                    const uniqueName = `${uuidv4()}${MIME_EXTENSIONS[file.mimetype]}`;
                    callback(null, uniqueName);
                },
            }),
            fileFilter: (req, file, callback) => {
                if (MIME_EXTENSIONS[file.mimetype]) {
                    callback(null, true);
                } else {
                    callback(new BadRequestException('Type de fichier non autorisé'), false);
                }
            },
            limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
        }),
    )
    async uploadFile(@UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('Aucun fichier fourni');
        }
        return this.mediaService.create({
            filename: file.filename,
            originalName: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
            url: `/assets/uploads/${file.filename}`,
        });
    }

    @Get()
    async findAll() {
        return this.mediaService.findAll();
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        return this.mediaService.remove(id);
    }
}
