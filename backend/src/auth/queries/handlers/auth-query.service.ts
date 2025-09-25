import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { GetMeQuery } from '../impl/get-me.query';

@QueryHandler(GetMeQuery)
export class GetMeHandler implements IQueryHandler<GetMeQuery> {
    private readonly logger = new Logger(GetMeHandler.name);
    async execute(query: GetMeQuery): Promise<any> {
        this.logger.log(`Lấy thông tin user hiện tại: ${query.userId}`);
        try {
            // TODO: Implement get current user logic
            const result = {};
            this.logger.log('Lấy thông tin user hiện tại thành công');
            return result;
        } catch (error) {
            this.logger.error('Lỗi khi lấy thông tin user hiện tại', error.stack);
            throw error;
        }
    }
} 