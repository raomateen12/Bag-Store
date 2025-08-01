const { text } = require('express');
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
 
  image: { type: String, required: true },
    name: { type: String, required: true },
    Price: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    bgcolor: { type: String, },
    panecolor: { type: String, default: 'white' },
    textcolor: { type: String, default: 'black' },
});

module.exports = mongoose.model('Product', productSchema);