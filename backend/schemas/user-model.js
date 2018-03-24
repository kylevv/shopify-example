const mongoose = require('mongoose')
// const bcrypt = require('bcrypt-nodejs-as-promised')
const bcrypt = require('bcrypt-nodejs')
const promisify = require('util').promisify
const compare = promisify(bcrypt.compare)
const genSalt = promisify(bcrypt.genSalt)
const hash = promisify(bcrypt.hash)

const UserSchema = new mongoose.Schema({
  username: {type: String, required: true, unique: true},
  password: {type: String, required: true},
  shop: {type: String}
})

UserSchema.methods.comparePasswords = function (enteredPassword, callback) {
  const hashedPassword = this.password
  return compare(enteredPassword, hashedPassword)
}

UserSchema.pre('save', function (next) {
  const user = this
  if (!user.isModified('password')) return next()
  genSalt(10)
    .then((salt) => {
      return hash(user.password, salt, null)
        .then((hash) => {
          user.password = hash
          user.salt = salt
          next()
        })
    })
    .catch((err) => {
      next(err)
    })
})

const User = mongoose.model('User', UserSchema)

module.exports = User
