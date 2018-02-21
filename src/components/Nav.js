import React, { Component } from 'react'
import '../styles/Nav.css'

class Product extends Component {
  render () {
    const {changeView} = this.props
    return (
      <div className={'Nav'}>
        <div className={'nav-container'}>
          <div className={'nav-button'} onClick={() => changeView('list')}>Products</div>
          <div className={'nav-button'} onClick={() => changeView('create')}>Add New</div>
        </div>
      </div>
    )
  }
}

export default Product
