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
    private paypalAccessToken: string | null = null;
    private paypalTokenExpiry: Date | null = null;

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

    private async getPayPalAccessToken(): Promise<string> {
        // Check if we have a valid token
        if (this.paypalAccessToken && this.paypalTokenExpiry && this.paypalTokenExpiry > new Date()) {
            return this.paypalAccessToken;
        }

        if (!constantsAppSettings.paypalClientId || !constantsAppSettings.paypalClientSecret) {
            throw new Error('PayPal client credentials are not configured in app settings');
        }

        const auth = Buffer.from(`${constantsAppSettings.paypalClientId}:${constantsAppSettings.paypalClientSecret}`).toString('base64');

        const baseUrl = constantsAppSettings.paypalEnvironment === 'live'
            ? 'https://api.paypal.com'
            : 'https://api.sandbox.paypal.com';

        const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'grant_type=client_credentials',
        });

        if (!response.ok) {
            throw new Error(`PayPal auth failed: ${response.statusText}`);
        }

        const data = await response.json();
        this.paypalAccessToken = data.access_token;
        this.paypalTokenExpiry = new Date(Date.now() + (data.expires_in * 1000));

        return this.paypalAccessToken!;
    }

    private async createPayPalOrder(ideaId: string, amount: number): Promise<{ approvalUrl: string; orderId: string }> {
        const accessToken = await this.getPayPalAccessToken();

        const baseUrl = constantsAppSettings.paypalEnvironment === 'live'
            ? 'https://api.paypal.com'
            : 'https://api.sandbox.paypal.com';

        const response = await fetch(`${baseUrl}/v2/checkout/orders`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                intent: 'CAPTURE',
                purchase_units: [{
                    reference_id: ideaId,
                    amount: {
                        currency_code: 'USD',
                        value: amount.toFixed(2),
                    },
                    description: `Idea submission fee for idea ${ideaId}`,
                }],
                application_context: {
                    return_url: constantsAppSettings.paypalSuccessUrl,
                    cancel_url: constantsAppSettings.paypalCancelUrl,
                },
            }),
        });

        if (!response.ok) {
            throw new Error(`PayPal order creation failed: ${response.statusText}`);
        }

        const order = await response.json();

        const approvalLink = order.links.find((link: any) => link.rel === 'approve');

        if (!approvalLink) {
            throw new Error('PayPal approval URL not found in response');
        }

        return {
            approvalUrl: approvalLink.href,
            orderId: order.id,
        };
    }

    async createCheckoutSession(ideaId: string, paymentMethod: PaymentMethod): Promise<{ checkoutUrl: string }> {
        try {
            const idea = await this.ideasService.findById(ideaId);

            const payment = new this.paymentModel({
                ideaId: new Types.ObjectId(ideaId),
                amount: constantsAppSettings.submissionFee,
                currency: 'usd',
                paymentMethod,
                status: PaymentStatus.PENDING,
                invoiceNumber: await this.generateInvoiceNumber()
            });

            await payment.save();

            let checkoutUrl: string;

            switch (paymentMethod) {
                case PaymentMethod.STRIPE:
                    const session = await this.getStripe().checkout.sessions.create({
                        payment_method_types: ['card'] as Stripe.Checkout.SessionCreateParams.PaymentMethodType[],
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
                    checkoutUrl = session.url!;
                    break;

                case PaymentMethod.PAYPAL:
                    const paypalOrder = await this.createPayPalOrder(ideaId, constantsAppSettings.submissionFee);

                    // Update payment record with PayPal order ID
                    await this.paymentModel.findByIdAndUpdate(
                        payment._id,
                        { paypalOrderId: paypalOrder.orderId }
                    );

                    checkoutUrl = paypalOrder.approvalUrl;
                    break;

                case PaymentMethod.APPLE_PAY:
                    // Apple Pay through Stripe (requires additional Stripe configuration)
                    const applePaySession = await this.getStripe().checkout.sessions.create({
                        payment_method_types: ['card'] as Stripe.Checkout.SessionCreateParams.PaymentMethodType[],
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

                    await this.ideasService.updateStripeSessionId(ideaId, applePaySession.id);
                    checkoutUrl = applePaySession.url!;
                    break;

                default:
                    throw new BadRequestException('Unsupported payment method');
            }

            return { checkoutUrl };
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
            await this.confirmPayment(session.metadata!.ideaId, session.payment_intent as string, session.metadata!.paymentId, 'STRIPE');
        }

        return { received: true };
    }

    async handlePayPalWebhook(event: any) {
        try {
            if (event.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
                const orderId = event.resource.supplementary_data?.related_ids?.order_id;

                if (orderId) {
                    const payment = await this.paymentModel.findOne({ paypalOrderId: orderId });

                    if (payment) {
                        await this.confirmPayment(
                            payment.ideaId.toString(),
                            event.resource.id,
                            payment._id!.toString(),
                            'PAYPAL'
                        );

                        await this.paymentModel.findByIdAndUpdate(
                            payment._id,
                            {
                                $set: {
                                    paypalTransactionId: event.resource.id
                                }
                            }
                        );
                    }
                }
            }

            return { received: true };
        } catch (error) {
            console.error('PayPal webhook processing failed:', error);
            throw new BadRequestException('PayPal webhook processing failed');
        }
    }

    private async confirmPayment(ideaId: string, paymentIntentId: string, paymentId: string, paymentMethod: string = 'STRIPE') {
        try {
            const idea = await this.ideasService.confirmPayment(ideaId, paymentIntentId, paymentMethod);

            const updateData: any = {
                status: PaymentStatus.PAID,
                paidAt: new Date()
            };

            if (paymentMethod === 'PAYPAL') {
                updateData.paypalTransactionId = paymentIntentId;
            } else {
                updateData.paymentIntentId = paymentIntentId;
            }

            await this.paymentModel.findByIdAndUpdate(
                new Types.ObjectId(paymentId),
                { $set: updateData }
            );
        } catch (error) {
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