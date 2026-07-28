import { Body, Controller, Patch, Post, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateSeoDto } from './dto/update-seo.dto';
import { SeoService } from './seo.service';

@ApiTags('SEO')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/seo')
export class SeoController {
    constructor(private readonly seoService: SeoService) { }

    @Patch('page/:pageId')
    updatePageSeo(@Param('pageId') pageId: string, @Body() dto: UpdateSeoDto) {
        return this.seoService.updatePageSeo(pageId, dto);
    }

    @Post('generate-sitemap')
    generateSitemap() {
        return this.seoService.generateSitemap();
    }
}
