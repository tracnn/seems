import { Test, TestingModule } from '@nestjs/testing';
import { Qd3176Controller } from './qd3176.controller';
import { Qd3176Service } from './qd3176.service';

describe('Qd3176Controller', () => {
  let controller: Qd3176Controller;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [Qd3176Controller],
      providers: [Qd3176Service],
    }).compile();

    controller = module.get<Qd3176Controller>(Qd3176Controller);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
