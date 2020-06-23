import React, { Fragment } from 'react'
import Alert from '../misc/Alert'
import { setAlert } from '../../actions/alert'
import { connect } from 'react-redux'

const Dashboard = ({ setAlert }) => {
  return (
    <Fragment>
      <Alert />
      <div className='my-container'>
        <div
          className='my-alert-button'
          onClick={() => setAlert('Test Alert!', 'danger')}
        >
          Test Alert
        </div>
      </div>
    </Fragment>
  )
}

export default connect(null, { setAlert })(Dashboard)
