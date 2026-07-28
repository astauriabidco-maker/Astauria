import { PartialType } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateFaqDto {
    @IsString()
    @MaxLength(500)
    question!: string;

    @IsString()
    @MaxLength(10_000)
    answer!: string;

    @IsOptional()
    @IsInt()
    @Min(0)
    order?: number;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @IsOptional()
    @IsString()
    categoryId?: string;
}

export class UpdateFaqDto extends PartialType(CreateFaqDto) {}
