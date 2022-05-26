module.exports = class UserDto {
  login;
  id;
  isAdmin;
  constructor(model) {
    this.isAdmin = model.isAdmin;
    this.login = model.login;
    this.id = model._id
  }
}