const {Kafka} =require ('kafkajs');
const {clientId,brokers,topic} =require('../config/kafkaConfig');

const kafka = new Kafka({clientId,brokers});
const consumer= kafka.consumer({groupId:'order-consumer-group'});

const consumeOrders = async () => {
    try {
        await consumer.connect();
        console.log('Connected to Kafka');
        
        await consumer.subscribe({topic, fromBeginning:true});
        console.log('Subscribed to topic:', topic);

        await consumer.run({
            eachMessage: async ({topic, partition, message}) => {
                console.log({
                    key: message.key.toString(),
                    value: message.value.toString(),
                    partition,
                });
            },
        });
    } catch (error) {
        console.error('Error in consumer:', error);
    }
};

module.exports = { consumeOrders };