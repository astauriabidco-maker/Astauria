import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadStatusDto } from './dto/update-lead-status.dto';
import { Logger } from '@nestjs/common';

@Injectable()
export class LeadsService {
  private readonly logger = new Logger(LeadsService.name);

  constructor(private prisma: PrismaService) {}

  async create(createLeadDto: CreateLeadDto) {
    if (!createLeadDto.name) {
      createLeadDto.name = 'Contact Web / Newsletter';
    }
    
    const lead = await this.prisma.lead.create({
      data: createLeadDto as any, // Cast as any or properly map since Prisma expects name as string
    });

    // Déclenchement asynchrone de la notification WhatsApp (fire-and-forget pour ne pas bloquer la requête API)
    this.sendWhatsAppNotification(lead).catch(e => 
      this.logger.error(`Failed to send WhatsApp notification: ${e.message}`)
    );

    return lead;
  }

  private async sendWhatsAppNotification(lead: any) {
    const token = process.env.WHATSAPP_API_TOKEN;
    const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const destPhone = process.env.WHATSAPP_NOTIFICATION_DESTINATION;

    if (!token || !phoneId || !destPhone) {
      this.logger.warn('WhatsApp credentials not fully configured. Skipping notification.');
      return;
    }

    const apiUrl = `https://graph.facebook.com/v19.0/${phoneId}/messages`;
    
    // Formatting the message
    const messageText = `🚨 *Nouveau Lead entrant (Astauria)* 🚨\n\n` +
      `👤 *Nom:* ${lead.name}\n` +
      `📧 *Email:* ${lead.email}\n` +
      `🏢 *Entreprise:* ${lead.company || 'N/A'}\n` +
      `📞 *Tel:* ${lead.phone || 'Non renseigné'}\n` +
      `📍 *Source:* ${lead.source || 'Direct'}\n\n` +
      `💬 *Message:* \n${lead.message || 'Aucun message'}\n\n` +
      `--- \n_Connectez-vous à votre interface Admin pour gérer ce prospect._`;

    const body = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: destPhone,
      type: "text",
      text: { 
        preview_url: false,
        body: messageText
      }
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Meta API Error: ${response.status} - ${errorText}`);
    }

    this.logger.log(`WhatsApp notification successfully sent for lead ${lead.id}`);
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
