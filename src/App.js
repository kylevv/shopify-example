import React, { Component } from 'react'
import Product from './components/Product'
import Nav from './components/Nav'
import Form from './components/Form'
import './styles/App.css'

class App extends Component {
  constructor (props) {
    super(props)
    this.state = {
      view: 'create',
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

  changeView (view) {
    this.setState({view})
  }

  addProduct (product) {
    const products = this.state.products
    products.unshift(product)
    this.setState({products})
  }

  render () {
    return (
      <div>
        <Nav changeView={this.changeView.bind(this)} />
        {this.state.view === 'create'
          ? <div><div>Hello World!</div><Form addProduct={this.addProduct.bind(this)} /></div>
          : this.state.products.map((product) => <Product product={product} />)
        }
      </div>
    )
  }
}

export default App
