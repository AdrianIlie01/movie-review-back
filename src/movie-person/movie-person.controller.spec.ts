import { Test, TestingModule } from '@nestjs/testing';
import { MoviePersonController } from './movie-person.controller';
import { MoviePersonService } from './movie-person.service';

describe('MoviePersonController', () => {
  let controller: MoviePersonController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MoviePersonController],
      providers: [MoviePersonService],
    }).compile();

    controller = module.get<MoviePersonController>(MoviePersonController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
