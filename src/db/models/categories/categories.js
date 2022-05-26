const mongoose = require('mongoose');

const { Schema } = mongoose;

const categoryScheme = new Schema({
  name:String,
}, { timestamps: true });

module.exports = Category = mongoose.model('categories', categoryScheme);



