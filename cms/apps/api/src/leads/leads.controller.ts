import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadStatusDto } from './dto/update-lead-status.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Leads')
@Controller('api/leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  // Route PUBLIQUE : Le site vitrine n'a pas besoin de token pour envoyer un lead
  @Post()
  @ApiOperation({ summary: 'Create a new lead from public site' })
  create(@Body() createLeadDto: CreateLeadDto) {
    return this.leadsService.create(createLeadDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get()
  @ApiOperation({ summary: 'Get all leads (Admin only)' })
  findAll() {
    return this.leadsService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('metrics')
  @ApiOperation({ summary: 'Get leads metrics for dashboard' })
  getMetrics() {
    return this.leadsService.getMetrics();
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get(':id')
  @ApiOperation({ summary: 'Get specific lead details' })
  findOne(@Param('id') id: string) {
    return this.leadsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':id/status')
  @ApiOperation({ summary: 'Update lead status in Kanban' })
  updateStatus(@Param('id') id: string, @Body() updateStatusDto: UpdateLeadStatusDto) {
    return this.leadsService.updateStatus(id, updateStatusDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':id/notes')
  @ApiOperation({ summary: 'Update internal notes for lead' })
  updateNotes(@Param('id') id: string, @Body() body: { notes: string }) {
    return this.leadsService.updateNotes(id, body.notes);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a lead' })
  remove(@Param('id') id: string) {
    return this.leadsService.remove(id);
  }
}
