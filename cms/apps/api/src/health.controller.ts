import { Controller, Get } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';

@Controller('api/health')
export class HealthController {
    @Get()
    @ApiExcludeEndpoint()
    check() {
        return { status: 'ok' };
    }
}
