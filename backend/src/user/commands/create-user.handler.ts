import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserCommand } from './create-user.command';
import { Inject } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthService } from '../../auth/auth.service';
import { MeilisearchService } from '../../meilisearch/meilisearch.service';
import { DOCUMENT_SCHEMA } from 'src/constants/common.constant';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        private readonly authService: AuthService,
        private readonly meilisearchService: MeilisearchService,
    ) {}

    async execute(command: CreateUserCommand): Promise<User> {
        const user = this.userRepo.create(command.dto);
        const hashedPassword = await this.authService.hashPassword(command.dto.password);
        user.password = hashedPassword;
        const savedUser = await this.userRepo.save(user);

        const document = JSON.parse(JSON.stringify(savedUser));
        await this.meilisearchService.addDocuments(DOCUMENT_SCHEMA.USER, [document]);

        return savedUser;
    }
}