import React, { Fragment, useState } from 'react'
import { Link } from 'react-router-dom'
import ReportsDD from './ReportsDD'

const Navlinks = () => {
  const [showReportJobs, setShowReportJobs] = useState(false)
  const [showUpdateJobs, setShowUpdateJobs] = useState(false)

  const handleTab = (tab) => {
    if (tab === 'update') {
      if (showUpdateJobs) {
        setShowUpdateJobs(false)
      } else {
        setShowUpdateJobs(true)
        setShowReportJobs(false)
      }
    }
    if (tab === 'reports') {
      if (showReportJobs) {
        setShowReportJobs(false)
      } else {
        setShowReportJobs(true)
        setShowUpdateJobs(false)
      }
    }
  }
  return (
    <Fragment>
      <div className='my-subheader'>
        <div className='subheader-item' onClick={() => handleTab('update')}>
          <span>Update</span>
          <ReportsDD show={showUpdateJobs} download={true} />
        </div>
        <div className='subheader-item' onClick={() => handleTab('reports')}>
          <span>Job Reports</span>
          <ReportsDD show={showReportJobs} />
        </div>
        <Link to={'/dormant'}>
          <div className='subheader-item'>Dormant Data</div>
        </Link>
        <Link to={'/filters'}>
          <div className='subheader-item'>Filters</div>
        </Link>
        <div className='subheader-item'>More</div>
      </div>
    </Fragment>
  )
}

export default Navlinks
