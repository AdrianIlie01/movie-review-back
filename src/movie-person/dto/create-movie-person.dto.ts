import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import { MoviePersonRole } from "../../shared/movie-person-role";

export class CreateMoviePersonDto {
  @IsString()
  @IsNotEmpty()
  room_name: string;

  @IsString()
  @IsNotEmpty()
  person_name: string;

  @IsEnum(MoviePersonRole)
  role: MoviePersonRole;
}