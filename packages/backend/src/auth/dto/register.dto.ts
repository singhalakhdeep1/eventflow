import { IsEmail, IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72) // bcrypt ignores input beyond 72 bytes
  password: string;

  @IsString()
  @MaxLength(100)
  firstName: string;

  @IsString()
  @MaxLength(100)
  lastName: string;

  @IsString()
  @IsOptional()
  phone?: string;

  // ADMIN can never be self-assigned
  @IsIn(['ATTENDEE', 'ORGANIZER'])
  @IsOptional()
  role?: 'ATTENDEE' | 'ORGANIZER';
}
