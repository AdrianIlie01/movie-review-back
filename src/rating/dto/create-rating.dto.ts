import { IsArray, IsEnum, IsNotEmpty, IsString } from "class-validator";
import { RatingType } from "../../shared/rating-type";
import { MovieType } from "../../shared/movie-type";
import { MoviePersonRole } from "../../shared/movie-person-role";

export class CreateRatingDto {
  @IsString()
  @IsNotEmpty()
  rating: string;


  // i can use it to share top x persons or movies
  // @IsArray()
  // @IsEnum(RatingType, { each: true })
  // type?: (MoviePersonRole | MovieType)[];

}
