import { PartialType } from '@nestjs/swagger';
import {
    IsBoolean,
    IsInt,
    IsOptional,
    IsString,
    Max,
    MaxLength,
    Min,
} from 'class-validator';

export class CreateTestimonialDto {
    @IsString()
    @MaxLength(180)
    author!: string;

    @IsString()
    @MaxLength(180)
    role!: string;

    @IsString()
    @MaxLength(180)
    company!: string;

    @IsString()
    @MaxLength(5_000)
    content!: string;

    @IsOptional()
    @IsString()
    avatar?: string;

    @IsOptional()
    @IsString()
    companyLogo?: string;

    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(5)
    rating?: number;

    @IsOptional()
    @IsInt()
    @Min(0)
    order?: number;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}

export class UpdateTestimonialDto extends PartialType(CreateTestimonialDto) {}
