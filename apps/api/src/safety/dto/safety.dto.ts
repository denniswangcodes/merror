import { IsEnum, IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export const REPORT_REASONS = ['HARASSMENT', 'HATE_SPEECH', 'SEXUAL_CONTENT', 'VIOLENCE', 'SPAM', 'IMPERSONATION', 'PRIVACY', 'OTHER'] as const;

export class CreateReportDto {
  @IsOptional()
  @IsString()
  feedbackId?: string;

  @IsOptional()
  @IsString()
  reportedUserId?: string;

  @IsEnum(REPORT_REASONS)
  reason: typeof REPORT_REASONS[number];

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  details?: string;
}

export class ReviewReportDto {
  @IsIn(['DISMISSED', 'ACTIONED'])
  status: 'DISMISSED' | 'ACTIONED';

  @IsOptional()
  @IsString()
  @MaxLength(500)
  moderatorNote?: string;

  @IsOptional()
  @IsIn(['REMOVE_CONTENT', 'SUSPEND_USER'])
  action?: 'REMOVE_CONTENT' | 'SUSPEND_USER';
}
