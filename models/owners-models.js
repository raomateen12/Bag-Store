const mongose = require('mongoose');


const ownerSchema = new mongose.Schema({
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
modeule.exports = mongose.model('owner', ownerSchema);