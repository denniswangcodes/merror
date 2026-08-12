import { IsBoolean, IsEnum, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { IMAGE_VALUE_PATTERN, MAX_REFLECTION_IMAGE_CHARS } from '../../common/image-validation';

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
  @Matches(IMAGE_VALUE_PATTERN)
  @MaxLength(MAX_REFLECTION_IMAGE_CHARS)
  imageUrl?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
