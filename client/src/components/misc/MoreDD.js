import React, { Fragment } from 'react'
import { Link } from 'react-router-dom'

const MoreDD = ({ show }) => {
  return (
    <div style={{ right: 17 }} className={show ? 'reports-dropdown' : 'reports-dropdown hide'}>
      <Fragment>
        <Link to={'/compare_items'}>
          <div className='reports-job'>Compare Items</div>
        </Link>
        <Link to={'/compare_spools'}>
          <div className='reports-job'>Compare Spools</div>
        </Link>
      </Fragment>
    </div>
  )
}

export default MoreDD
