import { CanActivate, ExecutionContext, Injectable, ForbiddenException, Logger } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class SignatureGuard implements CanActivate {
    private readonly logger = new Logger(SignatureGuard.name);

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    const signature = request.headers['x-signature'];
    const secret = process.env.INIT_SIGNATURE_SECRET;

    if (!signature || !secret) {
      this.logger.error('Missing signature or server secret');
      throw new ForbiddenException('Missing signature or server secret');
    }

    const expected = crypto
      .createHmac('sha256', secret)
      .update('protected-endpoint')
      .digest('hex');

    this.logger.log(`Signature: ${signature} - Expected: ${expected}`);

    if (signature !== expected) {
      this.logger.error('Invalid signature');
      throw new ForbiddenException('Invalid signature');
    }

    return true;
  }
}