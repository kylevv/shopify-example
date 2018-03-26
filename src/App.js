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
      shop: '',
      products: []
    }
    this.changeView = this.changeView.bind(this)
    this.addProduct = this.addProduct.bind(this)
  }

  componentDidMount () {
    window.fetch('/products')
      .then((response) => {
        if (response.status !== 200) return response.text().then((text) => Promise.reject(new Error(text)))
        return response.json()
      })
      .then((results) => {
        console.log('products:', results)
        this.setState({products: results.products})
      })
      .catch((error) => {
        console.log(error)
      })
    window.fetch('/myshop', {credentials: 'include'})
      .then((response) => {
        if (response.status !== 200) return response.text().then((text) => Promise.reject(new Error(text)))
        return response.json()
      })
      .then((results) => {
        console.log('shop:', results)
        this.setState({shop: results.shop})
      })
      .catch((error) => {
        console.log(error)
      })
  }

  changeView (view) {
    this.setState({view})
  }

  logout () {
    window.open('/logout', '_self')
  }

  addProduct (product) {
    const products = this.state.products
    products.unshift(product)
    this.setState({products, view: 'create'})
  }

  render () {
    return (
      <div>
        <Nav changeView={this.changeView} logout={this.logout} />
        {this.state.view === 'create'
          ? <div><div>Hello World!</div><Form shop={this.state.shop} addProduct={this.addProduct} /></div>
          : this.state.products.map((product) => <Product product={product} />)
        }
      </div>
    )
  }
}

export default App
