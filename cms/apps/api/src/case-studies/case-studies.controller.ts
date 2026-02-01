import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CaseStudiesService } from './case-studies.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Case Studies')
@Controller('api/case-studies')
export class CaseStudiesController {
    constructor(private readonly service: CaseStudiesService) { }

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    create(@Body() dto: any) { return this.service.create(dto); }

    @Get()
    findAll(@Query('active') active?: string) { return this.service.findAll(active === 'true'); }

    @Get(':slug')
    findOne(@Param('slug') slug: string) { return this.service.findBySlug(slug); }

    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    update(@Param('id') id: string, @Body() dto: any) { return this.service.update(id, dto); }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    remove(@Param('id') id: string) { return this.service.remove(id); }
}
