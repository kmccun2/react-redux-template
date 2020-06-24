import React, { Fragment } from 'react'
import Alert from '../misc/Alert'
import { setAlert } from '../../actions/alert'
import { connect } from 'react-redux'
import { updateJob } from '../../actions/jobs'

const Dashboard = ({ setAlert, updateJob, loading }) => {
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
          <div className='subheader-item' onClick={() => updateJob('6951')}>
            Reports
          </div>
          <div className='subheader-item'>Update Info</div>
          <div className='subheader-item'>Descrepancies</div>
          <div className='subheader-item'>Support Comparison</div>
        </div>
        {loading ? <div>Loading...</div> : null}
      </div>
    </Fragment>
  )
}

const mapStateToProps = (state) => ({
  loading: state.jobs.loading,
})

export default connect(mapStateToProps, { setAlert, updateJob })(Dashboard)
