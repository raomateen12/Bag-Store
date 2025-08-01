require('dotenv').config();
const mongoose = require('mongoose');

console.log('Testing MongoDB Atlas connection...');
console.log('Connection URI:', process.env.MONGODB_URI.replace(/:[^:@]*@/, ':****@'));

// Add some connection options that might help with network issues
const connectOptions = {
    serverSelectionTimeoutMS: 10000, // 10 seconds
    socketTimeoutMS: 45000, // 45 seconds
    family: 4, // Use IPv4, skip trying IPv6
    maxPoolSize: 10,
    minPoolSize: 1,
    maxIdleTimeMS: 30000,
};

async function testConnection() {
    try {
        console.log('Attempting to connect to MongoDB Atlas...');
        
        await mongoose.connect(process.env.MONGODB_URI, connectOptions);
        
        console.log(' Successfully connected to MongoDB Atlas!');
        console.log('Database name:', mongoose.connection.db.databaseName);
        
        // Test a simple operation
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Available collections:', collections.map(c => c.name));
        
        await mongoose.disconnect();
        console.log('Connection test completed successfully!');
        
    } catch (error) {
        console.error('Connection failed:');
        console.error('Error type:', error.constructor.name);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        
        if (error.code === 'ENOTFOUND') {
            console.log('\nTroubleshooting DNS issue:');
            console.log('1. Check your internet connection');
            console.log('2. Try disabling Windows Defender or other firewall temporarily');
            console.log('3. Check if your ISP or corporate network blocks MongoDB connections');
            console.log('4. Verify the cluster is active in MongoDB Atlas dashboard');
        }
        
        process.exit(1);
    }
}

testConnection();
