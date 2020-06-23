import React from 'react'
import Loader from 'react-loader-spinner'

const Spinner = () => (
  <div className='spinner'>
    <Loader type='Bars' color='#00BFFF' height={60} width={60} />
  </div>
)

export default Spinner
