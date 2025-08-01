// Sample data creation script for testing
// Run this to create sample products and owner account

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const ownerModel = require('./models/owners-models');
const productModel = require('./models/productmodel');

// Connect to MongoDB Atlas
const mongoURI = process.env.MONGODB_URI || "mongodb://localhost:27017/scatch";
mongoose.connect(mongoURI);

async function createSampleData() {
    try {
        console.log('Creating sample data...');

        // Create sample owner (if not exists)
        const existingOwner = await ownerModel.findOne({ email: 'admin@scatch.com' });
        if (!existingOwner) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            const owner = await ownerModel.create({
                username: 'Admin User',
                email: 'admin@scatch.com',
                password: hashedPassword,
                gstin: '22AAAAA0000A1Z5'
            });
            console.log(' Sample owner created:', owner.email);
        } else {
            console.log(' Owner already exists:', existingOwner.email);
        }

        // Create sample products
        const sampleProducts = [
            {
                name: 'Premium Leather Backpack',
                Price: 2999,
                discount: 15,
                bgcolor: 'blue-100',
                panecolor: 'white',
                textcolor: 'gray-800'
            },
            {
                name: 'Canvas Messenger Bag',
                Price: 1499,
                discount: 10,
                bgcolor: 'green-100',
                panecolor: 'white',
                textcolor: 'gray-800'
            },
            {
                name: 'Designer Handbag',
                Price: 3999,
                discount: 20,
                bgcolor: 'purple-100',
                panecolor: 'white',
                textcolor: 'gray-800'
            },
            {
                name: 'Travel Duffel Bag',
                Price: 2499,
                discount: 5,
                bgcolor: 'yellow-100',
                panecolor: 'white',
                textcolor: 'gray-800'
            }
        ];

        for (const productData of sampleProducts) {
            const existingProduct = await productModel.findOne({ name: productData.name });
            if (!existingProduct) {
                const product = await productModel.create(productData);
                console.log(' Product created:', product.name);
            } else {
                console.log(' Product already exists:', existingProduct.name);
            }
        }

        console.log('\n Sample data creation completed!');
        console.log('\n Login Details:');
        console.log('Owner Email: admin@scatch.com');
        console.log('Password: admin123');
        console.log('GSTIN: 22AAAAA0000A1Z5');
        console.log('\n Access URLs:');
        console.log('User Site: http://localhost:3000/');
        console.log('Owner Login: http://localhost:3000/owners/login');
        console.log('Owner Register: http://localhost:3000/owners/register');

    } catch (error) {
        console.error(' Error creating sample data:', error);
    } finally {
        mongoose.connection.close();
    }
}

createSampleData();
