// kafka/inventoryInit.js
const { Kafka } = require('kafkajs');

const kafka = new Kafka({ clientId: 'inventory-init', brokers: ['localhost:9092'] });
const producer = kafka.producer();

const run = async () => {
  await producer.connect();

  const event = {
    productId: 'prod-123',
    quantity: 100 // absolute stock value
  };

  await producer.send({
    topic: 'inventory-updated',
    messages: [{ key: event.productId, value: JSON.stringify(event) }],
  });

  console.log(`🧾 Inventory initialized for ${event.productId}`);
  await producer.disconnect();
};

run();
