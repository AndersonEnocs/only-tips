import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PaymentDocument = HydratedDocument<Payment>;

export enum PaymentStatus {
    PENDING = 'PENDING',
    PAID = 'PAID',
    FAILED = 'FAILED',
    REFUNDED = 'REFUNDED'
}

export enum PaymentMethod {
    STRIPE = 'STRIPE',
    PAYPAL = 'PAYPAL',
    APPLE_PAY = 'APPLE_PAY'
}

@Schema({ collection: 'payments', timestamps: true })
export class Payment {
    _id?: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Idea', required: true })
    ideaId: Types.ObjectId;

    @Prop({ required: true, min: 0 })
    amount: number;

    @Prop({ required: true, default: 'usd' })
    currency: string;

    @Prop({ enum: PaymentMethod, required: true })
    paymentMethod: PaymentMethod;

    @Prop({ type: String })
    paymentIntentId?: string;

    @Prop({ type: String })
    paypalOrderId?: string;

    @Prop({ type: String })
    paypalTransactionId?: string;

    @Prop({ enum: PaymentStatus, default: PaymentStatus.PENDING })
    status: PaymentStatus;

    @Prop({ type: String, unique: true })
    invoiceNumber?: string;

    @Prop({ type: Date })
    paidAt?: Date;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);