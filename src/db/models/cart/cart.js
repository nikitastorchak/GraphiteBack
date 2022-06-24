const mongoose = require('mongoose');
const { Schema } = mongoose;

const cartScheme = new Schema({
  userId: String,
  cart: [
    {
      productId:String,
      count: Number
    }
  ],
}, { timestamps: true });

module.exports = Cart = mongoose.model('carts', cartScheme);