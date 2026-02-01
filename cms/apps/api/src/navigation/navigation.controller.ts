import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NavigationService } from './navigation.service';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Navigation')
@Controller('api/navigation')
export class NavigationController {
    constructor(private readonly service: NavigationService) { }

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create menu item' })
    create(@Body() dto: CreateMenuItemDto) {
        return this.service.create(dto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all menu items' })
    findAll(@Query('location') location?: string) {
        return this.service.findAll(location);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get menu item by ID' })
    findOne(@Param('id') id: string) {
        return this.service.findOne(id);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update menu item' })
    update(@Param('id') id: string, @Body() dto: UpdateMenuItemDto) {
        return this.service.update(id, dto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete menu item' })
    remove(@Param('id') id: string) {
        return this.service.remove(id);
    }

    @Post('reorder')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Reorder menu items' })
    reorder(@Body() items: { id: string; order: number }[]) {
        return this.service.reorder(items);
    }
}
