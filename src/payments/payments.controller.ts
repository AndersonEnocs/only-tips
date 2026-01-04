import { Controller, Post, Headers, Req, Param } from '@nestjs/common';
import { Request } from 'express';
import { PaymentsService } from './services/payments.service';

@Controller('payment')
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) {}

    @Post('checkout/:ideaId')
    async createCheckout(@Param('ideaId') ideaId: string) {
        return this.paymentsService.createCheckoutSession(ideaId);
    }

    @Post('webhook/stripe')
    async stripeWebhook(
        @Headers('stripe-signature') signature: string,
        @Req() request: Request & { rawBody: Buffer },
    ) {
        return this.paymentsService.handleWebhook(signature, request.rawBody);
    }
}