const mongoose= require('mongoose');        
const dbgr= require('debug')('development:mongoose'); // Importing debug module for logging

// Use Atlas connection string from environment variables
const mongoURI = process.env.MONGODB_URI || "mongodb://localhost:27017/scatch";

mongoose.connect(mongoURI)
.then(() => {
    console.log("Connected to MongoDB Atlas Successfully! ");
    dbgr("Connected to MongoDB Atlas"); // Log the successful connection using debug
}).catch((err) => {
    console.error("MongoDB Atlas connection error:", err);
});

module.exports = mongoose.connection; // Export the mongoose connection for use in other files

module.exports = mongoose.connection; // Export the mongoose connection for use in other files