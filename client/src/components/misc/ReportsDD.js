import React from 'react'
import { updateJob, setJobLoading } from '../../actions/job'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'

const Reports = ({ show, updateJob, setJobLoading, jobnums }) => {
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

const mapStateToProps = (state) => ({
  jobnums: state.dormant.jobnums,
})

export default connect(mapStateToProps, { updateJob, setJobLoading })(Reports)
