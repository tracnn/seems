import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { RefreshToken } from '../../../../domain/entities/refresh-token.entity';
import { IRefreshTokenRepository } from '../../../../domain/interfaces/refresh-token.repository.interface';

@Injectable()
export class RefreshTokenRepository implements IRefreshTokenRepository {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly repository: Repository<RefreshToken>,
  ) {}

  async findByToken(token: string): Promise<RefreshToken | null> {
    return this.repository.findOne({
      where: { token },
      relations: ['user'],
    });
  }

  async findByUserId(userId: string): Promise<RefreshToken[]> {
    return this.repository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async create(refreshToken: Partial<RefreshToken>): Promise<RefreshToken> {
    const newToken = this.repository.create(refreshToken);
    return this.repository.save(newToken);
  }

  async revoke(token: string): Promise<void> {
    await this.repository.update(
      { token },
      { isRevoked: true, updatedAt: new Date() },
    );
  }

  async revokeAllByUserId(userId: string): Promise<void> {
    await this.repository.update(
      { userId, isRevoked: false },
      { isRevoked: true, updatedAt: new Date() },
    );
  }

  async deleteExpired(): Promise<void> {
    await this.repository.delete({
      expiresAt: LessThan(new Date()),
    });
  }
}

