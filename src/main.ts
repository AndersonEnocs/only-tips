import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DefaultSettingsService } from './default-settings/services/default-settings.service';
import { SettingsMapper } from './default-settings/utilities/settings-mapper';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, { rawBody: true });

    app.enableCors({
        origin: "*",
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
        allowedHeaders: '*'
    });

    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
    }));

    const settingsService = app.get(DefaultSettingsService);
    const settings = await settingsService.getSettings();
    SettingsMapper.mapSettings(settings);

    await app.listen(process.env.PORT ?? 3333);
}
bootstrap();
