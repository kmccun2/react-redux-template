import React, { useEffect, Fragment } from 'react'
import { connect } from 'react-redux'
import { setJobsLoading, updateDormant } from '../../actions/dormant'
import Loading from '../misc/Loading'
import Dormant from '../reports/Dormant'

const AllDormant = ({
  dormant,
  loading,
  setJobsLoading,
  jobnums,
  updateDormant,
}) => {
  useEffect(() => {
    setJobsLoading()
    updateDormant(jobnums)
  }, [])

  return (
    <Fragment>
      {dormant === undefined ? (
        <Loading message='Fetching data from database...' />
      ) : (
        <Dormant dormant={dormant} />
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
  AllDormant
)
