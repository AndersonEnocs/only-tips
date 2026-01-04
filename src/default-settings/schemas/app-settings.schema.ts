import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AppSettingsDocument = HydratedDocument<AppSettings>;

@Schema({ collection: 'app_settings' })
export class AppSettings {
    @Prop({ required: true, unique: true })
    attribute: string;

    @Prop({ required: true })
    value: string;
}

export const AppSettingsSchema = SchemaFactory.createForClass(AppSettings);