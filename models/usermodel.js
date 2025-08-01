const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  cart: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'  // Products ki array, single Cart nahi
  }],
  isadmin: { type: Boolean, default: false },
  orders: {
    type: Array,
    default: []
  },
  contact: {
    type: Number
},
picture: {
    type: String,
},
})
module.exports = mongoose.model('User', userSchema);