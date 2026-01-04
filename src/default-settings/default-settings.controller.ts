import { Controller, Post, Body } from '@nestjs/common';
import { DefaultSettingsService } from './services/default-settings.service';
import { AppSettings } from './schemas/app-settings.schema';

@Controller('default-settings')
export class DefaultSettingsController {
    constructor(private readonly defaultSettingsService: DefaultSettingsService) {}

    @Post()
    async createSettings(@Body() settings: Partial<AppSettings>[]) {
        return this.defaultSettingsService.createSettings(settings);
    }

    @Post('upsert')
    async upsertSetting(@Body() setting: Partial<AppSettings>) {
        return this.defaultSettingsService.upsertSetting(setting);
    }
}