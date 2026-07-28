import {
    IsArray,
    IsBoolean,
    IsInt,
    IsOptional,
    IsString,
    MaxLength,
    Min,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CaseStudyMetricDto {
    @IsString()
    @MaxLength(120)
    label!: string;

    @IsString()
    @MaxLength(80)
    value!: string;

    @IsOptional()
    @IsBoolean()
    isHighlight?: boolean;
}

export class CreateCaseStudyDto {
    @IsString()
    @MaxLength(180)
    title!: string;

    @IsOptional()
    @IsString()
    @MaxLength(180)
    slug?: string;

    @IsString()
    @MaxLength(120)
    sector!: string;

    @IsOptional()
    @IsString()
    sectorIcon?: string;

    @IsString()
    @MaxLength(120)
    timeline!: string;

    @IsString()
    challenge!: string;

    @IsString()
    solution!: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CaseStudyMetricDto)
    metrics!: CaseStudyMetricDto[];

    @IsOptional()
    @IsString()
    fullContent?: string;

    @IsOptional()
    @IsString()
    coverImage?: string;

    @IsOptional()
    @IsInt()
    @Min(0)
    order?: number;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}

export class UpdateCaseStudyDto {
    @IsOptional()
    @IsString()
    @MaxLength(180)
    title?: string;

    @IsOptional()
    @IsString()
    @MaxLength(180)
    slug?: string;

    @IsOptional()
    @IsString()
    @MaxLength(120)
    sector?: string;

    @IsOptional()
    @IsString()
    sectorIcon?: string;

    @IsOptional()
    @IsString()
    @MaxLength(120)
    timeline?: string;

    @IsOptional()
    @IsString()
    challenge?: string;

    @IsOptional()
    @IsString()
    solution?: string;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CaseStudyMetricDto)
    metrics?: CaseStudyMetricDto[];

    @IsOptional()
    @IsString()
    fullContent?: string;

    @IsOptional()
    @IsString()
    coverImage?: string;

    @IsOptional()
    @IsInt()
    @Min(0)
    order?: number;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
