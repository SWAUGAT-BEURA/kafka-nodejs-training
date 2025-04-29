const connectToMongo = require('./config/db');
const { startConsumer } = require('./kafka/consumer');

(async () => {
  await connectToMongo();
  await startConsumer();
})();
