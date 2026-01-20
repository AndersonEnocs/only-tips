import { IsEmail, IsNotEmpty, IsString, IsBoolean, IsOptional, MaxLength, IsEnum, IsNumber, IsPositive } from 'class-validator';
import { PaymentMethod } from '../../payments/schemas/payment.schema';

export class SubmitIdeaDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    title: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(2000)
    description: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsBoolean()
    @IsOptional()
    isPublic?: boolean;

    @IsEnum(PaymentMethod)
    @IsNotEmpty()
    paymentMethod: PaymentMethod;

    @IsString()
    @IsNotEmpty()
    firstName: string;

    @IsString()
    @IsNotEmpty()
    lastName: string;

    @IsString()
    @IsNotEmpty()
    phoneNumber: string;

    @IsString()
    @IsNotEmpty()
    address: string;

    @IsNumber()
    @IsPositive()
    fundingGoal: number;
}