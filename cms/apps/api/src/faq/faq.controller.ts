import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { FaqService } from './faq.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('FAQ')
@Controller('api/faq')
export class FaqController {
    constructor(private readonly service: FaqService) { }

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    create(@Body() dto: any) { return this.service.create(dto); }

    @Get()
    findAll(@Query('active') active?: string) {
        return this.service.findAll(active === 'true');
    }

    @Get('schema')
    getSchemaOrg() { return this.service.generateSchemaOrg(); }

    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    update(@Param('id') id: string, @Body() dto: any) { return this.service.update(id, dto); }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    remove(@Param('id') id: string) { return this.service.remove(id); }

    @Post('reorder')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    reorder(@Body() items: { id: string; order: number }[]) { return this.service.reorder(items); }
}
