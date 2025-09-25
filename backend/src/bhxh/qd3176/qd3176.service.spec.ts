import { Test, TestingModule } from '@nestjs/testing';
import { Qd3176Service } from './qd3176.service';

describe('Qd3176Service', () => {
  let service: Qd3176Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Qd3176Service],
    }).compile();

    service = module.get<Qd3176Service>(Qd3176Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
