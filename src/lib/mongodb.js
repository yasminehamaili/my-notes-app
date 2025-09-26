import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
}

let isConnected = false;

export default async function connectDB() {
  if (isConnected) {
    console.log('MongoDB already connected');
    return;
  }

  try {
    console.log('Attempting to connect to MongoDB...');
    const db = await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    isConnected = db.connections[0].readyState === 1;
    console.log('MongoDB connected successfully');
    
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}