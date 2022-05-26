const mongoose = require('mongoose');
const { Schema } = mongoose;

const productScheme = new Schema({
  categories: [String],
  price: Number,
  discount: Number,
  priceWithDiscount: Number,
  likes: Number,
  name:String,
  description:String,
  preview:String,

}, { timestamps: true });

module.exports = Product = mongoose.model('products', productScheme);



