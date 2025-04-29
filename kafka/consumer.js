const { Kafka } = require('kafkajs');
const { saveOrder } = require('../services/orderService');
const { updateInventory, getInventory } = require('../services/inventoryService');  // We'll need a `getInventory` method

const kafka = new Kafka({ clientId: 'inventory-app', brokers: ['localhost:9092'] });
const consumer = kafka.consumer({ groupId: 'inventory-group' });

const startConsumer = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: 'order-placed', fromBeginning: true });
  await consumer.subscribe({ topic: 'order-cancelled', fromBeginning: true });
  await consumer.subscribe({ topic: 'inventory-updated', fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, message }) => {
      const data = JSON.parse(message.value.toString());
      const { productId, quantity } = data;

      if (topic === 'order-placed') {
        // Check inventory before proceeding with the order
        const currentStock = await getInventory(productId);
        if (currentStock >= quantity) {
          // There is enough stock
          await saveOrder(data);
          await updateInventory(productId, -quantity); // Deduct quantity from inventory
          console.log(`🛠️ Inventory updated: ${productId} → ${currentStock - quantity}`);
        } else {
          // Not enough stock, dead-letter the order
          console.warn(`⚠️ Insufficient stock for product ${productId}. Order rejected.`);
          await sendToDeadLetterQueue('OutOfStockOrder', { ...data, error: 'Insufficient stock' });
        }
      }

      if (topic === 'order-cancelled') {
        await updateInventory(productId, quantity);
      }

      if (topic === 'inventory-updated') {
        await updateInventory(productId, quantity, true); // absolute update
      }
    },
  });
};

module.exports = { startConsumer };
