import { IsNotEmpty, MinLength } from 'class-validator';

export class UpdatePasswordDto {
  @IsNotEmpty({ message: 'Current password is required!' })
  currentPassword: string; // for loggedIn user

  @IsNotEmpty({ message: 'New Password is required!' })
  @MinLength(4, { message: 'New Password must be at least 4 characters long.' })
  newPassword: string;

  @IsNotEmpty({ message: 'Please confirm your password!' })
  @MinLength(4, { message: 'Confirm Password must be at least 4 characters long.' })
  verifyPassword: string;

}
