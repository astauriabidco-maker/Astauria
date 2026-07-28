import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Settings')
@Controller('api/settings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiBearerAuth()
export class SettingsController {
    constructor(private readonly settingsService: SettingsService) { }

    @Get()
    @ApiOperation({ summary: 'Get all settings with credentials masked (Admin only)' })
    getAll() {
        return this.settingsService.getAllMasked();
    }

    @Put()
    @ApiOperation({ summary: 'Update settings (Admin only)' })
    updateAll(@Body() settings: Record<string, any>) {
        return this.settingsService.updateAll(settings);
    }
}
