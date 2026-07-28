import { Type } from 'class-transformer';
import {
    IsArray,
    IsEnum,
    IsInt,
    IsOptional,
    IsString,
    ValidateNested,
} from 'class-validator';

export class PageSectionDto {
    @IsString()
    type: string;

    @IsString()
    content: string;

    @IsInt()
    order: number;
}

export class CreatePageDto {
    @IsString()
    title: string;

    @IsString()
    slug: string;

    @IsOptional()
    @IsString()
    template?: string;

    @IsOptional()
    @IsEnum(['DRAFT', 'PUBLISHED', 'ARCHIVED'])
    status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PageSectionDto)
    sections?: PageSectionDto[];
}
