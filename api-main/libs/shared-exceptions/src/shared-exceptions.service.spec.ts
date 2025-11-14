import { Test, TestingModule } from '@nestjs/testing';
import { SharedExceptionsService } from './shared-exceptions.service';

describe('SharedExceptionsService', () => {
  let service: SharedExceptionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SharedExceptionsService],
    }).compile();

    service = module.get<SharedExceptionsService>(SharedExceptionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
