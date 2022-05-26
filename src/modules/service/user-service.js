const userModel = require("../../db/models/user/user-model")
const roleModel = require("../../db/models/user/role-model")
const bcrypt = require('bcrypt')
const tokenService = require('./token-service')
const UserDto = require('../dtos/user-dto')
const ApiError = require('../exceptions/api-error')

class UserService {
  async registration(login, password) {
    const candidate = await userModel.findOne({login})
    if (candidate) {
      throw ApiError.BadRequest(`Пользователь ${login} уже существует`)

    }
    const hashPassword = await bcrypt.hash(password, 3)
    const userRole = await roleModel.findOne({value:"USER"})
    const user = await userModel.create({login, password: hashPassword, role: [userRole.value]})
    const userDto = new UserDto(user)
    const tokens = tokenService.generateTokens({...userDto})
    await tokenService.saveToken(userDto.id, tokens.refreshToken)
    return {
      ...tokens,
    }
  }

  async login(login, password) {
    const user = await userModel.findOne({login})
    if (!user) {
      throw ApiError.BadRequest('Пользователь с таким логином не найден')
    }
    const isPassEquals = await bcrypt.compare(password, user.password)
    if(!isPassEquals) {
      throw ApiError.BadRequest('Неверный пароль')
    }
    const userDto = new UserDto(user)
    const tokens = tokenService.generateTokens({...userDto})
    await tokenService.saveToken(userDto.id, tokens.refreshToken)
    return {
      ...tokens,
      user: userDto
    }
  }

  async logout(refreshToken) {
    const token = await tokenService.removeToken(refreshToken)
    return token
  }

  async refresh(refreshToken) {
    if (!refreshToken) {
      throw ApiError.UnauthorizedError()
    }
    const userData = tokenService.validateRefreshToken(refreshToken)
    const tokenFromDb = await tokenService.findToken(refreshToken)
    if (!userData || !tokenFromDb) {
      throw ApiError.UnauthorizedError()
    }
    const user = await userModel.findById(userData.id)
    const userDto = new UserDto(user)
    const tokens = tokenService.generateTokens({...userDto})
    await tokenService.saveToken(userDto.id, tokens.refreshToken)
    return {
      ...tokens,
      user: userDto
    }
  }

  async getAllUsers() {
    const users = await userModel.find()
    return users
  }
}

module.exports = new UserService()