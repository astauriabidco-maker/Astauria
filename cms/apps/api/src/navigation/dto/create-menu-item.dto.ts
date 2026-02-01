import { IsString, IsOptional, IsBoolean, IsInt, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMenuItemDto {
    @ApiProperty({ example: 'Solutions' })
    @IsString()
    label: string;

    @ApiProperty({ example: '/solutions' })
    @IsString()
    url: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    icon?: string;

    @ApiProperty({ default: 0 })
    @IsOptional()
    @IsInt()
    order?: number;

    @ApiProperty({ default: true })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @ApiProperty({ enum: ['HEADER', 'FOOTER'], default: 'HEADER' })
    @IsOptional()
    @IsEnum(['HEADER', 'FOOTER'])
    location?: 'HEADER' | 'FOOTER';

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    parentId?: string;
}
