const Inventory = require('../models/inventory');
const { sendToDeadLetterQueue } = require('../utils/deadLetter');

const updateInventory = async (productId, quantity, isAbsolute = false) => {
  let inventory = await Inventory.findOne({ productId });
  console.log(inventory)
  if (!inventory) {
    console.warn(`⚠️ Product ${productId} not found.`);
    await sendToDeadLetterQueue('ProductNotFound', { productId, quantity });
    return false;
  }

  if (isAbsolute) {
    console.log(1)
    // Set inventory to a fixed quantity
    inventory.quantity = quantity;
  } else {
    console.log(2)
    const newStock = inventory.quantity + quantity;
    // Prevent negative stock
    if (newStock < 0) {
      console.warn(`⛔ Cannot update inventory for ${productId}. Current stock: ${inventory.quantity}, Requested change: ${quantity}`);
      await sendToDeadLetterQueue('123OutOfStock', { productId, quantity, currentStock: inventory.quantity });
      return false;
    }
    inventory.quantity = newStock;
  }

  await inventory.save();
  console.log(`📦 Updated inventory for ${productId}: ${inventory.quantity}`);
  return true;
};

const getInventory = async (productId) => {
  console.log("Looking up inventory for productId:", productId, typeof productId);
  const product = await Inventory.findOne({ productId });
  console.log(product)
  return product ? product.quantity : 0;
};

module.exports = { updateInventory, getInventory };
