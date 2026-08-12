import { IsString, Matches, MaxLength, ValidateIf } from 'class-validator';
import { IMAGE_VALUE_PATTERN, MAX_REFLECTION_IMAGE_CHARS } from '../../common/image-validation';

export class UpdateFeedbackDto {
  /** A data URI, an external URL, or null to remove the photo. Required — this endpoint only edits the photo. */
  @ValidateIf((o) => o.imageUrl !== null)
  @IsString()
  @Matches(IMAGE_VALUE_PATTERN)
  @MaxLength(MAX_REFLECTION_IMAGE_CHARS)
  imageUrl: string | null;
}
