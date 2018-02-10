import React, { Component } from 'react'

class App extends Component {
  constructor (props) {
    super(props)

    this.state = {
      isCartOpen: false,
      checkout: { lineItems: [] },
      products: [],
      shop: {}
    }
  }

  componentDidMount () {
    window.fetch('/products')
      .then((response) => response.json())
      .then((json) => JSON.parse(json))
      .then((results) => {
        console.log(results)
        this.setState({products: results.products})
      })
      .catch((error) => {
        console.error(error)
      })
  }

  componentDidUpdate () {
    const nodes = document.querySelector('.tickets').childNodes
    this.state.products.forEach((product, i) => {
      this.createButton(product.id, nodes[i])
    })
  }

  createButton (id, node) {
    this.props.ui.createComponent('product', {
      id,
      node,
      moneyFormat: '%24%7B%7Bamount%7D%7D',
      options: {
        'product': {
          'buttonDestination': 'checkout',
          'variantId': 'all',
          'width': '240px',
          'contents': {
            'imgWithCarousel': false,
            'variantTitle': false,
            'description': false,
            'buttonWithQuantity': false,
            'quantity': false
          },
          'text': {
            'button': 'BUY NOW'
          },
          'styles': {
            'product': {
              '@media (min-width: 601px)': {
                'max-width': '100%',
                'margin-left': '0',
                'margin-bottom': '50px'
              }
            },
            'compareAt': {
              'font-size': '12px'
            }
          }
        },
        'cart': {
          'contents': {
            'button': true
          },
          'styles': {
            'footer': {
              'background-color': '#ffffff'
            }
          }
        },
        'modalProduct': {
          'contents': {
            'img': false,
            'imgWithCarousel': true,
            'variantTitle': false,
            'buttonWithQuantity': true,
            'button': false,
            'quantity': false
          },
          'styles': {
            'product': {
              '@media (min-width: 601px)': {
                'max-width': '100%',
                'margin-left': '0px',
                'margin-bottom': '0px'
              }
            }
          }
        },
        'productSet': {
          'styles': {
            'products': {
              '@media (min-width: 601px)': {
                'margin-left': '-20px'
              }
            }
          }
        }
      }
    })
  }

  render () {
    return (
      <div>
        <div>Hello World!</div>
        <div className='tickets'>
          {this.state.products.map((product) => <div />)}
        </div>
      </div>
    )
  }
}

export default App
