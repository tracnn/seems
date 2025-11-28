import { Test, TestingModule } from '@nestjs/testing';
import { SharedConstantsService } from './shared-constants.service';

describe('SharedConstantsService', () => {
  let service: SharedConstantsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SharedConstantsService],
    }).compile();

    service = module.get<SharedConstantsService>(SharedConstantsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
