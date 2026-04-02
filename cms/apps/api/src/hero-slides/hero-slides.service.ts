import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHeroSlideDto } from './dto/create-hero-slide.dto';
import { UpdateHeroSlideDto } from './dto/update-hero-slide.dto';

@Injectable()
export class HeroSlidesService {
  constructor(private prisma: PrismaService) {}

  create(createHeroSlideDto: CreateHeroSlideDto) {
    return this.prisma.heroSlide.create({
      data: createHeroSlideDto,
    });
  }

  findAll() {
    return this.prisma.heroSlide.findMany({
      orderBy: { order: 'asc' },
    });
  }

  async findOne(id: string) {
    const slide = await this.prisma.heroSlide.findUnique({
      where: { id },
    });
    if (!slide) throw new NotFoundException(`Slide #${id} not found`);
    return slide;
  }

  async update(id: string, updateHeroSlideDto: UpdateHeroSlideDto) {
    await this.findOne(id);
    return this.prisma.heroSlide.update({
      where: { id },
      data: updateHeroSlideDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.heroSlide.delete({
      where: { id },
    });
  }
}
