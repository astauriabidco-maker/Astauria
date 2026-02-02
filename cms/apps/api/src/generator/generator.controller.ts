import { Controller, Post, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { GeneratorService } from './generator.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Generator')
@Controller('api/generator')
export class GeneratorController {
    constructor(private readonly generatorService: GeneratorService) { }

    @Post('publish')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Régénère tous les fichiers HTML du site' })
    async publish() {
        const result = await this.generatorService.generateAll();
        return {
            message: 'Site publié avec succès !',
            ...result,
        };
    }

    @Get('status')
    @ApiOperation({ summary: 'Vérifie le statut du générateur' })
    status() {
        return {
            status: 'ready',
            message: 'Le générateur est prêt à publier',
        };
    }
}
