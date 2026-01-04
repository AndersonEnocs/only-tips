import { IsEmail, IsNotEmpty, IsString, IsBoolean, IsOptional, MaxLength } from 'class-validator';

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
}