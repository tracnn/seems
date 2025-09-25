import { Controller, UseGuards } from '@nestjs/common';
import { MeilisearchService } from './meilisearch.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Meilisearch')
@ApiBearerAuth('access-token')
// @UseGuards(JwtAdminAuthGuard)
@Controller('meilisearch')
export class MeilisearchController {
  constructor(private readonly meilisearchService: MeilisearchService) {}
}