const express = require('express')
const path = require('path')
const morgan = require('morgan')
const bodyParser = require('body-parser')
// const mongoose = require('mongoose')

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

// Database
// const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost/shopify-example'
// mongoose.connect(mongoURI)

// Port
const port = process.env.PORT || 1337
app.listen(port)
console.log('Server is listening on port ' + port)
