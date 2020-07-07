import React, { Fragment, useEffect } from 'react'
import { setJobsLoading, updateDormant } from '../../actions/dormant'
import { connect } from 'react-redux'
import Loading from '../misc/Loading'

const Dashboard = ({ setJobsLoading, jobnums, updateDormant, dormant }) => {
  useEffect(() => {
    setJobsLoading()
    updateDormant(jobnums)
    // eslint-disable-next-line
  }, [])

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
  jobnums: state.dormant.jobnums,
  loading: state.dormant.loading,
  dormant: state.dormant.dormant,
})

export default connect(mapStateToProps, { setJobsLoading, updateDormant })(
  Dashboard
)
