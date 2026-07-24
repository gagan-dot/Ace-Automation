import mongoose from 'mongoose';

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  const uri = process.env.MONGODB_URI;

  if (!uri || uri.includes('<db_password>')) {
    console.warn('⚠️ MONGODB_URI missing or contains <db_password> placeholder. Operating in fallback mode.');
    return null;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(uri, opts).then((mongooseInstance) => {
      console.log('✅ MongoDB connected successfully');
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

// Lead Schema
const LeadSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  company: { type: String, default: 'N/A' },
  phone: { type: String, default: 'N/A' },
  email: { type: String, default: 'N/A' },
  city: { type: String, default: '' },
  service: { type: String, default: 'N/A' },
  budget: { type: String, default: '' },
  followupDate: { type: String, default: '' },
  message: { type: String, default: '' },
  source: { type: String, required: true },
  status: { type: String, default: 'New' },
  notes: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now }
});

// Admin Schema
const AdminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export const Lead = mongoose.models.Lead || mongoose.model('Lead', LeadSchema);
export const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);
