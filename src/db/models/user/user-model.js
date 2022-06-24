const { Schema, model } = require('mongoose');

const userScheme = new Schema({
  name: String,
  secondName: String,
  email: String,
  phone: {type: Number, required: true},
  address: String,
  password: {type: String, required: true},
  role: [{type: String, ref: 'role-model'}],
});

module.exports = User = model('user', userScheme);
