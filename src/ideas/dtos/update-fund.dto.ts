import { IsNumber, IsNotEmpty, Min } from 'class-validator';

export class UpdateFundDto {
    @IsNumber()
    @IsNotEmpty()
    @Min(0)
    amount: number;
}