import { Controller, Get } from '@nestjs/common';
import { IdeasService } from '../services/ideas.service';
import { constantsAppSettings } from '../../shared/consts';
import { ApiResponseDto } from '../../shared/dtos/api-response.dto';

@Controller('public')
export class PublicController {
    constructor(private readonly ideasService: IdeasService) {}

    @Get('project-status')
    async getStatus(): Promise<ApiResponseDto<any>> {
        const decisions = await this.ideasService.getRecentDecisions();
        return {
            statusCode: 1000,
            message: 'Project status retrieved.',
            data: {
                fundTotal: constantsAppSettings.fundTotal,
                currency: 'USD',
                recentDecisions: decisions,
                submissionFee: constantsAppSettings.submissionFee
            }
        };
    }
}