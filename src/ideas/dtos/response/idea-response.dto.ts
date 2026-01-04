export class IdeaResponseDto {
    id: string;
    title: string;
    description: string;
    email: string;
    status: string;
    isPublic: boolean;
    reviewerFeedback?: string;
    decisionDate?: Date;
    createdAt: Date;
    stripeSessionId?: string;
}