import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { MoviePersonRole } from "../../shared/movie-person-role";

export class AddRolesPersonForMovieDto {
  @IsOptional()
  @IsArray()
  @IsEnum(MoviePersonRole, { each: true })
  roles?: MoviePersonRole[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  movies?: string[];
}