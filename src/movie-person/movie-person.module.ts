import { Module } from '@nestjs/common';
import { MoviePersonService } from './movie-person.service';
import { MoviePersonController } from './movie-person.controller';
import { JwtService } from "@nestjs/jwt";
import { PersonModule } from "../person/person.module";

@Module({
  imports: [PersonModule],
  controllers: [MoviePersonController],
  providers: [MoviePersonService, JwtService],
})
export class MoviePersonModule {}
