import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

// Commands
import { CreateOrganizationCommand } from '../../application/use-cases/commands/organizations/create-organization/create-organization.command';
import { UpdateOrganizationCommand } from '../../application/use-cases/commands/organizations/update-organization/update-organization.command';
import { DeleteOrganizationCommand } from '../../application/use-cases/commands/organizations/delete-organization/delete-organization.command';

// Queries
import { GetOrganizationsQuery } from '../../application/use-cases/queries/organizations/get-organizations/get-organizations.query';
import { GetOrganizationByIdQuery } from '../../application/use-cases/queries/organizations/get-organization-by-id/get-organization-by-id.query';

/**
 * IAM Organizations Controller - TCP Microservice
 * Handles organization management via message patterns
 */
@Controller()
export class OrganizationsController {
  private readonly logger = new Logger(OrganizationsController.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  /**
   * Get organizations list
   * Pattern: iam.organization.list
   */
  @MessagePattern('iam.organization.list')
  async getOrganizations(@Payload() filters?: any) {
    try {
      this.logger.log('Getting organizations list');

      const query = new GetOrganizationsQuery(filters || {});
      const result = await this.queryBus.execute(query);

      this.logger.log(
        `Found ${result.length || result.data?.length || 0} organizations`,
      );
      return result;
    } catch (error) {
      this.logger.error(`Failed to get organizations: ${error.message}`);
      throw new RpcException({
        statusCode: error.status || 500,
        message: error.message || 'Failed to get organizations',
      });
    }
  }

  /**
   * Get organization by ID
   * Pattern: iam.organization.findById
   */
  @MessagePattern('iam.organization.findById')
  async getOrganizationById(@Payload() data: { organizationId: string }) {
    try {
      this.logger.log(`Getting organization by ID: ${data.organizationId}`);

      const query = new GetOrganizationByIdQuery(data.organizationId);
      const organization = await this.queryBus.execute(query);

      this.logger.log(`Organization found: ${organization.name}`);
      return organization;
    } catch (error) {
      this.logger.error(`Failed to get organization: ${error.message}`);
      throw new RpcException({
        statusCode: error.status || 404,
        message: error.message || 'Organization not found',
      });
    }
  }

  /**
   * Create new organization
   * Pattern: iam.organization.create
   */
  @MessagePattern('iam.organization.create')
  async createOrganization(@Payload() data: any) {
    try {
      this.logger.log(`Creating organization: ${data.name}`);

      const command = new CreateOrganizationCommand(
        data.name,
        data.code,
        data.type,
        data.parentId,
        data.address,
        data.phone,
        data.email,
        data.website,
        data.createdBy || 'system',
      );

      const organization = await this.commandBus.execute(command);
      this.logger.log(`Organization created successfully: ${organization.id}`);
      return organization;
    } catch (error) {
      this.logger.error(`Failed to create organization: ${error.message}`);
      throw new RpcException({
        statusCode: error.status || 400,
        message: error.message || 'Failed to create organization',
      });
    }
  }

  /**
   * Update organization
   * Pattern: iam.organization.update
   */
  @MessagePattern('iam.organization.update')
  async updateOrganization(@Payload() data: any) {
    try {
      this.logger.log(`Updating organization: ${data.organizationId}`);

      const command = new UpdateOrganizationCommand(
        data.organizationId,
        data.name,
        data.code,
        data.type,
        data.parentId,
        data.address,
        data.phone,
        data.email,
        data.website,
        data.isActive,
        data.updatedBy || 'system',
      );

      const organization = await this.commandBus.execute(command);
      this.logger.log(`Organization updated successfully: ${organization.id}`);
      return organization;
    } catch (error) {
      this.logger.error(`Failed to update organization: ${error.message}`);
      throw new RpcException({
        statusCode: error.status || 400,
        message: error.message || 'Failed to update organization',
      });
    }
  }

  /**
   * Delete organization (soft delete)
   * Pattern: iam.organization.delete
   */
  @MessagePattern('iam.organization.delete')
  async deleteOrganization(
    @Payload() data: { organizationId: string; deletedBy?: string },
  ) {
    try {
      this.logger.log(`Deleting organization: ${data.organizationId}`);

      const command = new DeleteOrganizationCommand(
        data.organizationId,
        data.deletedBy || 'system',
      );

      await this.commandBus.execute(command);
      this.logger.log(
        `Organization deleted successfully: ${data.organizationId}`,
      );
      return { success: true, message: 'Organization deleted successfully' };
    } catch (error) {
      this.logger.error(`Failed to delete organization: ${error.message}`);
      throw new RpcException({
        statusCode: error.status || 400,
        message: error.message || 'Failed to delete organization',
      });
    }
  }
}
