const express = require('express')
const path = require('path')
const morgan = require('morgan')
const bodyParser = require('body-parser')
// const mongoose = require('mongoose')
const dotenv = require('dotenv').config() // eslint-disable-line
const crypto = require('crypto')
const cookie = require('cookie')
const nonce = require('nonce')()
const request = require('request-promise-native')
const querystring = require('querystring')

const apiKey = process.env.SHOPIFY_API_KEY
const apiSecret = process.env.SHOPIFY_API_SECRET
const forwardingAddress = process.env.SERVER_URL
const scopes = 'read_products'
const shops = []

const app = express()

// Middleware
app.use(morgan('dev'))
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, 'build')))

// Routes
app.get('/helloworld', (req, res) => {
  res.json({hello: 'world'})
})
app.get('/shopify', (req, res) => {
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
app.get('/shopify/callback', (req, res) => {
  const {shop, hmac, code, state} = req.query
  const stateCookie = cookie.parse(req.headers.cookie).state
  if (state !== stateCookie) {
    return res.status(403).send('Request origin cannot be verified')
  }
  if (shop && hmac && code) {
    const map = Object.assign({}, req.query)
    delete map['signature']
    delete map['hmac']
    const message = querystring.stringify(map)
    const generatedHash = crypto
      .createHmac('sha256', apiSecret)
      .update(message)
      .digest('hex')
    if (generatedHash !== hmac) {
      return res.status(400).send('HMAC validation failed')
    }
    const accessTokenRequestUrl = `https://${shop}/admin/oauth/access_token`
    const accessTokenPayload = {
      client_id: apiKey,
      client_secret: apiSecret,
      code
    }
    request.post(accessTokenRequestUrl, {json: accessTokenPayload})
      .then((accessTokenResponse) => {
        const accessToken = accessTokenResponse.access_token
        shops.push({shop, accessToken}) // TODO: Save to database
        // const shopRequestUrl = `https://${shop}/admin/shop.json`
        // const shopRequestHeaders = {'X-Shopify-Access-Token': accessToken}
        // request.get(shopRequestUrl, {headers: shopRequestHeaders})
        //   .then((shopResponse) => {
        //     res.end(shopResponse)
        //   })
        //   .catch((error) => {
        //     res.status(error.statusCode).send(error.error.error_description)
        //   })
        res.redirect(forwardingAddress)
      })
      .catch((error) => {
        res.status(error.statusCode).send(error.error.error_description)
      })
  } else {
    res.status(400).send('Required parameters missing')
  }
})
app.get('/products', (req, res) => {
  const {shop, accessToken} = shops[0]
  const shopRequestUrl = `https://${shop}/admin/products.json`
  const shopRequestHeaders = {'X-Shopify-Access-Token': accessToken}
  request.get(shopRequestUrl, {headers: shopRequestHeaders})
    .then((shopResponse) => {
      res.json(shopResponse)
    })
    .catch((error) => {
      res.status(error.statusCode).send(error.error.error_description)
    })
})

// Database
// const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost/shopify-example'
// mongoose.connect(mongoURI)

// Port
const port = process.env.PORT || 1337
app.listen(port)
console.log('Server is listening on port ' + port)
