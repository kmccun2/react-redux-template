import React, { Fragment, useEffect } from 'react'
import { compareTags } from '../../actions/tags'
import { connect } from 'react-redux'

const CompareTags = ({ compareTags, job }) => {
  useEffect(() => {
    if (job) {
      compareTags(job)
    }
  }, [compareTags, job])
  return (
    <Fragment>
      <div className='table-label'>Compare Tags</div>
    </Fragment>
  )
}

const mapStateToProps = (state) => ({
  job: state.job.job,
})
export default connect(mapStateToProps, { compareTags })(CompareTags)
