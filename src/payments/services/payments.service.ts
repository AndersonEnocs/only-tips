import { Injectable, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import Stripe from 'stripe';
import { constantsAppSettings } from '../../shared/consts';
import { IdeasService } from '../../ideas/services/ideas.service';

@Injectable()
export class PaymentsService {
    private stripe: Stripe | null = null;

    constructor(
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
        const idea = await this.ideasService.findById(ideaId);

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
            metadata: { ideaId: idea._id!.toString() },
        });

        await this.ideasService.updateStripeSessionId(ideaId, session.id);

        return { checkoutUrl: session.url! };
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
            await this.confirmPayment(session.metadata!.ideaId, session.payment_intent as string);
        }

        return { received: true };
    }

    private async confirmPayment(ideaId: string, paymentIntentId: string) {
        await this.ideasService.confirmPayment(ideaId, paymentIntentId);
    }
}