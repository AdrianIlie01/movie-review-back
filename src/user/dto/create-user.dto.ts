import { IsEmail, IsNotEmpty, MinLength } from "class-validator";

export class CreateUserDto {

  // @IsNotEmpty({message: 'Username must not be empty - dto'})
  username: string;

  @IsNotEmpty({message: 'Password must not be empty'})
  @MinLength(4, {message: 'Password bust be at least 4 characters long.'})
  password: string;

  @IsNotEmpty({message: 'Email must not be empty'})
  @IsEmail({}, {message: 'Email is invalid.'})
  email: string;

}
