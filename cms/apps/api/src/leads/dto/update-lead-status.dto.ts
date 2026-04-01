import { IsString, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

const LEAD_STATUSES = ['NEW', 'DISCOVERY', 'POC', 'CLOSED_WON', 'CLOSED_LOST'];

export class UpdateLeadStatusDto {
  @ApiProperty({ example: 'DISCOVERY', description: `Must be one of: ${LEAD_STATUSES.join(', ')}` })
  @IsString()
  @IsIn(LEAD_STATUSES)
  status: string;
}
