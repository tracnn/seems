import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { CreateUserCommand } from '../impl/create-user.command';
import { UpdateUserCommand } from '../impl/update-user.command';
import { DeleteUserCommand } from '../impl/delete-user.command';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
    private readonly logger = new Logger(CreateUserHandler.name);
    async execute(command: CreateUserCommand): Promise<any> {
        this.logger.log(`Tạo user: ${command.username}`);
        try {
            // TODO: Implement create logic
            const result = {};
            this.logger.log('Tạo user thành công');
            return result;
        } catch (error) {
            this.logger.error('Lỗi khi tạo user', error.stack);
            throw error;
        }
    }
}

@CommandHandler(UpdateUserCommand)
export class UpdateUserHandler implements ICommandHandler<UpdateUserCommand> {
    private readonly logger = new Logger(UpdateUserHandler.name);
    async execute(command: UpdateUserCommand): Promise<any> {
        this.logger.log(`Cập nhật user: ${command.id}`);
        try {
            // TODO: Implement update logic
            const result = {};
            this.logger.log('Cập nhật user thành công');
            return result;
        } catch (error) {
            this.logger.error('Lỗi khi cập nhật user', error.stack);
            throw error;
        }
    }
}

@CommandHandler(DeleteUserCommand)
export class DeleteUserHandler implements ICommandHandler<DeleteUserCommand> {
    private readonly logger = new Logger(DeleteUserHandler.name);
    async execute(command: DeleteUserCommand): Promise<any> {
        this.logger.warn(`Xóa (mềm) user: ${command.id}`);
        try {
            // TODO: Implement soft delete logic
            const result = {};
            this.logger.log('Xóa (mềm) user thành công');
            return result;
        } catch (error) {
            this.logger.error('Lỗi khi xóa (mềm) user', error.stack);
            throw error;
        }
    }
} 