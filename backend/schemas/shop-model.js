const mongoose = require('mongoose')

const ShopSchema = new mongoose.Schema({
  shop: {type: String, required: true, unique: true},
  token: {type: String, required: true}
})

const Shop = mongoose.model('Shop', ShopSchema)

module.exports = Shop
