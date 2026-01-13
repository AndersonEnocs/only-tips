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
    },

    getStatistics: (): PipelineStage[] => {
        return [
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            },
            {
                $group: {
                    _id: null,
                    totalIdeas: { $sum: '$count' },
                    pendingPayment: {
                        $sum: {
                            $cond: [{ $eq: ['$_id', 'PENDING_PAYMENT'] }, '$count', 0]
                        }
                    },
                    received: {
                        $sum: {
                            $cond: [{ $eq: ['$_id', 'RECEIVED'] }, '$count', 0]
                        }
                    },
                    reviewed: {
                        $sum: {
                            $cond: [{ $eq: ['$_id', 'REVIEWED'] }, '$count', 0]
                        }
                    },
                    selected: {
                        $sum: {
                            $cond: [{ $eq: ['$_id', 'SELECTED'] }, '$count', 0]
                        }
                    },
                    notSelected: {
                        $sum: {
                            $cond: [{ $eq: ['$_id', 'NOT_SELECTED'] }, '$count', 0]
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    totalIdeas: 1,
                    pendingPayment: 1,
                    received: 1,
                    reviewed: 1,
                    selected: 1,
                    notSelected: 1
                }
            }
        ];
    }
};