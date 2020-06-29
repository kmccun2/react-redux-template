import React, { Fragment } from 'react'
import Alert from '../misc/Alert'
import { setAlert } from '../../actions/alert'
import { connect } from 'react-redux'

const Dashboard = () => {
  return (
    <Fragment>
      <Alert />
      <div>Dashboard</div>
    </Fragment>
  )
}

export default connect(null, { setAlert })(Dashboard)
