const {Kafka} =require('kafkajs');
const {clientId,brokers,topic}=require('../config/kafkaConfig');

const kafka = new Kafka({clientId,brokers});
const producer=kafka.producer();

const produceOrder= async (order)=>{
    await producer.connect();
    await producer.send({
        topic,
        messages:[
            {
                key:String(order.orderId),value:JSON.stringify(order)
            },
        ],
    });
    console.log(`order produced:${order.orderId}`);
    await producer.disconnect();
};

module.exports={produceOrder};