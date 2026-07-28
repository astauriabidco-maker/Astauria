import { IsEmail, IsNotEmpty, MinLength, IsOptional, IsEnum, MaxLength, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateUserDto {
    @ApiProperty({ example: 'admin@astauria.com' })
    @Transform(({ value }) => typeof value === 'string' ? value.trim().toLowerCase() : value)
    @IsEmail()
    @MaxLength(254)
    email: string;

    @ApiProperty({ example: 'password123' })
    @IsNotEmpty()
    @MinLength(12)
    @MaxLength(128)
    password: string;

    @ApiProperty({ example: 'Jean Dupont' })
    @IsNotEmpty()
    @IsString()
    @MaxLength(120)
    name: string;

    @ApiProperty({ enum: ['ADMIN', 'EDITOR'], default: 'EDITOR' })
    @IsOptional()
    @IsEnum(['ADMIN', 'EDITOR'])
    role?: 'ADMIN' | 'EDITOR';

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(500)
    avatar?: string;
}
