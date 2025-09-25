import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { SyncUsersToMeilisearchCommand } from "./sync-users-to-meilisearch.command";
import { MeilisearchService } from "../../meilisearch/meilisearch.service";
import { User } from "@user/entities/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { DOCUMENT_SCHEMA } from "src/constants/common.constant";

@CommandHandler(SyncUsersToMeilisearchCommand)
export class SyncUsersToMeilisearchHandler implements ICommandHandler<SyncUsersToMeilisearchCommand> {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly meilisearchService: MeilisearchService) {}

    async execute(command: SyncUsersToMeilisearchCommand) {
        const users = await this.userRepository.find();

        // const documents = users.map(user => instanceToPlain(user));
        const documents = users.map(user => ({
            id: user.id,
            username: user.username,
            email: user.email,
            fullName: user.fullName,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            isActive: user.isActive,
          }));

        try {
            await this.meilisearchService.addDocuments(DOCUMENT_SCHEMA.USER, documents);

            // 2️⃣ Auto detect fields để set sortableAttributes
            const exampleDoc = documents[0] || {};  // Nếu users = []
            const sortableFields = Object.keys(exampleDoc);

            if (sortableFields.length > 0) {
                await this.meilisearchService.updateSortableAttributes(DOCUMENT_SCHEMA.USER, sortableFields);
            }
        } catch (error) {
            throw new Error('Failed to sync users to meilisearch');
        }

        return 'ok';
    }
}