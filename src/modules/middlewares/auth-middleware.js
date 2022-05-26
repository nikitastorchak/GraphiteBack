const ApiError = require('../exceptions/api-error')
const tokenService = require('../service/token-service')

module.exports = function (req, res, next) {
  try {
    const accessToken = req.headers.accesstoken;
    if (!accessToken) {
      return res.status(401).json({message:'Пользователь не авторизован'})
    }
    const userData = tokenService.validateAccessToken(accessToken)
    if(!userData) {
      return res.status(401).json({message:'Пользователь не авторизован'})
    }
    req.user = userData
    next()
  } catch (e) {
    return res.status(401).json({message:'Пользователь не авторизован'})
  }
}