import dns from 'node:dns';
import mongoose from 'mongoose';

// Force Node.js to use Google & Cloudflare Public DNS to resolve MongoDB Atlas SRV records
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch {
  // fallback
}

export async function connectDB() {
  const uri = process.env.MONGO_URI || 'mongodb+srv://rishabhdisawal08_db_user:gZX21loRIPXWMcCH@rishabh.dr9cnez.mongodb.net/';

  try {
    const conn = await mongoose.connect(uri, {
      dbName: 'imovies',
      serverSelectionTimeoutMS: 20000,
      connectTimeoutMS: 20000
    });
    console.log(`✅ MongoDB Atlas connected successfully to: ${conn.connection.name} (${conn.connection.host})`);
    return conn;
  } catch (primaryErr) {
    console.error('\n❌ Could not connect to MongoDB Atlas:');
    console.error(`   URI: ${uri}`);
    console.error(`   Error details: ${primaryErr.message}`);
    throw primaryErr;
  }
}
