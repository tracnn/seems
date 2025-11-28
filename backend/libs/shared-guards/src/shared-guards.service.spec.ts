import { Test, TestingModule } from '@nestjs/testing';
import { SharedGuardsService } from './shared-guards.service';

describe('SharedGuardsService', () => {
  let service: SharedGuardsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SharedGuardsService],
    }).compile();

    service = module.get<SharedGuardsService>(SharedGuardsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
