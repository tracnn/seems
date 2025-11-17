import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, Logger } from '@nestjs/common';
import { DeleteUserCommand } from './delete-user.command';
import type { IUserRepository } from '../../../../../domain/interfaces/user.repository.interface';

@CommandHandler(DeleteUserCommand)
export class DeleteUserHandler implements ICommandHandler<DeleteUserCommand> {
  private readonly logger = new Logger(DeleteUserHandler.name);

  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(command: DeleteUserCommand): Promise<void> {
    this.logger.log(`Deleting user: ${command.id}`);

    const user = await this.userRepository.findById(command.id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.userRepository.softDelete(command.id, command.deletedBy);

    this.logger.log(`User deleted successfully: ${command.id}`);
  }
}

