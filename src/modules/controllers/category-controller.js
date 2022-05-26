const Category = require('../../db/models/categories/categories')
const Product = require('../../db/models/product/product')
const mongoose = require("mongoose");
const moment = require("moment");

module.exports.addCategory = (req, res) => {
  const {
    name,
  } = req.body
  res.set('Access-Control-Allow-Origin', '*');
  Category.create({
    name,
  }).then(result => {
    res.send(result);
  });
};
module.exports.SearchProducts = async (req, res) => {
  const {name} = req.query
  console.log(4444,name)
  res.set('Access-Control-Allow-Origin', '*');
  const result = []
  const categories = await Category.aggregate([
    {
      $search: {
        index: 'autocomplete_categories',
        autocomplete: {
          query: name,
          path: 'name'
        }
      }
    },
    {
      $project: {
        name:1,
      }
    }
  ])
  const products = await Product.aggregate([
    {
      $search: {
        index: 'autocomplete_products',
        autocomplete: {
          query: name,
          path: "name"
        }
      }
    },
    {
      $project: {
        name:1,
        price:1,
        categories:1
      }
    }
  ])
  const newCategories = categories.slice(0, 5)
  const newProducts = products.slice(0, (5 - categories.length))
  result.push({type: "categories", items: newCategories}, {type: "products", items: newProducts})
  res.send(result)
};


module.exports.showCategories = async(req, res) => {
  Category.find().then(result=> {
    res.send(result)
  })
  // tmp = tmp.map(category => {
  //   console.log(category)
  //   category.name = [1,3,5]
  //   return category
  // })

  // categories.map(category => {
  //   console.log(category.name)
  //   Category.findOneAndUpdate({name: category.name}, { $set: { products: [] }})
  //   Category.find({name: category.name}).then((result) => {
  //     // res.send(result);
  //     console.log(444,result)
  //   })
  //   // Category.findOneAndUpdate({name: category.name}, { $set: { products: Product.find({category:category.name}) }})
  // })
    // Category.find().then((result) => {
    //   res.send(result);
    // }

};

module.exports.update = (req, res) => {
  const body = req.body
  res.set('Access-Control-Allow-Origin', '*');
  Category.updateOne({ _id: body._id }, {
    $set: {
      fio: body.fio,
      doctor: body.doctor,
      date: body.date,
      complaint: body.complaint
    },
  }).then(result => {
    Category.find().then((result) => {
      res.send(result);
    });
  });
};

module.exports.del = (req, res) => {
  const id = req.query._id;
  if (id) {
    Category.deleteOne({ _id: id }).then(result => {
      Category.find().then((result2) => {
        res.send(result2);
      }).catch((err) => {
        res.send(err);
      });
    })

  }
};