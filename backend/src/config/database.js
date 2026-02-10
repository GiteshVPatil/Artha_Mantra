const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // ✅ IMPROVED: Better logic
    let mongoURI = process.env.MONGODB_URI ;
    
    if (!mongoURI) {
      throw new Error('❌ MongoDB URI not provided in .env file');
    }

    console.log(`🔄 Connecting to MongoDB...`);
    console.log(`📍 Cluster: ${mongoURI.includes('mongodb+srv') ? 'MongoDB Atlas (Cloud)' : 'Local MongoDB'}`);

    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected Successfully!`);
    console.log(`📊 Host: ${conn.connection.host}`);
    console.log(`📦 Database: ${conn.connection.name}`);
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    process.exit(1);
  }
};

module.exports = { connectDB };
