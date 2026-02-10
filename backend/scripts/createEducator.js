const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const createEducator = async () => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.NODE_ENV === 'production' 
      ? process.env.MONGODB_URI_PROD 
      : process.env.MONGODB_URI;

    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('📊 Connected to MongoDB');

    // Check if educator already exists
    const existingEducator = await User.findOne({ role: 'educator' });
    
    if (existingEducator) {
      console.log('❌ Educator account already exists!');
      console.log('Email:', existingEducator.email);
      console.log('Name:', existingEducator.firstName, existingEducator.lastName);
      process.exit(0);
    }

    // Create the educator account
    const educator = await User.create({
      firstName: 'Gunwant',
      lastName: 'Patil',
      email: 'gunwantmpatil29@gmail.com',
      password: '123456', // Will be hashed by pre-save hook
      role: 'educator',
      profile: {
        bio: 'Project Guide and Educator',
        institution: 'Educational Institution',
        experience: 'advanced'
      }
    });

    console.log('✅ Educator account created successfully!');
    console.log('📧 Email: gunwantmpatil29@gmail.com');
    console.log('🔑 Password: 123456');
    console.log('👤 Name: Gunwant Patil');
    console.log('🎓 Role: Educator');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating educator:', error.message);
    process.exit(1);
  }
};

createEducator();
