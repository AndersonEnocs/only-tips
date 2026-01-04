import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Idea, IdeaSchema } from '../ideas/schemas/idea.schema';
import { AdminService } from './services/admin.service';
import { AdminController } from './controllers/admin.controller';
import { DefaultSettingsModule } from '../default-settings/default-settings.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Idea.name, schema: IdeaSchema }]),
    DefaultSettingsModule
  ],
  providers: [AdminService],
  controllers: [AdminController],
})
export class AdminModule {}