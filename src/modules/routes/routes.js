const express = require('express');
const Router = require('express').Router
const userController = require('../controllers/user-controller');
const router = new Router()
const {check} = require('express-validator')
const authMiddleware = require('../middlewares/auth-middleware')

const {
  addProduct,
  showProducts,
  showProductsByCategory,
  showProductsMainPage,
  showProductById,
  addProductToCart,
  addProductsToCart,
  updateCart,
  showCarts,
  showUserCart,
  showUserCartProducts,
  showCartUnauthorized,
  showNewProducts,
  editProduct,
  del
} = require('../controllers/product-controller');


const {
  addCategory,
  SearchProducts,
  showCategories,
} = require('../controllers/category-controller');

router.post('/addProduct', addProduct)
router.post('/addCategory', addCategory)
router.get('/showCategories', showCategories)
router.get('/SearchProducts', SearchProducts)
router.get('/showProducts', showProducts)
// router.patch('/addProductToCart', addProductToCart)
router.patch('/addProductsToCart', addProductsToCart)
router.get('/showCarts', showCarts)
router.post('/showCartUnauthorized', showCartUnauthorized)
router.patch('/updateCart', updateCart)
router.get('/showUserCart', showUserCart)
router.get('/showUserCartProducts', showUserCartProducts)
router.get('/showProductById', showProductById)
router.get('/showProductsByCategory', showProductsByCategory)
router.get('/showProductsMainPage', showProductsMainPage)
router.get('/showNewProducts', showNewProducts)
router.patch('/editProduct', editProduct)
router.delete('/delete', authMiddleware, del)
router.post('/registration',
  check('phone')
  .notEmpty()
  .withMessage("Номер телефона - обязательное поле и не может быть пустым!"),
// .matches(/[a-zA-Z\d]{6,}/)
// .withMessage('Логин должен содержать не менее 6 сиволов!'),

check('password')
  .matches(/(?=.*\d)(?=.*[a-zA-Z])[a-zA-Z\d]{6,16}/)
  .withMessage('Пароль должен содержать латинские символы и минимум одну цифру!')
  .isLength({min: 6, max: 16})
  .withMessage("Пароль должен быть не меньше 6 и не больше 16 символов!")
, userController.registration)
router.post('/authorization', userController.login)
router.post('/getUser', userController.getUser)
router.post('/logout', userController.logout)
router.get('/refresh', userController.refresh)
router.get('/users', authMiddleware, userController.getUsers)

module.exports = router