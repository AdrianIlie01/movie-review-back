import { IsArray, IsEnum, IsString } from "class-validator";
import { MovieType } from "../../shared/movie-type";
import { Optional } from "@nestjs/common";

export class CreateRoomDto {
  @IsString()
  name: string;

  @IsString()
  stream_url: string;

  @Optional()
  thumbnail?: string;

  @IsArray()
  @IsEnum(MovieType, { each: true })
  type?: MovieType[];

  @IsString()
  release_year: string;

}
