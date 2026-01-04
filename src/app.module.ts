import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DefaultSettingsModule } from './default-settings/default-settings.module';
import { IdeasModule } from './ideas/ideas.module';
import { PaymentsModule } from './payments/payments.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('DATABASE_URL'),
      }),
      inject: [ConfigService],
    }),
    DefaultSettingsModule,
    IdeasModule,
    PaymentsModule,
    AdminModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
