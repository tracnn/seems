import { Provider } from '@nestjs/common';
import { getDataSourceToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

export function registerExtendedRepo<T extends object>(
    entity: new () => any,
    repoFactory: (repo: Repository<any>) => T,
    token: string,
    connectionName: string = 'default',
): Provider {
    return {
        provide: token,
        inject: [getDataSourceToken(connectionName)],
        useFactory: (dataSource: DataSource) => {
            const baseRepo = dataSource.getRepository(entity);
            return repoFactory(baseRepo);
        },
    };
}