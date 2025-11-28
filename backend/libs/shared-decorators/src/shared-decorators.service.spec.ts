import { Test, TestingModule } from '@nestjs/testing';
import { SharedDecoratorsService } from './shared-decorators.service';

describe('SharedDecoratorsService', () => {
  let service: SharedDecoratorsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SharedDecoratorsService],
    }).compile();

    service = module.get<SharedDecoratorsService>(SharedDecoratorsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
