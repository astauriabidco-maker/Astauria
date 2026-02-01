import { IsEmail, IsNotEmpty, MinLength, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
    @ApiProperty({ example: 'admin@astauria.com' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'password123' })
    @IsNotEmpty()
    @MinLength(6)
    password: string;

    @ApiProperty({ example: 'Jean Dupont' })
    @IsNotEmpty()
    name: string;

    @ApiProperty({ enum: ['ADMIN', 'EDITOR'], default: 'EDITOR' })
    @IsOptional()
    @IsEnum(['ADMIN', 'EDITOR'])
    role?: 'ADMIN' | 'EDITOR';
}
