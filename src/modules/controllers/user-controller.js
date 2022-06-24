const userService = require("../service/user-service");
const {validationResult} = require('express-validator')
const userModel = require("../../db/models/user/user-model");
const bcrypt = require("bcrypt");
const roleModel = require("../../db/models/user/role-model");
const UserDto = require("../dtos/user-dto");
const tokenService = require("../service/token-service");

class UserController {
  async registration(req, res, next) {
    try {
      const { name, secondName, email, password, repeatPassword, address, phone } = req.body;
      const role = "ADMIN"
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({message: 'Ошибка при валидации', errors})
      }
      const candidate = await userModel.findOne({phone})
      if (candidate) {
        return res.status(400).json({message:`Пользователь с таким номером уже зарегистрирован. Попробуйте войти`})
      }
      const hashPassword = await bcrypt.hash(password, 5)
      const userRole = await roleModel.findOne({value:role})
      if (userRole === null) {
        return res.status(400).json({message:`Роли ${role} нет в списке доступных!`})
      }
      const user = await userModel.create({name, secondName, email, address, phone, password: hashPassword, role: [userRole.value]})
      const userDto = new UserDto(user)
      const tokens = tokenService.generateTokens({...userDto})
      await tokenService.saveToken(userDto.id, tokens.refreshToken)
      return res.json({
        user,
        tokens
      })
    } catch (e) {
      next(e)
    }
  }

  async login(req, res, next) {
    try {
      const {phone, password, type, email} = req.body
      const user = type === "email" ? await userModel.findOne({email}) : await userModel.findOne({phone})
      if (!user) {
        return res.status(400).json({message:'Пользователь с такими данными не найден'})
      }
      const isPassEquals = await bcrypt.compare(password, user.password)
      if(!isPassEquals) {
        return res.status(400).json({message:'Неверный пароль'})
      }
      const userDto = new UserDto(user)
      const tokens = tokenService.generateTokens({...userDto})
      await tokenService.saveToken(userDto.id, tokens.refreshToken)
      return res.json(
        {
          user,
          tokens
        }
      )
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

  async getUser(req, res, next) {
    try {
      const { accesstoken } = req.headers
      const userData = tokenService.validateAccessToken(accesstoken)
      const user = await userModel.findById(userData?.id)
      if (!userData || !user) {
        return res.status(401).json({message:'Пользователь не авторизован'})
      }
      return res.json({
        user
      })
    } catch (e) {
      next(e)
    }
  }

  async refresh(req, res, next) {
    try {
      const { refreshtoken } = req.headers
      if (!refreshtoken) {
        return res.status(401).json({message:'Пользователь не авторизован'})
      }
      const userData = tokenService.validateRefreshToken(refreshtoken)
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