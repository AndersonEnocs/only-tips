import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { IdeaStatus } from '../schemas/idea.schema';

export class AdminDecisionDto {
    @IsEnum([IdeaStatus.SELECTED, IdeaStatus.NOT_SELECTED, IdeaStatus.REVIEWED])
    @IsNotEmpty()
    status: IdeaStatus;

    @IsString()
    @IsNotEmpty()
    @MaxLength(500)
    feedback: string;
}