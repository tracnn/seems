import { Module } from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';

/**
 * Shared Guards Module
 * Cung cấp các guard dùng chung cho toàn bộ microservices
 *
 * Bao gồm:
 * - JwtAuthGuard: Xác thực JWT token
 * - RolesGuard: Phân quyền dựa trên roles
 */
@Module({
  providers: [JwtAuthGuard, RolesGuard],
  exports: [JwtAuthGuard, RolesGuard],
})
export class SharedGuardsModule {}
