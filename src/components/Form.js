import React, { Component } from 'react'
import '../styles/Form.css'

class Product extends Component {
  constructor (props) {
    super(props)
    this.updateShop = this.updateShop.bind(this)
    this.buildProduct = this.buildProduct.bind(this)
  }

  updateShop (ev) {
    console.log('send')
    ev.preventDefault()
    const shop = document.querySelector('.Form form input').value
    window.open(`/shopify?shop=${shop}`, '_self')
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
        {this.props.shop
          ? <div>
            <select>
              {this.props.products.map((product) => {
                return <option value={product.id}>{product.title}</option>
              })}
            </select>
            <button onClick={this.buildProduct}>Submit</button>
          </div>
          : <div>
            <form onSubmit={this.updateShop}>
              <input placeholder={'store-name.myshopify.com'} />
            </form>
          </div>
        }
      </div>
    )
  }
}

export default Product
