
const ObjectId = require('mongodb').ObjectId;
const Product = require('../../db/models/product/product')
const Cart = require('../../db/models/cart/cart')
const Category = require('../../db/models/categories/categories')
const mongoose = require("mongoose");
const moment = require("moment");


module.exports.addProduct = (req, res) => {
  const {
    categories,
    price,
    discount,
    priceWithDiscount,
    name,
    description,
    preview,
    images,
  } = req.body
  res.set('Access-Control-Allow-Origin', '*');
  Product
    .create({
    categories: categories.split(' '),
    price,
    discount,
    priceWithDiscount,
    likes: 0,
    name,
    description,
    preview,
      images,
  })
    .then(result => {
      res.send(result);
  });
};

module.exports.editProduct = (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');

  const {
    _id,
    name,
    categories,
    discount,
    price,
    priceWithDiscount,
    description,
    preview,
    images,
  } = req.body
  Product.findOneAndUpdate({_id: ObjectId(_id)},
    {
      name,
      categories: categories?.split(','),
      price,
      discount,
      priceWithDiscount,
      description,
      preview,
      images,
  }).then((result) => {
    console.log(result)
    res.send(result);
  }).catch((err) => {
    res.send(err);
  });
};

module.exports.showProductsBySearch = (req, res) => {
  const {name} = req.query
  res.set('Access-Control-Allow-Origin', '*');
  Product.find({name}).then((result) => {
    res.send(result);
  }).catch((err) => {
    res.send(err);
  });
};

module.exports.showProducts = (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  Product.find().then((result) => {
    res.send(result);
  }).catch((err) => {
    res.send(err);
  });
};


module.exports.showProductById = (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  const {
    id,
  } = req.query
  Product.findById({_id: id}).then((result) => {
    res.send(result);
  }).catch((err) => {
    res.send(err);
  });
};

module.exports.addProductsToCart = async ( req, res ) => {
  res.set('Access-Control-Allow-Origin', '*');
  const {
    userId,
    products,
  } = req.body
  const isUserExist = await Cart.findOne({ userId })
  if(isUserExist) {
    await Promise.all(products.map(async product => {
      const {productId, count} = product
      const isProductInCart = await Cart.findOne({ cart: { $elemMatch: { productId } } })
      if(isProductInCart) {
        Cart.updateOne(
          {userId},
          {$inc: {"cart.$[elem].count": count}},
          {arrayFilters: [{"elem.productId": productId}]}
        ).then(result => {
          res.send(result);
        })
      } else {
        Cart.updateOne(
          {userId},
          {$push: {cart: { productId, count } } }
        ).then(result => {
          res.send(result);
        })
      }
    }))
  } else {
    await Promise.all(products.map(async product => {
      const {productId, count} = product
      await Cart.create(
        {
          userId,
          cart: [{
            productId,
            count,
          }]
        }
      )
    }))

  }
}
  module.exports.deleteProductFromCart = async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    const {
      userId,
      productId,
    } = req.body
    const isUserExist = await Cart.findOne({userId})

    Cart.updateOne({ userId }, {$inc: {
        "cart.$[elem].count": 1
      }}, { arrayFilters: [ { "elem.productId": productId } ] })
      .then(result => {
        res.send(result);
      })
  }
module.exports.updateCart = async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  const {
    userId,
    products,
  } = req.body
  const isUserExist = await Cart.findOne({userId})
  isUserExist ? (

      await Promise.all(products.map(item => (
      Cart.updateOne({ userId }, {
        $push: {
          cart: item
        }
      })))).then(result => {
        res.send(result);
      })
    ) :
    Cart.create({
      userId,
      cart:products,
    }).then(result => {
      res.send(result);
    });
  res.send(UniqCart)
};

module.exports.showCartUnauthorized = async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  const {
    cart
  } = req.body
  const result = await Promise.all(cart.map(item => (
    Product.find({_id:item})
)))
  res.send(result)
};

module.exports.showUserCart = async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  const {
    userId
  } = req.query
  const userCart = await Cart.find({userId})

  res.send(userCart)
};

module.exports.showUserCartProducts = async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  const {
    userId
  } = req.query
  const userCart = await Cart.find({userId})
  const productsIds = userCart[0].cart
  const result = await Promise.all(productsIds.map(async _id => {
    const result = await Product.find({_id})
    return result[0]
  }))
  res.send(result)
};

module.exports.showCarts= (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  Cart.find({}).then(result => res.send(result));
};

module.exports.showNewProducts= (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  Product.find({}).sort('-createdAt').limit(3).then(result => res.send(result));

};

module.exports.showProductsMainPage = async (req, res) => {
  try {
    const categories = await Category.find();
    const result = await Promise.all(categories.map(async category => {
      const products = await Product.find({
        'categories': category.name
      }).limit(6);
      return {
        name: category.name,
        products: products
      }
    }));
    res.send(result)
  } catch (e) {}
};

module.exports.showProductsByCategory = (req, res) => {
  const {
    category,
  } = req.query
  Category.find({name: category}).then((result) => {
    res.send(result);
  }).catch((err) => {
    res.send(err);
  });
};

module.exports.update = (req, res) => {
  const body = req.body
  res.set('Access-Control-Allow-Origin', '*');
  Product.updateOne({ _id: body._id }, {
    $set: {
      fio: body.fio,
      doctor: body.doctor,
      date: body.date,
      complaint: body.complaint
    },
  }).then(result => {
    Product.find().then((result) => {
      res.send(result);
    });
  });
};

module.exports.del = (req, res) => {
  const id = req.query._id;
  if (id) {
    Product.deleteOne({ _id: id }).then(result => {
      Product.find().then((result2) => {
      res.send(result2);
    }).catch((err) => {
      res.send(err);
    });
    })
    
  }
};