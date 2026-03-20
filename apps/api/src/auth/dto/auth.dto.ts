import { IsEmail, IsString, MinLength, MaxLength, IsOptional, Matches } from 'class-validator';

export class SignupDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(100)
  password: string;

  @IsString()
  @MinLength(3)
  @MaxLength(30)
  @Matches(/^[a-z0-9_]+$/, {
    message: 'Username must be lowercase alphanumeric with underscores only',
  })
  username: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  displayName?: string;

  @IsOptional()
  @IsString()
  preferredLanguage?: string;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(1)
  password: string;
}
