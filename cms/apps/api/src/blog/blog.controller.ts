import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BlogService } from './blog.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';


@ApiTags('Blog')
@Controller('api/blog')
export class BlogController {
    constructor(private readonly service: BlogService) { }

    @Post('articles')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    create(@Body() dto: any, @Request() req) {
        return this.service.create(dto, req.user.sub);
    }

    @Get('articles')
    findAll(@Query('status') status?: string) {
        return this.service.findAll(status);
    }

    @Get('articles/:slug')
    findOne(@Param('slug') slug: string) {
        return this.service.findBySlug(slug);
    }

    @Patch('articles/:id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    update(@Param('id') id: string, @Body() dto: any) {
        return this.service.update(id, dto);
    }

    @Post('articles/:id/publish')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    publish(@Param('id') id: string) {
        return this.service.publish(id);
    }

    @Delete('articles/:id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    remove(@Param('id') id: string) {
        return this.service.remove(id);
    }

    @Get('categories')
    getCategories() {
        return this.service.getCategories();
    }

    @Post('categories')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    createCategory(@Body() dto: any) {
        return this.service.createCategory(dto);
    }
}
