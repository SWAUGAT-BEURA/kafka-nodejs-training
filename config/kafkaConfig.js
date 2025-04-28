module.exports = {
    clientId: 'nodejs-kafka-app',
    brokers: ['localhost:9092'],
    topic: 'orders',
    connectionTimeout: 10000, // Increase connection timeout (10 seconds)
    retry: {
        initialRetryTime: 100,
        retries: 10
    }
};