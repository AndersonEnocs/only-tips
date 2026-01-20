import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppSettings, AppSettingsDocument } from '../schemas/app-settings.schema';

@Injectable()
export class DefaultSettingsService {
    constructor(
        @InjectModel(AppSettings.name) private readonly appSettingsModel: Model<AppSettingsDocument>,
    ) {}

    async getSettings(): Promise<AppSettings[]> {
        return this.appSettingsModel.find()
    }

    async createSettings(settings: Partial<AppSettings>[]): Promise<any[]> {
        return this.appSettingsModel.insertMany(settings);
    }

    async upsertSetting(setting: Partial<AppSettings>): Promise<AppSettingsDocument> {
        return this.appSettingsModel.findOneAndUpdate(
            { attribute: setting.attribute },
            { value: setting.value },
            { upsert: true, new: true }
        )
    }

    async getFundTotal(): Promise<string | null> {
        const setting = await this.appSettingsModel.findOne({ attribute: 'fund_total' });
        return setting ? setting.value : null;
    }
}