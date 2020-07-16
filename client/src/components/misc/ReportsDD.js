import React, { Fragment } from 'react'
import { updateJob, setJobLoading, setJob } from '../../actions/job'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'

const Reports = ({ show, updateJob, setJobLoading, jobnums, download }) => {
  const handleJobClick = (jobnum, needupdate) => {
    setJobLoading()
    if (needupdate) {
      updateJob(jobnum)
    }
  }

  return (
    <div
      style={download && { marginLeft: -42 }}
      className={show ? 'reports-dropdown' : 'reports-dropdown hide'}
    >
      {jobnums.map((jobnum) => (
        <Fragment key={jobnum}>
          {download ? (
            <Link to={'/download'}>
              <div
                className='reports-job'
                onClick={() => handleJobClick(jobnum, true)}
              >
                {jobnum}
              </div>
            </Link>
          ) : (
            <Link to={'/reports/' + jobnum}>
              <div
                className='reports-job'
                onClick={() => handleJobClick(jobnum)}
              >
                {jobnum}
              </div>
            </Link>
          )}
        </Fragment>
      ))}
    </div>
  )
}

const mapStateToProps = (state) => ({
  jobnums: state.jobs.jobnums,
})

export default connect(mapStateToProps, { updateJob, setJob, setJobLoading })(
  Reports
)
