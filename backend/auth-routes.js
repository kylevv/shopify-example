const User = require('./schemas/user-model.js')

const handleSignup = async (req, res) => {
  const {username, password} = req.body
  // TODO: validate username and password format
  try {
    const user = await User.findOne({username}).exec()
    if (user) await Promise.reject(new Error('Username Taken'))
    await User.create({username, password})
    req.session.user = username
    res.redirect('/')
  } catch (err) {
    if (err.message) req.flash('error', err.message)
    res.redirect('/auth')
  }
}

const handleLogin = async (req, res) => {
  const {username, password} = req.body
  try {
    const user = await User.findOne({username}).exec()
    if (!user) await Promise.reject(new Error('Invalid Username'))
    const match = await user.comparePasswords(password)
    if (!match) await Promise.reject(new Error('Invalid Password'))
    req.session.user = username
    res.redirect('/')
  } catch (err) {
    if (err.message) req.flash('error', err.message)
    res.redirect('/auth')
  }
}

const handleLogout = (req, res) => {
  req.session.destroy()
  res.redirect('/auth')
}

const validateSession = (req, res, next) => {
  if (!req.session || !req.session.user) res.redirect('/auth')
  else next()
}

module.exports = {handleSignup, handleLogin, handleLogout, validateSession}
