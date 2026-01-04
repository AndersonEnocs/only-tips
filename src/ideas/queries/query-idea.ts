import { PipelineStage } from 'mongoose';
import { IdeaStatus } from '../schemas/idea.schema';

export const QueryIdea = {
    getPublicDecisions: (limit: number = 10): PipelineStage[] => {
        return [
            {
                $match: {
                    status: { $in: [IdeaStatus.REVIEWED, IdeaStatus.SELECTED, IdeaStatus.NOT_SELECTED] },
                    is_public: true
                }
            },
            { $sort: { decision_date: -1 } },
            { $limit: limit },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    status: 1,
                    decision_date: 1,
                    createdAt: 1,
                    // Anonimización profesional del email para el frontend Tesla
                    masked_owner: {
                        $concat: [
                            { $substr: ["$email", 0, 2] },
                            "***",
                            { $substr: ["$email", { $indexOfBytes: ["$email", "@"] }, -1] }
                        ]
                    }
                }
            }
        ];
    }
};