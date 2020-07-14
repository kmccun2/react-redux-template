import React, { Fragment } from 'react'
import { updateJob, setJobLoading, setJob } from '../../actions/job'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'

const Reports = ({
  show,
  updateJob,
  setJob,
  setJobLoading,
  jobnums,
  download,
}) => {
  const handleJobClick = (job, needupdate) => {
    setJobLoading()
    if (needupdate) {
      updateJob(job, null)
    } else {
      setJob(job)
      console.log('Job set.')
    }
  }

  return (
    <div className={show ? 'reports-dropdown' : 'reports-dropdown hide'}>
      {jobnums.map((job) => (
        <Fragment key={job}>
          {download ? (
            <div
              className='reports-job'
              onClick={() => handleJobClick(job, true)}
            >
              {job}
            </div>
          ) : (
            <Link to={'/reports/' + job}>
              <div className='reports-job' onClick={() => handleJobClick(job)}>
                {job}
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
