import { Controller, Get, Put, Body, Param, Query, UsePipes, ValidationPipe, UseGuards } from '@nestjs/common';
import { AdminService } from '../services/admin.service';
import { AdminDecisionDto } from '../../ideas/dtos/admin-decision.dto';
import { UpdateFundDto } from '../../ideas/dtos/update-fund.dto';
import { AdminStatisticsDto } from '../dtos/admin-statistics.dto';
import { ApiResponseDto } from '../../shared/dtos/api-response.dto';
import { IdeaMapper } from '../../ideas/utilities/idea.mapper';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
    constructor(private readonly adminService: AdminService) {}

    @Get('ideas')
    async getIdeas(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @Query('status') status?: string
    ): Promise<ApiResponseDto<any>> {
        const result = await this.adminService.getDashboardIdeas(page, limit, status);
        return {
            statusCode: 1000,
            message: 'Dashboard data retrieved.',
            data: {
                ...result,
                data: result.data.map(i => IdeaMapper.schemaToResponseDto(i))
            }
        };
    }

    @Put('ideas/:id/decision')
    @UsePipes(new ValidationPipe({ transform: true }))
    async decide(
        @Param('id') id: string,
        @Body() dto: AdminDecisionDto
    ): Promise<ApiResponseDto<any>> {
        const updated = await this.adminService.makeDecision(id, dto.status, dto.feedback);
        if (!updated) throw new Error('Idea not found');
        return {
            statusCode: 1000,
            message: 'Decision recorded successfully.',
            data: IdeaMapper.schemaToResponseDto(updated as any)
        };
    }

    @Get('statistics')
    async getStatistics(): Promise<ApiResponseDto<AdminStatisticsDto>> {
        const statistics = await this.adminService.getStatistics();
        return {
            statusCode: 1000,
            message: 'Admin statistics retrieved successfully.',
            data: statistics
        };
    }

    @Put('settings/fund')
    @UsePipes(new ValidationPipe({ transform: true }))
    async updateFund(@Body() dto: UpdateFundDto): Promise<ApiResponseDto<any>> {
        const result = await this.adminService.updateGlobalFund(dto.amount);
        return {
            statusCode: 1000,
            message: 'OnlyTips Fund updated.',
            data: result
        };
    }

    
}