const { Kafka } = require('kafkajs');
const { saveOrder } = require('../services/orderService');
const { updateInventory, getInventory } = require('../services/inventoryService');
const { sendToDeadLetterQueue } = require('../utils/deadLetter');

const kafka = new Kafka({
  clientId: 'inventory-app',
  brokers: ['localhost:9092'],
});

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

      try {
        if (topic === 'order-placed') {
          const currentStock = await getInventory(productId);
          console.log(1)
        
          if (currentStock >= quantity) {
            console.log("current stock is more")
            // Step 1: Try updating inventory first
            const updated = await updateInventory(productId, -quantity);
            if (updated) {
              // Step 2: Only save the order if inventory update succeeded
              await saveOrder(data);
              console.log(`🛠️ Inventory updated & order saved: ${productId} → ${currentStock - quantity}`);
            } else {
              // If inventory update fails for any reason
              console.warn(`⚠️ Failed to update inventory for ${productId}. Order not saved.`);
              await sendToDeadLetterQueue('InventoryUpdateFailed', { ...data, error: 'Inventory update failed' });
            }
          } else {
            // Insufficient stock
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

      } catch (err) {
        console.error(`❌ Error processing message from topic "${topic}":`, err);
        await sendToDeadLetterQueue('ProcessingError', { topic, error: err.message, data });
      }
    },
  });
};

module.exports = { startConsumer };
