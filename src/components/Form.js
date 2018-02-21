import React, { Component } from 'react'
import '../styles/Form.css'

class Product extends Component {
  constructor (props) {
    super(props)
    this.state = {
      shop: ''
    }
  }

  updateShop (ev) {
    ev.preventDefault()
    const shop = document.querySelector('.Form form input').value()
    window.fetch(`/shopify?shop=${shop}`)
    this.setState({shop})
  }

  buildProduct () {
    const select = document.querySelector('.Form select')
    const productId = select.options[select.selectedIndex].value
    console.log('productId:', productId)
    // this.props.addProduct({})
  }

  render () {
    return (
      <div className={'Form'}>
        <form onSubmit={this.updateShop.bind(this)}>
          <input placeholder={'store-name.myshopify.com'} />
        </form>
        {this.state.shop &&
          <div>
            <select>
              <option value={'orange'}>Orange</option>
            </select>
            <button onClick={this.buildProduct.bind(this)}>Submit</button>
          </div>
        }
      </div>
    )
  }
}

export default Product