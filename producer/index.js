const { produceOrder } = require("./kafkaProducer");

const run = async () => {
  const sampleOrder = {
    orderId: Math.floor(Math.random() * 10000),
    userId: Math.floor(Math.random() * 1000),
    amount: (Math.random() * 1000).toFixed(2),
    status: "CREATED",
  };
  await produceOrder(sampleOrder);
};

run().catch(console.error);
