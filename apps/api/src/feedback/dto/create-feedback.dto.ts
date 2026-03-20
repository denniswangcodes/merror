import { IsBoolean, IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateFeedbackDto {
  @IsString()
  @MinLength(1)
  receiverId: string;

  @IsEnum(['COMPLIMENT', 'HELPFUL_ACT', 'MEMORY'])
  type: 'COMPLIMENT' | 'HELPFUL_ACT' | 'MEMORY';

  @IsString()
  @MinLength(1)
  @MaxLength(280)
  message: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
