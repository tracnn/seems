import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateUserActiveStatusCommand } from './update-user-active-status.command';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { DOCUMENT_SCHEMA } from 'src/constants/common.constant';
import { MeilisearchService } from '../../meilisearch/meilisearch.service';

@CommandHandler(UpdateUserActiveStatusCommand)
export class UpdateUserActiveStatusHandler implements ICommandHandler<UpdateUserActiveStatusCommand> {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly meilisearchService: MeilisearchService,
    ) {}

    async execute(command: UpdateUserActiveStatusCommand): Promise<any> {
        const { userId, isActive } = command;
        const updatedUser = await this.userRepository.update(userId, { isActive: isActive ? true : false });

        const document = JSON.parse(JSON.stringify(updatedUser));
        await this.meilisearchService.addDocuments(DOCUMENT_SCHEMA.USER, [document]);

        return updatedUser;
    }
}