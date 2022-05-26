const userService = require("../service/user-service");
const {validationResult} = require('express-validator')
const userModel = require("../../db/models/user/user-model");
const bcrypt = require("bcrypt");
const roleModel = require("../../db/models/user/role-model");
const UserDto = require("../dtos/user-dto");
const tokenService = require("../service/token-service");

class UserController {
  async registration(req, res, next) {
    console.log(req.body)
    try {
      const {login, password, role} = req.body;
      const errors = validationResult(req)
      console.log(errors)
      if (!errors.isEmpty()) {
        return res.status(400).json({message: 'Ошибка при валидации пароля', errors})
      }
      const candidate = await userModel.findOne({login})
      if (candidate) {
        return res.status(400).json({message:`Пользователь ${login} уже существует!`})
      }
      const hashPassword = await bcrypt.hash(password, 5)
      const userRole = await roleModel.findOne({value:role})
      if (userRole === null) {
        return res.status(400).json({message:`Роли ${role} нет в списке доступных!`})
      }
      const user = await userModel.create({login, password: hashPassword, role: [userRole.value]})
      const userDto = new UserDto(user)
      const tokens = tokenService.generateTokens({...userDto})
      await tokenService.saveToken(userDto.id, tokens.refreshToken)
      return res.json({...tokens})
    } catch (e) {
      next(e)
    }
  }

  async login(req, res, next) {
    try {
      const {login, password} = req.body
      const user = await userModel.findOne({login})
      if (!user) {
        return res.status(400).json({message:'Пользователь с таким логином не найден'})
      }
      const isPassEquals = await bcrypt.compare(password, user.password)
      if(!isPassEquals) {
        return res.status(400).json({message:'Неверный пароль'})
      }
      const userDto = new UserDto(user)
      const tokens = tokenService.generateTokens({...userDto})
      await tokenService.saveToken(userDto.id, tokens.refreshToken)
      return res.json({
        ...tokens,
      })
    } catch (e) {
      next(e)
    }
  }

  async logout(req, res, next) {
    try {
      const {refreshToken} = req.body;
      const token = await tokenService.removeToken(refreshToken)
      return res.json(token)
    } catch (e) {
      next(e)
    }
  }

  async refresh(req, res, next) {
    try {
      const { refreshtoken } = req.headers
      console.log(refreshtoken)
      if (!refreshtoken) {
        return res.status(401).json({message:'Пользователь не авторизован'})
      }
      const userData = tokenService.validateRefreshToken(refreshtoken)
      console.log('UserData', userData)
      const tokenFromDb = await tokenService.findToken(refreshtoken)
      if (!userData || !tokenFromDb) {
        return res.status(401).json({message:'Пользователь не авторизован'})
      }
      const user = await userModel.findById(userData.id)
      const userDto = new UserDto(user)
      const tokens = tokenService.generateTokens({...userDto})
      await tokenService.saveToken(userDto.id, tokens.refreshToken)
      console.log(3333333333,{...tokens})
      return res.json({
        ...tokens,
      })
    } catch (e) {
      next(e)
    }
  }
  
  async getUsers(req, res, next) {
    try {
      const users = await userService.getAllUsers()
      return res.json(users)
    } catch (e) {
      next(e)
    }
  }
}

module.exports = new UserController();