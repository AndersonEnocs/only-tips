import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppSettings, AppSettingsSchema } from './schemas/app-settings.schema';
import { DefaultSettingsService } from './services/default-settings.service';
import { DefaultSettingsController } from './default-settings.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: AppSettings.name, schema: AppSettingsSchema }])],
  providers: [DefaultSettingsService],
  controllers: [DefaultSettingsController],
  exports: [DefaultSettingsService],
})
export class DefaultSettingsModule {}