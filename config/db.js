const mongoose = require('mongoose');

const connectToMongo = async () => {
  try {
    await mongoose.connect(
      'mongodb+srv://swaugat:GhSeI3Eh0dfCdWMI@cluster0.iaky75d.mongodb.net/SQUBIX_TEST?retryWrites=true&w=majority&appName=Cluster0',
      { useNewUrlParser: true, useUnifiedTopology: true }
    );
    console.log('✅ Connected to MongoDB Atlas');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }
};

module.exports = connectToMongo;
