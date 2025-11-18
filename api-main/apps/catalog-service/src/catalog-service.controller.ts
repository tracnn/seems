import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CatalogServiceService } from './catalog-service.service';

/**
 * Catalog Service Controller - TCP Microservice
 * Handles catalog operations via message patterns
 * 
 * Message Patterns:
 * - catalog.hello - Test endpoint
 */
@Controller()
export class CatalogServiceController {
  private readonly logger = new Logger(CatalogServiceController.name);

  constructor(
    private readonly catalogServiceService: CatalogServiceService,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  /**
   * Test endpoint
   * Pattern: catalog.hello
   */
  @MessagePattern('catalog.hello')
  async getHello(@Payload() data?: any): Promise<string> {
    this.logger.log('Received catalog.hello message');
    return this.catalogServiceService.getHello();
  }
}
