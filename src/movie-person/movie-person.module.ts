import { Module } from '@nestjs/common';
import { MoviePersonService } from './movie-person.service';
import { MoviePersonController } from './movie-person.controller';
import { JwtService } from "@nestjs/jwt";

@Module({
  controllers: [MoviePersonController],
  providers: [MoviePersonService, JwtService],
})
export class MoviePersonModule {}
