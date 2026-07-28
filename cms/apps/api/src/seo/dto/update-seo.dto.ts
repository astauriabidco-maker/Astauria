import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateSeoDto {
    @IsOptional()
    @IsString()
    @MaxLength(70)
    metaTitle?: string;

    @IsOptional()
    @IsString()
    @MaxLength(180)
    metaDesc?: string;

    @IsOptional()
    @IsString()
    ogImage?: string;

    @IsOptional()
    @IsString()
    canonical?: string;

    @IsOptional()
    @IsBoolean()
    noIndex?: boolean;
}
