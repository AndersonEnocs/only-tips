import { PipelineStage, Types } from 'mongoose';

export const QueryAdmin = {
    listIdeas: (page: number, limit: number, status?: string): PipelineStage[] => {
        const skip = (page - 1) * limit;
        const match: any = {};
        if (status) match.status = status;

        return [
            { $match: match },
            { $sort: { created_at: -1 } },
            {
                $facet: {
                    data: [{ $skip: skip }, { $limit: limit }],
                    totalCount: [{ $count: 'count' }]
                }
            },
            {
                $project: {
                    data: 1,
                    totalItems: { $ifNull: [{ $arrayElemAt: ['$totalCount.count', 0] }, 0] },
                    totalPages: {
                        $ceil: { $divide: [{ $ifNull: [{ $arrayElemAt: ['$totalCount.count', 0] }, 0] }, limit] }
                    },
                    currentPage: { $literal: page }
                }
            }
        ];
    }
};