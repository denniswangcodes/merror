import { IsBoolean, IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateFeedbackDto {
  /** Omit to log a private journal entry about someone who isn't on Merror yet. */
  @IsOptional()
  @IsString()
  @MinLength(1)
  receiverId?: string;

  /** Optional free-text name of the recipient, used only when receiverId is omitted. */
  @IsOptional()
  @IsString()
  @MaxLength(60)
  recipientName?: string;

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
