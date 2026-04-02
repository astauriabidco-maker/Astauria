import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { HeroSlidesService } from './hero-slides.service';
import { CreateHeroSlideDto } from './dto/create-hero-slide.dto';
import { UpdateHeroSlideDto } from './dto/update-hero-slide.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Hero Slides')
@Controller('api/hero-slides')
export class HeroSlidesController {
  constructor(private readonly heroSlidesService: HeroSlidesService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'Create a new slide' })
  create(@Body() createHeroSlideDto: CreateHeroSlideDto) {
    return this.heroSlidesService.create(createHeroSlideDto);
  }

  // Public endpoint for the frontend
  @Get()
  @ApiOperation({ summary: 'Get all slides' })
  findAll() {
    return this.heroSlidesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get specific slide' })
  findOne(@Param('id') id: string) {
    return this.heroSlidesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':id')
  @ApiOperation({ summary: 'Update a slide' })
  update(@Param('id') id: string, @Body() updateHeroSlideDto: UpdateHeroSlideDto) {
    return this.heroSlidesService.update(id, updateHeroSlideDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a slide' })
  remove(@Param('id') id: string) {
    return this.heroSlidesService.remove(id);
  }
}
