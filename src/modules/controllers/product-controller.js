const Product = require('../../db/models/product/product')
const Category = require('../../db/models/categories/categories')
const mongoose = require("mongoose");
const moment = require("moment");

module.exports.addProduct = (req, res) => {
  const {
    categories,
    price,
    discount,
    name,
    description,
    preview,
  } = req.body
  res.set('Access-Control-Allow-Origin', '*');
  Product
    .create({
    categories: categories.split(' '),
    price,
    discount,
    priceWithDiscount: discount ? price * ((100 - discount)/100) : price,
    likes: 0,
    name,
    description,
    preview,
  })
    .then(result => {
      res.send(result);
  });
};

module.exports.editProduct = (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  console.log(req.body)
  const {
    id,
    name,
    categories,
    price,
    priceWithDiscount,
    description,
    preview,
  } = req.body
  Product.findOneAndUpdate({_id: id}, {$set:
    {
    name,
      categories: categories?.split(','),
      price,
      priceWithDiscount,
      description,
      preview,
  }}).then((result) => {
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