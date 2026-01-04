import { IdeaResponseDto } from './idea-response.dto';

export class SubmitIdeaResponseDto {
    idea: IdeaResponseDto;
    checkoutUrl: string;
}