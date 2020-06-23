import React, { Fragment } from 'react'
import Alert from '../misc/Alert'
import { setAlert } from '../../actions/alert'
import { connect } from 'react-redux'
import { updateJob } from '../../actions/jobs'

const Dashboard = ({ setAlert, updateJob }) => {
  return (
    <Fragment>
      <Alert />
      <div className='my-container'>
        <div className='my-header'>
          <span className='header-item company-name'>
            Performance Contractors
          </span>
          <input
            className='header-item spool-search'
            placeholder='Search spools...'
          ></input>
        </div>
        <div className='my-subheader'>
          <div className='subheader-item' onClick={() => updateJob('6973')}>
            Reports
          </div>
          <div className='subheader-item'>Update Info</div>
          <div className='subheader-item'>Descrepancies</div>
          <div className='subheader-item'>Support Comparison</div>
        </div>
      </div>
    </Fragment>
  )
}

export default connect(null, { setAlert, updateJob })(Dashboard)
