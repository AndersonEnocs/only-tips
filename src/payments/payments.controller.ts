import { Controller, Post, Headers, Req, Param, Body } from '@nestjs/common';
import { Request } from 'express';
import { PaymentsService } from './services/payments.service';
import { PaymentMethod } from './schemas/payment.schema';

@Controller('payment')
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) {}

    @Post('checkout/:ideaId')
    async createCheckout(@Param('ideaId') ideaId: string, @Body('paymentMethod') paymentMethod: PaymentMethod) {
        return this.paymentsService.createCheckoutSession(ideaId, paymentMethod);
    }

    @Post('webhook/stripe')
    async stripeWebhook(
        @Headers('stripe-signature') signature: string,
        @Req() request: Request & { rawBody: Buffer },
    ) {
        return this.paymentsService.handleWebhook(signature, request.rawBody);
    }

    @Post('webhook/paypal')
    async paypalWebhook(@Body() payload: any) {
        return this.paymentsService.handlePayPalWebhook(payload);
    }
}