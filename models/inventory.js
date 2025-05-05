const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  productId: { type: String, required: true, unique: true },
  quantity: { type: Number, required: true, default: 0 },
}, {
  timestamps: true,
  collection: 'inventory'  // 👈 force collection name
});


const Inventory = mongoose.model('inventory', inventorySchema);

module.exports = Inventory;
