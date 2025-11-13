import { Test, TestingModule } from '@nestjs/testing';
import { CalatogServiceController } from './calatog-service.controller';
import { CalatogServiceService } from './calatog-service.service';

describe('CalatogServiceController', () => {
  let calatogServiceController: CalatogServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [CalatogServiceController],
      providers: [CalatogServiceService],
    }).compile();

    calatogServiceController = app.get<CalatogServiceController>(CalatogServiceController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(calatogServiceController.getHello()).toBe('Hello World!');
    });
  });
});
