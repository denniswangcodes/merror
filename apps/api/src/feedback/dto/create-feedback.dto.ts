import { IsBoolean, IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateFeedbackDto {
  @IsString()
  @MinLength(1)
  receiverId: string;

  @IsEnum(['COMPLIMENT', 'HELPFUL_ACT', 'MEMORY', 'ENCOURAGEMENT', 'COMMUNITY_SERVICE', 'ENVIRONMENTAL_ACT'])
  type: 'COMPLIMENT' | 'HELPFUL_ACT' | 'MEMORY' | 'ENCOURAGEMENT' | 'COMMUNITY_SERVICE' | 'ENVIRONMENTAL_ACT';

  @IsString()
  @MinLength(1)
  @MaxLength(280)
  message: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
