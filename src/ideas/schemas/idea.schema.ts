import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type IdeaDocument = HydratedDocument<Idea>;

export enum IdeaStatus {
    PENDING_PAYMENT = 'PENDING_PAYMENT',
    RECEIVED = 'RECEIVED',
    REVIEWED = 'REVIEWED',
    SELECTED = 'SELECTED',
    NOT_SELECTED = 'NOT_SELECTED'
}

@Schema({ collection: 'ideas', timestamps: true })
export class Idea {
    _id?: Types.ObjectId;

    @Prop({ required: true, trim: true })
    title: string;

    @Prop({ required: true })
    description: string;

    @Prop({ required: true, trim: true })
    email: string;

    @Prop({ enum: IdeaStatus, default: IdeaStatus.PENDING_PAYMENT })
    status: IdeaStatus;

    @Prop({ type: String })
    stripe_session_id?: string;

    @Prop({ type: String })
    stripe_payment_intent?: string;

    @Prop({ type: String })
    reviewer_feedback?: string;

    @Prop({ type: Date })
    decision_date?: Date;

    @Prop({ default: true })
    is_public: boolean;
}

export const IdeaSchema = SchemaFactory.createForClass(Idea);