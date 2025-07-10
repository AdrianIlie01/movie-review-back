import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { MoviePersonRole } from "../../shared/movie-person-role";

export class AddPersonsSingleRoleToMovieDto {
  //added role to use it in addPersonsToRoleInMovie
  @IsOptional()
  @IsEnum(MoviePersonRole)
  role?: MoviePersonRole;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  persons: string[];
}