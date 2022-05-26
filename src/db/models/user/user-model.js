const { Schema, model } = require('mongoose');

const userScheme = new Schema({
  login: {type: String, unique: true, required: true},
  password: {type: String, required: true},
  role: [{type: String, ref: 'role-model'}],
});

module.exports = User = model('user', userScheme);
