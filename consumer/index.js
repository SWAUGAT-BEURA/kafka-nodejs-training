const { consumeOrders } = require('./kafkaConsumer');

consumeOrders().catch(console.error);