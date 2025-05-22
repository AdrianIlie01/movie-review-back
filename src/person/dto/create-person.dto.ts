import { IsArray, IsDateString, IsEnum, IsOptional, IsString } from "class-validator";
import { MoviePersonRole } from "../../shared/movie-person-role";
import { MovieType } from "../../shared/movie-type";

export class CreatePersonDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  born?: Date;

  @IsArray()
  @IsEnum(MoviePersonRole, { each: true })
  roles: MoviePersonRole[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}
