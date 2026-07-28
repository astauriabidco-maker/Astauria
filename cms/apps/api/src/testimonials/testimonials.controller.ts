import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { TestimonialsService } from './testimonials.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateTestimonialDto, UpdateTestimonialDto } from './dto/testimonial.dto';

@ApiTags('Testimonials')
@Controller('api/testimonials')
export class TestimonialsController {
    constructor(private readonly service: TestimonialsService) { }

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    create(@Body() dto: CreateTestimonialDto) { return this.service.create(dto); }

    @Get()
    findAll() { return this.service.findAll(true); }

    @Get('admin/all')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    findAllForAdmin(@Query('active') active?: string) {
        return this.service.findAll(active === 'true');
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    update(@Param('id') id: string, @Body() dto: UpdateTestimonialDto) { return this.service.update(id, dto); }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    remove(@Param('id') id: string) { return this.service.remove(id); }
}
