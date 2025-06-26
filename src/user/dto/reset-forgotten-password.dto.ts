import { IsNotEmpty, MinLength } from 'class-validator';

export class ResetForgottenPasswordDto {
  @IsNotEmpty({ message: 'The otp is required - dto' })
  otp: string;

  @IsNotEmpty({ message: 'newPass empty - dto' })
  @MinLength(4, { message: 'New Password must be at least 4 characters long.' })
  newPassword: string;

  @IsNotEmpty({ message: 'verifyPass empty - dto' })
  @MinLength(4, { message: 'Confirm Password must be at least 4 characters long.' })
  verifyPassword: string;
}
