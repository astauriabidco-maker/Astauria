import {
    IsArray,
    IsBoolean,
    IsInt,
    IsOptional,
    IsString,
    Max,
    MaxLength,
    Min,
} from 'class-validator';
import { PartialType } from '@nestjs/swagger';

export class CreateArticleDto {
    @IsString()
    @MaxLength(180)
    title: string;

    @IsString()
    @MaxLength(180)
    slug: string;

    @IsString()
    @MaxLength(500)
    excerpt: string;

    @IsString()
    content: string;

    @IsString()
    @MaxLength(100)
    category: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[];

    @IsOptional()
    @IsString()
    imageUrl?: string;

    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(60)
    readTime?: number;

    @IsOptional()
    @IsBoolean()
    isPublished?: boolean;
}

export class UpdateArticleDto extends PartialType(CreateArticleDto) { }
