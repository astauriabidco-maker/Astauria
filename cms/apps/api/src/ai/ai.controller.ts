import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { GenerateDto } from './dto/generate.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('ai')
@Controller('ai')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('provider')
  @ApiOperation({ summary: 'Get current AI provider info' })
  async getProvider() {
    return this.aiService.getProviderInfo();
  }

  @Post('generate')
  @ApiOperation({ summary: 'Generate or modify text using AI' })
  async generate(@Body() generateDto: GenerateDto) {
    const result = await this.aiService.generate(generateDto);
    return { content: result };
  }
}
