import React, { Component } from 'react'

class Product extends Component {
  openCheckout () {
    window.open(`https://${this.props.product.shop}/cart/${this.props.product.variants[0].id}:1`)
  }

  render () {
    const {product} = this.props
    console.log(product)
    return (
      <div>
        <h3>{product.title}</h3>
        <img src={product.image.src} />
        <button onClick={this.openCheckout.bind(this)}>Buy Me Now</button>
      </div>
    )
  }
}

export default Product
