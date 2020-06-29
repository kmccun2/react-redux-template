import React from 'react'
import { updateJob, setJobLoading } from '../../actions/jobs'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'

const Reports = ({ show, updateJob, setJobLoading }) => {
  const jobnums = ['6951', '6973']

  const handleJobClick = (job) => {
    setJobLoading()
    updateJob(job, null)
  }

  return (
    <div className={show ? 'reports-dropdown' : 'reports-dropdown hide'}>
      {jobnums.map((job) => (
        <Link key={job} to={'/reports/' + job}>
          <div className='reports-job' onClick={() => handleJobClick(job)}>
            {job}
          </div>
        </Link>
      ))}
    </div>
  )
}

export default connect(null, { updateJob, setJobLoading })(Reports)
