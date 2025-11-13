import { Injectable } from '@nestjs/common';

@Injectable()
export class CalatogServiceService {
  getHello(): string {
    return 'Hello World!';
  }
}
