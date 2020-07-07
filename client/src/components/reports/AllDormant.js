import React, { useEffect, Fragment } from 'react'
import { connect } from 'react-redux'
import { setJobsLoading, updateDormant } from '../../actions/dormant'
import Dormant from '../reports/Dormant'
import Loading from '../misc/Loading'

const AllDormant = ({ dormant, jobnums, updateDormant }) => {
  // LOAD JOBS IF NOT LOADED
  useEffect(() => {
    if (dormant === undefined) {
      updateDormant(jobnums)
    }
    // eslint-disable-next-line
  }, [])

  return (
    <Fragment>
      {dormant !== undefined ? (
        <Fragment>
          <div style={{ marginTop: 30 }}></div>
          <Dormant dormant={dormant} />
        </Fragment>
      ) : (
        <Loading message='Loading dormant data...' />
      )}
    </Fragment>
  )
}
const mapStateToProps = (state) => ({
  loading: state.dormant.loading,
  dormant: state.dormant.dormant,
  jobnums: state.dormant.jobnums,
})

export default connect(mapStateToProps, { setJobsLoading, updateDormant })(
  AllDormant
)
