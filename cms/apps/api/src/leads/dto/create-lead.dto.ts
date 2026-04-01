import { IsString, IsEmail, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLeadDto {
  @ApiProperty({ example: 'Jean Dupont' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'jean@entreprise.com' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: 'Entreprise SA' })
  @IsOptional()
  @IsString()
  company?: string;

  @ApiPropertyOptional({ example: '+33 6 12 34 56 78' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'Nous voulons automatiser notre CRM.' })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiPropertyOptional({ example: 'landing_page' })
  @IsOptional()
  @IsString()
  source?: string;
}
