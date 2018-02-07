import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
// import Client from 'shopify-buy'
import shopifyBuy from '@shopify/buy-button-js'

const config = {
  storefrontAccessToken: '56dc0666616964574ef0e4efb43d12f1',
  domain: 'cantelope.myshopify.com'
}

// const client = Client.buildClient(config)
const client = shopifyBuy.buildClient(config)
client.config = client.config || {}
client.config.domain = client.config.domain || 'cantelope.myshopify.com'
console.log('client', client)
console.log('UI', shopifyBuy.UI)
const ui = shopifyBuy.UI.init(client)
ReactDOM.render(
  <App ui={ui} />,
  document.getElementById('root')
)
