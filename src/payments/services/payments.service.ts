import { Injectable, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import Stripe from 'stripe';
import { constantsAppSettings } from '../../shared/consts';
import { IdeasService } from '../../ideas/services/ideas.service';
import { Payment, PaymentDocument, PaymentStatus, PaymentMethod } from '../schemas/payment.schema';

@Injectable()
export class PaymentsService {
    private stripe: Stripe | null = null;

    constructor(
        @InjectModel(Payment.name) private readonly paymentModel: Model<PaymentDocument>,
        @Inject(forwardRef(() => IdeasService)) private readonly ideasService: IdeasService,
    ) {}

    private getStripe(): Stripe {
        if (!this.stripe) {
            if (!constantsAppSettings.stripeSecretKey || constantsAppSettings.stripeSecretKey === '') {
                throw new Error('Stripe secret key is not configured in app settings');
            }
            this.stripe = new Stripe(constantsAppSettings.stripeSecretKey, {
                apiVersion: '2024-06-20' as any,
            });
        }
        return this.stripe;
    }

    async createCheckoutSession(ideaId: string): Promise<{ checkoutUrl: string }> {
        try {
            const idea = await this.ideasService.findById(ideaId);

            const payment = new this.paymentModel({
                ideaId: new Types.ObjectId(ideaId),
                amount: constantsAppSettings.submissionFee,
                currency: 'usd',
                paymentMethod: PaymentMethod.STRIPE,
                status: PaymentStatus.PENDING,
                invoiceNumber: await this.generateInvoiceNumber()
            });

            await payment.save();

            const session = await this.getStripe().checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [{
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: 'Idea Human Review Fee',
                            description: `Review for: ${idea.title}`
                        },
                        unit_amount: Math.round(constantsAppSettings.submissionFee * 100),
                    },
                    quantity: 1,
                }],
                mode: 'payment',
                success_url: constantsAppSettings.stripeSuccessUrl,
                cancel_url: constantsAppSettings.stripeCancelUrl,
                metadata: { ideaId: idea._id!.toString(), paymentId: payment._id!.toString() },
            });

            await this.ideasService.updateStripeSessionId(ideaId, session.id);

            return { checkoutUrl: session.url! };
        } catch (error) {
            console.error(`Failed to create checkout session for idea ${ideaId}:`, error);
            throw new BadRequestException('Failed to create payment session');
        }
    }

    async handleWebhook(signature: string, rawBody: Buffer) {
        let event: Stripe.Event;
        try {
            event = this.getStripe().webhooks.constructEvent(
                rawBody,
                signature,
                constantsAppSettings.stripeWebhookSecret
            );
        } catch (err) {
            throw new BadRequestException(`Webhook Error: ${err.message}`);
        }

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as Stripe.Checkout.Session;
            await this.confirmPayment(session.metadata!.ideaId, session.payment_intent as string, session.metadata!.paymentId);
        }

        return { received: true };
    }

    private async confirmPayment(ideaId: string, paymentIntentId: string, paymentId: string) {
        try {
            const idea = await this.ideasService.confirmPayment(ideaId, paymentIntentId);

            // Update payment record to PAID
            await this.paymentModel.findByIdAndUpdate(
                new Types.ObjectId(paymentId),
                {
                    $set: {
                        paymentIntentId,
                        status: PaymentStatus.PAID,
                        paidAt: new Date()
                    }
                }
            );
        } catch (error) {
            // Log error and rethrow for proper handling
            console.error(`Failed to confirm payment for idea ${ideaId}:`, error);
            throw new BadRequestException('Payment confirmation failed');
        }
    }

    private async generateInvoiceNumber(): Promise<string> {
        const year = new Date().getFullYear();
        const count = await this.paymentModel.countDocuments({ invoiceNumber: { $regex: `^INV-${year}-` } });
        const sequential = (count + 1).toString().padStart(4, '0');
        return `INV-${year}-${sequential}`;
    }
}