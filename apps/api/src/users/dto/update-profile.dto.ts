import { IsOptional, IsString, Matches, MaxLength, ValidateIf } from 'class-validator';
import { IMAGE_VALUE_PATTERN, MAX_AVATAR_IMAGE_CHARS } from '../../common/image-validation';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(60)
  displayName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  bio?: string;

  /** A data URI, an external URL, or null to remove the avatar. */
  @IsOptional()
  @ValidateIf((o) => o.avatarUrl !== null)
  @IsString()
  @Matches(IMAGE_VALUE_PATTERN)
  @MaxLength(MAX_AVATAR_IMAGE_CHARS)
  avatarUrl?: string | null;

  @IsOptional()
  @IsString()
  preferredLanguage?: string;
}
