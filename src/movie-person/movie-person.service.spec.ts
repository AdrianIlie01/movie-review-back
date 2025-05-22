import { Test, TestingModule } from '@nestjs/testing';
import { MoviePersonService } from './movie-person.service';

describe('MoviePersonService', () => {
  let service: MoviePersonService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MoviePersonService],
    }).compile();

    service = module.get<MoviePersonService>(MoviePersonService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
