import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Idea, IdeaDocument } from '../../ideas/schemas/idea.schema';
import { QueryAdmin } from '../../ideas/queries/query-admin';
import { DefaultSettingsService } from '../../default-settings/services/default-settings.service';
import { SETTING_FUND_TOTAL, constantsAppSettings } from '../../shared/consts';

@Injectable()
export class AdminService {
    constructor(
        @InjectModel(Idea.name) private readonly ideaModel: Model<IdeaDocument>,
        private readonly settingsService: DefaultSettingsService
    ) {}

    async getDashboardIdeas(page: number, limit: number, status?: string) {
        const result = await this.ideaModel.aggregate(QueryAdmin.listIdeas(page, limit, status));
        return result[0];
    }

    async makeDecision(ideaId: string, status: string, feedback: string) {
        return this.ideaModel.findByIdAndUpdate(
            new Types.ObjectId(ideaId),
            {
                $set: {
                    status,
                    reviewer_feedback: feedback,
                    decision_date: new Date(),
                    updated_at: new Date()
                }
            },
            { new: true }
        );
    }

    async updateGlobalFund(amount: number) {
        await this.settingsService.upsertSetting({ attribute: SETTING_FUND_TOTAL, value: amount.toString() });
        constantsAppSettings.fundTotal = amount;
        return { newTotal: amount };
    }
}