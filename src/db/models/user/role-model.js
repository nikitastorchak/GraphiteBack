const { Schema, model } = require('mongoose');

const roleScheme = new Schema({
  value: {type: String, unique: true, default: "USER"},
});

module.exports = Role = model('role', roleScheme);
