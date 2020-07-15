import React, { Fragment } from 'react'
import { connect } from 'react-redux'
import { setJobsLoading } from '../../actions/jobs'
import Dormant from '../reports/Dormant'
import Loading from '../misc/Loading'

const AllDormant = ({ dormant }) => {
  return (
    <Fragment>
      {dormant !== undefined ? (
        <Fragment>
          <div style={{ marginTop: 30 }}></div>
          <Dormant dormant={dormant} manyjobs={true} />
        </Fragment>
      ) : (
        <Loading message='Loading dormant data...' />
      )}
    </Fragment>
  )
}
const mapStateToProps = (state) => ({
  loading: state.jobs.loading,
  dormant: state.jobs.dormant,
})

export default connect(mapStateToProps, { setJobsLoading })(AllDormant)
