
const USER = true // remove after db is in

const handleSignup = (req, res) => {
  console.log('signup:', req.body)
  if (!USER) { // if user already exists
    req.flash('error', 'Username Taken')
    res.redirect('/auth')
  } else {
    req.session.user = 'temp'
    res.redirect('/')
  }
}

const handleLogin = (req, res) => {
  console.log('login:', req.body)
  if (!USER) { // if no user found or wrong passsword
    req.flash('error', 'Invalid Credentials')
    res.redirect('/auth')
  } else {
    req.session.user = 'temp'
    res.redirect('/')
  }
}

const validateSession = (req, res, next) => {
  if (!req.session || !req.session.user) res.redirect('/auth')
  else next()
}

module.exports = {handleSignup, handleLogin, validateSession}
