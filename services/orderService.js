// services/orderService.js
const mongoose = require('mongoose');
const { sendToDeadLetterQueue } = require('../utils/deadLetter');

const orderSchema = new mongoose.Schema({
  orderId: String,
  productId: String,
  quantity: Number,
  userId: String,
  status: String,
  timestamp: Date,
});

const Order = mongoose.model('Order', orderSchema, 'orders');

const saveOrder = async (data) => {
  try {
    const order = new Order(data);
    await order.save();
    console.log(`📝 Order saved: ${order.orderId}`);
  } catch (error) {
    console.error(`❌ Failed to save order: ${data.orderId}`, error.message);
    await sendToDeadLetterQueue('OrderSaveError', { ...data, error: error.message });
  }
};

module.exports = { saveOrder };
