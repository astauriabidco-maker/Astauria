import { Controller, Post, Get, Delete, Param, UseInterceptors, UploadedFile, UseGuards, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MediaService } from './media.service';
import { v4 as uuidv4 } from 'uuid';

const UPLOAD_PATH = join(process.cwd(), '..', '..', 'assets', 'uploads');

@Controller('media')
@UseGuards(JwtAuthGuard)
export class MediaController {
    constructor(private readonly mediaService: MediaService) { }

    @Post('upload')
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: UPLOAD_PATH,
                filename: (req, file, callback) => {
                    const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
                    callback(null, uniqueName);
                },
            }),
            fileFilter: (req, file, callback) => {
                const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'application/pdf'];
                if (allowedMimes.includes(file.mimetype)) {
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
