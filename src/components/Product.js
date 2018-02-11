import React, { Component } from 'react'
import '../styles/Product.css'

class Product extends Component {
  openCheckout () {
    window.open(`https://${this.props.product.shop}/cart/${this.props.product.variants[0].id}:1`)
  }

  render () {
    const {product} = this.props
    console.log(product)
    return (
      <div className={'Product'} style={{'background-image': `url("${product.image.src}"`}}>
        <div className={'product-container'} >
          <h3>{product.title}</h3>
          <button className={'product-button'} onClick={this.openCheckout.bind(this)}>Buy Me Now</button>
        </div>
      </div>
    )
  }
}

export default Product
