export class IdeaResponseDto {
    id: string;
    title: string;
    description: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    address: string;
    fundingGoal: number
    email: string;
    status: string;
    isPublic: boolean;
    reviewerFeedback?: string;
    decisionDate?: Date;
    createdAt: Date;
    stripeSessionId?: string;
}