const mongoose = require('mongoose');


const ownerSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  
 
  products: {
    type: Array,
    default: []
  },
  
picture: {
    type: String,
},
gstin: {
    type: String,
    required: true
}
})
module.exports = mongoose.model('owner', ownerSchema);