const { Kafka } = require('kafkajs');

const kafka = new Kafka({ clientId: 'order-producer', brokers: ['localhost:9092'] });
const producer = kafka.producer();

const sendOrderPlaced = async () => {
  await producer.connect();

  const event = {
    orderId: `order-${Date.now()}`,
    productId: 'prod-123',
    quantity: 99,
    userId: 'user-99',
    status: 'created',
    timestamp: new Date(),
  };

  await producer.send({
    topic: 'order-placed',
    messages: [{ key: event.orderId, value: JSON.stringify(event) }],
  });

  console.log(`🚚 Sent order-placed event: ${event.orderId}`);
  await producer.disconnect();
};

sendOrderPlaced();
