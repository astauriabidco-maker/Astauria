import { IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateLeadNotesDto {
    @ApiProperty({ example: 'Rappel prévu mardi à 10 h.' })
    @IsString()
    @MaxLength(10_000)
    notes: string;
}
