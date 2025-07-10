import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { MoviePersonRole } from "../../shared/movie-person-role";

export class AddMultipleRolesPerMovieDto {
  @IsArray()
  @IsEnum(MoviePersonRole, { each: true })
  roles: MoviePersonRole[];

  @IsString()
  @IsNotEmpty()
  movie: string;
}