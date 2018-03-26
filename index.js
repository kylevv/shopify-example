const express = require('express')
const path = require('path')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
mongoose.Promise = global.Promise
const dotenv = require('dotenv').config() // eslint-disable-line
const crypto = require('crypto')
const cookie = require('cookie')
const nonce = require('nonce')()
const request = require('request-promise-native')
const querystring = require('querystring')
const session = require('express-session')
const cookieParser = require('cookie-parser')
// const flash = require('express-flash-messages')
const flash = require('express-flash')
// const getRawBody = require('raw-body')
const {handleSignup, handleLogin, handleLogout, validateSession} = require('./backend/auth-routes')
const User = require('./backend/schemas/user-model.js')
const Shop = require('./backend/schemas/shop-model.js')

const apiKey = process.env.SHOPIFY_API_KEY
const apiSecret = process.env.SHOPIFY_API_SECRET
const forwardingAddress = process.env.SERVER_URL
const scopes = 'read_products, read_orders'
const shops = []
if (process.env.DEV_SHOP && process.env.DEV_TOKEN) { // FOR DEV ONLY
  shops.push({shop: process.env.DEV_SHOP, accessToken: process.env.DEV_TOKEN, webhooks: []})
} // FOR DEV ONLY

const app = express()

// Webhooks
const requiredWebhooks = ['orders/create', 'orders/cancelled']
const setWebhooks = ({shop, accessToken, webhooks}) => {
  console.log('Setting up webhooks for:', shop, webhooks)
  return Promise.all(requiredWebhooks
    // .filter((topic) => !webhooks.includes(topic))
    .map((topic) => {
      console.log(`Promise of ${topic}`)
      const webhookRequestUrl = `https://${shop}/admin/webhooks.json`
      const webhookRequestHeaders = {'X-Shopify-Access-Token': accessToken}
      const webhookPayload = {
        webhook: {
          topic,
          address: `${forwardingAddress}/webhook/${topic}`,
          format: 'json'
        }
      }
      return request.post(webhookRequestUrl, {headers: webhookRequestHeaders, json: webhookPayload})
        .then((webhookConfirmation) => {
          // webhooks.push(topic)
          console.log(webhookConfirmation)
        })
    })
  )
}
const getWebhooks = ({shop, accessToken}) => {
  const webhookGetUrl = `https://${shop}/admin/webhooks.json`
  const webhookGetHeaders = {'X-Shopify-Access-Token': accessToken}
  return request({url: webhookGetUrl, headers: webhookGetHeaders, json: true})
}
const deleteWebhooks = ({shop, accessToken}) => {
  const webhookDeleteHeaders = {'X-Shopify-Access-Token': accessToken}
  return getWebhooks({shop, accessToken})
    .then((webhooks) => {
      return Promise.all(webhooks.webhooks.map((webhook) => {
        const webhookDeleteUrl = `https://${shop}/admin/webhooks/${webhook.id}.json`
        return request.delete(webhookDeleteUrl, {headers: webhookDeleteHeaders})
      }))
    })
}

// Middleware
app.set('trust proxy', 1)
app.set('vew engine', 'pug')
app.set('views', './auth/views')
app.use(morgan('dev'))
app.use(cookieParser(process.env.SECRET))
app.use(session({
  secret: process.env.SECRET,
  resave: true,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    secure: true,
    maxAge: 1000 * 60 * 60 * 24 // 1 day
  }
}))
app.use(flash())
app.use(bodyParser.urlencoded({extended: true}))
app.use((req, res, next) => {
  if (req.headers['x-shopify-topic']) bodyParser.text({type: '*/*'})(req, res, next)
  else next()
})
app.use(bodyParser.json())
app.use('/vendors', express.static(path.join(__dirname, 'auth/vendors')))
// app.use('/auth', express.static(path.join(__dirname, 'auth')))
const hmacValidate = (req, res, next) => {
  console.log('header:', req.headers['x-shopify-hmac-sha256'])
  let {hmac} = req.query
  console.log('hmac:', hmac)
  if (!hmac) console.log('No HMAC in request')
  if (!hmac) return res.status(400).send('Required parameters missing')
  const map = Object.assign({}, req.query)
  console.log('map:', map)
  delete map['signature']
  delete map['hmac']
  const message = querystring.stringify(map)
  const generatedHash = crypto
    .createHmac('sha256', apiSecret)
    .update(message)
    .digest('hex')
  if (generatedHash !== hmac) console.log('HMAC validation failed')
  console.log('generated:', generatedHash)
  if (generatedHash !== hmac) return res.status(400).send('HMAC validation failed')
  next()
}
const webhookValidate = (req, res, next) => {
  let hmac = req.headers['x-shopify-hmac-sha256']
  console.log('HMAC:', hmac)
  let secret = process.env.DEV_SECRET || apiSecret
  console.log('SECRET:', secret)
  if (!hmac) return res.status(400).send('Required parameters missing')
  const generatedHash = crypto
    .createHmac('sha256', secret)
    .update(Buffer.from(req.body))
    .digest('base64')
  console.log('GENERATED:', generatedHash)
  if (generatedHash !== hmac) return res.status(400).send('HMAC validation failed')
  try {
    req.body = JSON.parse(req.body)
    next()
  } catch (err) {
    res.status(500).end()
  }
}

// Routes
app.get('/helloworld', (req, res) => {
  res.json({hello: 'world'})
})

app.get('/auth', (req, res) => {
  res.render('index.pug')
})

// app.get('/auth/:file', (req, res) => {
//   console.log('params:', req.params)
//   const files = [
//     'semantic.min.css',
//     'jquery.min.js',
//     'semantic.min.js'
//   ]
//   if (files.includes(req.params.file)) {
//     res.sendFile(path.join(__dirname, `./auth/${req.params.file}`))
//   } else {
//     res.status(404).end()
//   }
// })

app.get('/shopify', (req, res) => {
  console.log('1:', req.session)
  if (!req.session || !req.session.user) return res.status(400).end()
  const shop = req.query.shop
  if (shop) {
    const state = nonce()
    const redirectUri = `${forwardingAddress}/shopify/callback`
    const installUrl = `https://${shop}/admin/oauth/authorize?client_id=${apiKey}&scope=${scopes}&state=${state}&redirect_uri=${redirectUri}`
    res.cookie('state', state)
    res.redirect(installUrl)
  } else {
    res.status(400).send('Missing shop parameter. Add ?shop=your-development-shop.myshopify.com to request')
  }
})

app.get('/shopify/callback', hmacValidate, (req, res) => {
  console.log('2:', req.session)
  if (!req.session || !req.session.user) return res.status(400).end()
  const {shop, code, state} = req.query
  const stateCookie = cookie.parse(req.headers.cookie).state
  if (state !== stateCookie) {
    return res.status(403).send('Request origin cannot be verified')
  }
  if (shop && code) {
    // let savedShop = shops.filter((obj) => obj.shop === shop)[0]
    // if (!savedShop) {
    //   savedShop = {shop}
    //   shops.push(savedShop)
    // }
    const accessTokenRequestUrl = `https://${shop}/admin/oauth/access_token`
    const accessTokenPayload = {
      client_id: apiKey,
      client_secret: apiSecret,
      code
    }
    request.post(accessTokenRequestUrl, {json: accessTokenPayload})
      .then((accessTokenResponse) => {
        const accessToken = accessTokenResponse.access_token
        // savedShop.accessToken = accessToken // TODO: Save to database
        // savedShop.webhooks = savedShop.webhooks || []
        // setWebhooks(savedShop)
        setWebhooks({shop, accessToken})
          .then(() => {
            // Save to database if everything was successful
            User.findOneAndUpdate({username: req.session.user}, {shop})
              .then(() => {
                return Shop.create({shop, token: accessToken})
              })
              .then(() => {
                res.redirect(forwardingAddress)
              })
              .catch((error) => {
                console.log('ERR:', error)
                res.status(500).end()
              })
          })
          .catch((error) => {
            console.log('Webhooks failed:', error)
            res.status(500).end()
            // res.status(error.statusCode).send(error.error.error_description)
          })
      })
      .catch((error) => {
        console.log('Access token request failed:', error)
        res.status(500).end()
        // res.status(error.statusCode).send(error.error.error_description)
      })
  } else {
    res.status(400).send('Required parameters missing')
  }
})

app.get('/delete/webhooks', (req, res) => {
  const {shop} = req.query
  let savedShop = shops.filter((obj) => obj.shop === shop)[0]
  deleteWebhooks(savedShop)
    .then((results) => {
      console.log(results)
      res.json(results)
    })
    .catch((error) => {
      console.log('ERROR:', error)
      res.status(error.statusCode || 500).send(error.message)
    })
})

app.get('/webhook', (req, res) => {
  const {shop} = req.query
  let savedShop = shops.filter((obj) => obj.shop === shop)[0]
  getWebhooks(savedShop)
    .then((webhooks) => {
      console.log(webhooks)
      res.json(webhooks)
    })
    .catch((error) => {
      console.log('ERROR:', error)
      res.status(error.statusCode || 500).send(error.message)
    })
})

app.post('/webhook/orders/create', webhookValidate, (req, res) => {
  console.log('Received orders/create webhook')
  console.log(req.body)
  res.status(200).end()
})

app.post('/webhook/orders/cancelled', webhookValidate, (req, res) => {
  console.log('Received orders/delete webhook')
  console.log(req.body)
  res.status(200).end()
})

app.post('/webhook/test/orders/create', webhookValidate, (req, res) => {
  console.log('Received test orders/create webhook')
  console.log(req.body)
  res.status(200).end()
})

app.get('/products', (req, res) => {
  if (!shops.length) return res.status(500).send('No products to list')
  const {shop, accessToken} = shops[0]
  const shopRequestUrl = `https://${shop}/admin/products.json`
  const shopRequestHeaders = {'X-Shopify-Access-Token': accessToken}
  request.get(shopRequestUrl, {headers: shopRequestHeaders})
    .then((shopResponse) => {
      shopResponse = JSON.parse(shopResponse)
      shopResponse.products.forEach((product) => {
        product.shop = shop
      })
      res.json(shopResponse)
    })
    .catch((error) => {
      res.status(error.statusCode).send(error.error.error_description)
    })
})

app.get('/myshop', (req, res) => {
  console.log('3:', req.session)
  if (!req.session || !req.session.user) return res.status(404).end()
  User.findOne({username: req.session.user})
    .then((user) => {
      if (user && user.shop) res.json({shop: user.shop})
      else res.json({})
    })
    .catch((error) => {
      console.log('ERR:', error)
      res.status(500).end()
    })
})

app.post('/signup', handleSignup)
app.post('/login', handleLogin)
app.get('/logout', handleLogout)

app.use('/', validateSession, express.static(path.join(__dirname, 'build')))

// Database
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost/shopify-example'
mongoose.connect(mongoURI)

// Port
const port = process.env.PORT || 1337
app.listen(port, () => {
  console.log('Server is listening on port ' + port)
})
