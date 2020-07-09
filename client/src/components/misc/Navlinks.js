import React, { Fragment } from 'react'
import { Link } from 'react-router-dom'

const Navlinks = () => {
  return (
    <Fragment>
      <Link to={'/dormant'}>
        <div className='subheader-item'>Dormant Data</div>
      </Link>
      <Link to={'/filters'}>
        <div className='subheader-item'>Filters</div>
      </Link>
      <div className='subheader-item'>More</div>
    </Fragment>
  )
}

export default Navlinks
