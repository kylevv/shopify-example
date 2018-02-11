import React, { Component } from 'react'
import Product from './components/Product'
import './styles/App.css'

class App extends Component {
  constructor (props) {
    super(props)

    this.state = {
      products: []
    }
  }

  componentDidMount () {
    window.fetch('/products')
      .then((response) => {
        if (response.status !== 200) return response.text().then((text) => Promise.reject(new Error(text)))
        return response.json()
      })
      .then((results) => {
        console.log(results)
        this.setState({products: results.products})
      })
      .catch((error) => {
        console.log(error)
      })
  }

  render () {
    return (
      <div>
        <div>Hello World!</div>
        {this.state.products.map((product) => <Product product={product} />)}
      </div>
    )
  }
}

export default App
