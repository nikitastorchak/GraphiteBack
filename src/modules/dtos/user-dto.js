module.exports = class UserDto {
  name;
  id;
  isAdmin;
  constructor(model) {
    this.isAdmin = model.isAdmin;
    this.name = model.name;
    this.id = model._id
  }
}