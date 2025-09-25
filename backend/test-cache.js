const Redis = require('ioredis');

async function testRedisConnection() {
    const redis = new Redis({
        host: 'localhost',
        port: 6379,
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 3,
        lazyConnect: true,
        keepAlive: 30000,
        connectTimeout: 10000,
        commandTimeout: 5000,
    });

    try {
        console.log('Testing Redis connection...');
        
        // Test ping
        const pingResult = await redis.ping();
        console.log('Ping result:', pingResult);
        
        // Test set/get
        await redis.set('test:key', 'test:value', 'EX', 60);
        const getResult = await redis.get('test:key');
        console.log('Get result:', getResult);
        
        // Test delete
        await redis.del('test:key');
        const deletedResult = await redis.get('test:key');
        console.log('After delete:', deletedResult);
        
        console.log('Redis test completed successfully!');
    } catch (error) {
        console.error('Redis test failed:', error);
    } finally {
        await redis.quit();
    }
}

testRedisConnection(); 