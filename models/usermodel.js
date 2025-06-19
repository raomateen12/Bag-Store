const mongose = require('mongoose');
mongose.connect('mongodb://localhost:27017/yourdbname', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const userSchema = new mongose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  cart: {
    type: Array,
    default: []
  },
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
modeule.exports = mongose.model('User', userSchema);