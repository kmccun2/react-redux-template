import React, { Fragment } from 'react'
import { setJobsLoading } from '../../actions/jobs'
import { connect } from 'react-redux'
import Loading from '../misc/Loading'

const Dashboard = ({ setJobsLoading, jobnums, updateDormant, dormant }) => {
  return (
    <Fragment>
      {dormant === undefined ? (
        <Loading message='Data loading...' />
      ) : (
        <Fragment>
          <div style={{ marginTop: 30 }}>Dashboard</div>
        </Fragment>
      )}
    </Fragment>
  )
}

const mapStateToProps = (state) => ({
  jobnums: state.jobs.jobnums,
  loading: state.jobs.loading,
  dormant: state.jobs.dormant,
})

export default connect(mapStateToProps, { setJobsLoading })(Dashboard)
