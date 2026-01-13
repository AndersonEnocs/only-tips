import { Controller, Post, Get, Body, Param, UsePipes, ValidationPipe } from '@nestjs/common';
import { IdeasService } from '../services/ideas.service';
import { PaymentsService } from '../../payments/services/payments.service';
import { SubmitIdeaDto } from '../dtos/submit-idea.dto';
import { IdeaMapper } from '../utilities/idea.mapper';
import { ApiResponseDto } from '../../shared/dtos/api-response.dto';
import { IdeaResponseDto } from '../dtos/response/idea-response.dto';
import { SubmitIdeaResponseDto } from '../dtos/response/submit-idea-response.dto';

@Controller('ideas')
export class IdeasController {
    constructor(
        private readonly ideasService: IdeasService,
        private readonly paymentsService: PaymentsService
    ) {}

    @Post('submit')
    @UsePipes(new ValidationPipe({ transform: true }))
    async submit(@Body() dto: SubmitIdeaDto): Promise<ApiResponseDto<SubmitIdeaResponseDto>> {
        let ideaSchema = IdeaMapper.dtoToSchema(dto);
        const savedIdea = await this.ideasService.create(ideaSchema);

        const { checkoutUrl } = await this.paymentsService.createCheckoutSession(savedIdea._id!.toString(), dto.paymentMethod);

        return {
            statusCode: 1000,
            message: 'Idea registered. Proceed to payment.',
            data: {
                idea: IdeaMapper.schemaToResponseDto(savedIdea),
                checkoutUrl
            } as SubmitIdeaResponseDto
        };
    }

    @Get('decisions')
    async getDecisions(): Promise<ApiResponseDto<any[]>> {
        const decisions = await this.ideasService.getRecentDecisions();
        return {
            statusCode: 1000,
            message: 'Recent decisions retrieved.',
            data: decisions
        };
    }

    @Get(':id')
    async getById(@Param('id') id: string): Promise<ApiResponseDto<IdeaResponseDto>> {
        const idea = await this.ideasService.findById(id);
        return {
            statusCode: 1000,
            message: '',
            data: IdeaMapper.schemaToResponseDto(idea)
        };
    }
}