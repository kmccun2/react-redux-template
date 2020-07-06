import React, { Fragment } from 'react'
import { Link } from 'react-router-dom'

const Navlinks = () => {
  return (
    <Fragment>
      <Link to={'/dormant'}>
        <div className='subheader-item'>Dormant Data</div>
      </Link>
      <div className='subheader-item'>Descrepancies</div>
      <div className='subheader-item'>Support Comparison</div>
    </Fragment>
  )
}

export default Navlinks
