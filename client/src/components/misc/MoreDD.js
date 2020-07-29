import React, { Fragment } from 'react'
import { Link } from 'react-router-dom'

const MoreDD = ({ show }) => {
  return (
    <div
      style={{ right: 17 }}
      className={show ? 'reports-dropdown' : 'reports-dropdown hide'}
    >
      <Fragment>
        <Link to={'/discrepancies'}>
          <div className='reports-job'>Discrepancies</div>
        </Link>
      </Fragment>
    </div>
  )
}

export default MoreDD
