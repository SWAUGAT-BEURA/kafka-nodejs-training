// services/inventoryService.js
const Inventory = require('../models/inventory.model');
const { sendToDeadLetterQueue } = require('../utils/deadLetter');

const updateInventory = async (productId, quantity, isAbsolute = false) => {
  const inventory = await Inventory.findOne({ productId });

  if (!inventory) {
    console.warn(`⚠️ Product ${productId} not found.`);
    await sendToDeadLetterQueue('ProductNotFound', { productId, quantity });
    return false;
  }

  if (!isAbsolute) {
    // Order placed or cancelled
    if (quantity < 0 && inventory.stock < Math.abs(quantity)) {
      console.warn(`⛔ Out of stock: ${productId}. Available: ${inventory.stock}, Requested: ${Math.abs(quantity)}`);
      await sendToDeadLetterQueue('OutOfStock', { productId, quantity });
      return false;
    }

    inventory.stock += quantity;
  } else {
    // Absolute stock update (e.g. inventory sync)
    inventory.stock = quantity;
  }

  await inventory.save();
  console.log(`📦 ${productId} stock updated: ${inventory.stock}`);
  return true;
};

const getInventory = async (productId) => {
    const product = await Inventory.findOne({ productId });
    if (!product) return 0;  // If product is not found, assume 0 stock
    return product.stock;  // Assuming 'stock' field holds the inventory count
  };

module.exports = { updateInventory,getInventory };
