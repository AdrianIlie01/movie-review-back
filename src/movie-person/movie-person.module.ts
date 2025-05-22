import { Module } from '@nestjs/common';
import { MoviePersonService } from './movie-person.service';
import { MoviePersonController } from './movie-person.controller';

@Module({
  controllers: [MoviePersonController],
  providers: [MoviePersonService],
})
export class MoviePersonModule {}
