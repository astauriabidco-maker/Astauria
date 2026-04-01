import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadStatusDto } from './dto/update-lead-status.dto';

@Injectable()
export class LeadsService {
  constructor(private prisma: PrismaService) {}

  async create(createLeadDto: CreateLeadDto) {
    return this.prisma.lead.create({
      data: createLeadDto,
    });
  }

  async findAll() {
    return this.prisma.lead.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id },
    });
    
    if (!lead) {
      throw new NotFoundException(`Lead #${id} not found`);
    }
    
    return lead;
  }

  async updateStatus(id: string, updateStatusDto: UpdateLeadStatusDto) {
    // Vérifier que le lead existe
    await this.findOne(id);
    
    return this.prisma.lead.update({
      where: { id },
      data: { 
        status: updateStatusDto.status,
      },
    });
  }

  async updateNotes(id: string, notes: string) {
    await this.findOne(id);
    return this.prisma.lead.update({
      where: { id },
      data: { notes },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.lead.delete({
      where: { id },
    });
  }

  async getMetrics() {
    const leads = await this.prisma.lead.findMany({ select: { status: true, createdAt: true } });
    
    const byStatus = leads.reduce((acc, lead) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: leads.length,
      byStatus,
      recentCount: leads.filter(l => new Date(l.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length
    };
  }
}
