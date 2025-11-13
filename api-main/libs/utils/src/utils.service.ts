import { Injectable } from '@nestjs/common';

@Injectable()
export class UtilsService {
    sum(a: number, b: number): number {
        return a + b;
    }
}
