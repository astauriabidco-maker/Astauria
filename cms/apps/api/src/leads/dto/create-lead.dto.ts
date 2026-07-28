import { IsString, IsEmail, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class CreateLeadDto {
  @ApiPropertyOptional({ example: 'Jean Dupont' })
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(120)
  name?: string;

  @ApiProperty({ example: 'jean@entreprise.com' })
  @Transform(({ value }) => typeof value === 'string' ? value.trim().toLowerCase() : value)
  @IsEmail()
  @MaxLength(254)
  email: string;

  @ApiPropertyOptional({ example: 'Entreprise SA' })
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(160)
  company?: string;

  @ApiPropertyOptional({ example: '+33 6 12 34 56 78' })
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(40)
  phone?: string;

  @ApiPropertyOptional({ example: 'Nous voulons automatiser notre CRM.' })
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(5_000)
  message?: string;

  @ApiPropertyOptional({ example: 'landing_page' })
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(80)
  source?: string;
}
