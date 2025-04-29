// utils/deadLetter.js
const { Kafka } = require('kafkajs');

const kafka = new Kafka({ clientId: 'dead-letter-producer', brokers: ['localhost:9092'] });
const producer = kafka.producer();
let isConnected = false;

const sendToDeadLetterQueue = async (reason, payload) => {
  if (!isConnected) {
    await producer.connect();
    isConnected = true;
  }

  const message = {
    reason,
    timestamp: new Date().toISOString(),
    payload
  };

  await producer.send({
    topic: 'dead-letter-orders',
    messages: [{ key: reason, value: JSON.stringify(message) }],
  });

  console.warn(`🪦 Dead-letter logged [${reason}] for product ${payload.productId || 'unknown'}`);
};

module.exports = { sendToDeadLetterQueue };
