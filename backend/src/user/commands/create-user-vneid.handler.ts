import { ICommandHandler } from "@nestjs/cqrs";
import { CreateUserVneidCommand } from "./create-user-vneid.command";
import { CommandHandler } from "@nestjs/cqrs";
import { User } from "@user/entities/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { plainToInstance } from "class-transformer";
import { UserResponseDto } from "../dto/user-response.dto";
import { DOCUMENT_SCHEMA } from "src/constants/common.constant";
import { MeilisearchService } from "../../meilisearch/meilisearch.service";

@CommandHandler(CreateUserVneidCommand)
export class CreateUserVneidHandler implements ICommandHandler<CreateUserVneidCommand> {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly meilisearchService: MeilisearchService,
    ) {}

    async execute(command: CreateUserVneidCommand) {
        const user = this.userRepository.create(command.createUserVneidDto);
        const savedUser = await this.userRepository.save(user);

        const document = JSON.parse(JSON.stringify(plainToInstance(UserResponseDto, savedUser)));
        await this.meilisearchService.addDocuments(DOCUMENT_SCHEMA.USER, [document]);

        return plainToInstance(UserResponseDto, savedUser);
    }
}