import { IsString, IsNotEmpty, IsEnum, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum AiAction {
  REFORMULATE = 'reformulate',
  EXPAND = 'expand',
  GENERATE = 'generate',
  SEO_IDEAS = 'seo_ideas',
  GENERATE_OUTLINE = 'generate_outline',
  GENERATE_FULL_ARTICLE = 'generate_full_article',
  GENERATE_EXCERPT = 'generate_excerpt',
  SUGGEST_TAGS = 'suggest_tags',
  IMPROVE_SEO = 'improve_seo',
}

export enum AiTone {
  PROFESSIONAL = 'professional',
  FRIENDLY = 'friendly',
  EXPERT = 'expert',
  PERSUASIVE = 'persuasive',
}

export class GenerateDto {
  @ApiProperty({ enum: AiAction, description: 'The action the AI should perform' })
  @IsEnum(AiAction)
  @IsNotEmpty()
  action: AiAction;

  @ApiProperty({ description: 'The current text or prompt to use' })
  @IsString()
  @IsNotEmpty()
  text: string;

  @ApiPropertyOptional({ description: 'Any additional context for the generation' })
  @IsString()
  @IsOptional()
  context?: string;

  @ApiPropertyOptional({ enum: AiTone, description: 'Tone of voice for the generation' })
  @IsEnum(AiTone)
  @IsOptional()
  tone?: AiTone;

  @ApiPropertyOptional({ description: 'Target SEO keyword' })
  @IsString()
  @IsOptional()
  keyword?: string;

  @ApiPropertyOptional({ description: 'Target word count' })
  @IsNumber()
  @IsOptional()
  length?: number;

  @ApiPropertyOptional({ description: 'Article outline (JSON string)' })
  @IsString()
  @IsOptional()
  outline?: string;
}
