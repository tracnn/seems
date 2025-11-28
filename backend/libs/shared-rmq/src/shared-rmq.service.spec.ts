import { Test, TestingModule } from '@nestjs/testing';
import { SharedRmqService } from './shared-rmq.service';

describe('SharedRmqService', () => {
  let service: SharedRmqService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SharedRmqService],
    }).compile();

    service = module.get<SharedRmqService>(SharedRmqService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
