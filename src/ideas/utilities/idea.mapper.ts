import { Idea, IdeaStatus } from '../schemas/idea.schema';
import { SubmitIdeaDto } from '../dtos/submit-idea.dto';
import { IdeaResponseDto } from '../dtos/response/idea-response.dto';
import { Types } from 'mongoose';

export class IdeaMapper {
    static dtoToSchema(dto: SubmitIdeaDto): Idea {
        return {
            title: dto.title,
            description: dto.description,
            email: dto.email,
            is_public: dto.isPublic !== undefined ? dto.isPublic : true,
            status: IdeaStatus.PENDING_PAYMENT
        };
    }

    static schemaToResponseDto(schema: Idea): IdeaResponseDto {
        return {
            id: schema._id?.toString() || '',
            title: schema.title,
            description: schema.description,
            email: schema.email,
            status: schema.status,
            isPublic: schema.is_public,
            reviewerFeedback: schema.reviewer_feedback,
            decisionDate: schema.decision_date,
            createdAt: (schema as any).createdAt || new Date(),
            stripeSessionId: schema.stripe_session_id
        };
    }
}