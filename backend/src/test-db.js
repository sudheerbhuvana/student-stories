import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env
const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

const connect = async () => {
    const uri = process.env.MONGODB_URI;
    console.log('Testing connection to:', uri.replace(/\/\/.*@/, '//***@'));

    try {  
        await mongoose.connect(uri);
        console.log('✅ Success! Connected to MongoDB');
        console.log('Database:', mongoose.connection.name);
        await mongoose.disconnect(); 
        process.exit(0);
    } catch (error) {
        console.error('❌ Connection failed:', error.message);
        if (error.cause) console.error('Cause:', error.cause);
        process.exit(1);
    }
};

connect();
