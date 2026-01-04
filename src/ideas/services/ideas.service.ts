import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Idea, IdeaDocument, IdeaStatus } from '../schemas/idea.schema';
import { QueryIdea } from '../queries/query-idea';

@Injectable()
export class IdeasService {
    constructor(
        @InjectModel(Idea.name) private readonly ideaModel: Model<IdeaDocument>
    ) {}

    async create(idea: Idea): Promise<Idea> {
        return await new this.ideaModel(idea).save();
    }

    async findById(id: string): Promise<Idea> {
        const idea = await this.ideaModel.findById(new Types.ObjectId(id));
        if (!idea) throw new NotFoundException('Idea not found');
        return idea as Idea;
    }

    async getRecentDecisions(): Promise<any[]> {
        return this.ideaModel.aggregate(QueryIdea.getPublicDecisions(15));
    }

    async updateStatus(id: string, updateData: Partial<Idea>): Promise<Idea> {
        const updated = await this.ideaModel.findByIdAndUpdate(
            new Types.ObjectId(id),
            { $set: { ...updateData, updatedAt: new Date() } },
            { new: true }
        );
        if (!updated) throw new NotFoundException('Idea not found');
        return updated as Idea;
    }

    async updateStripeSessionId(id: string, sessionId: string): Promise<Idea> {
        return this.updateStatus(id, { stripe_session_id: sessionId });
    }

    async confirmPayment(id: string, paymentIntentId: string): Promise<Idea> {
        return this.updateStatus(id, {
            status: IdeaStatus.RECEIVED,
            stripe_payment_intent: paymentIntentId
        });
    }
}