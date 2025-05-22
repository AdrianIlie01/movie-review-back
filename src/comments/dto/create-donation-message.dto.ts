import { IsNotEmpty, IsString } from "class-validator";

export class CreateDonationMessageDto {
  @IsString()
  @IsNotEmpty()
  text: string;

  @IsString()
  @IsNotEmpty()
  amount: string
}