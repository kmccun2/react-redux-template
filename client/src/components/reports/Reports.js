import React, { Fragment, useState, useEffect } from 'react'
import { connect } from 'react-redux'
import { setJobLoading, updateJob, updateShorts } from '../../actions/jobs'
import Areas from './Areas'
import Loading from '../misc/Loading'
import Shorts from './Shorts'

const Reports = ({
  match,
  loading,
  job,
  job_mats,
  setJobLoading,
  updateJob,
  updateShorts,
}) => {
  const [matJobs, setMatJobs] = useState([])
  const [jsActive, setjsActive] = useState(1)
  let jobnum = match.params.job.toString()

  // GO BACK TO AREAS ON NEW JOB
  useEffect(() => {
    setjsActive(1)
  }, [jobnum])

  // MAIN CALCULATIONS
  useEffect(() => {
    setJobLoading()
    updateJob(jobnum, null)
  }, [jobnum, updateJob, setJobLoading])

  // CREATE MATERIAL FILTERED JOBS
  useEffect(() => {
    if (job && job_mats.length === 0) {
      job.materials.map((material) => {
        setMatJobs([
          ...matJobs,
          updateJob(
            jobnum,
            job.spools.filter((spool) => spool.material === material)
          ),
        ])
      })
    }
  }, [job, jobnum])

  return (
    <Fragment>
      {!loading && job ? (
        <Fragment>
          {/* JOB HEADING */}
          <div className='js-heading'>
            {job.client}: {jobnum}
          </div>
          {/* HIGHLIGHTS */}
          <div className='js-highlights'>
            <div className='js-highlight-item'>{job.total_spools} Spools</div>
            <div className='js-highlight-item'>{job.workable} Workable</div>
            <div className='js-highlight-item'>{job.issued} Issued</div>
          </div>
          {/* SUMMARY TABS */}
          <div className='js-tabs'>
            <div
              onClick={() => {
                setjsActive(1)
              }}
              className={jsActive === 1 ? 'js-tab js-active' : 'js-tab'}
            >
              Areas
            </div>
            <div
              onClick={() => {
                setjsActive(2)
                if (job.shorts.length === 0) {
                  setJobLoading(true)
                  updateShorts(job)
                }
              }}
              className={
                jsActive === 2
                  ? 'js-tab js-active js-tab-border'
                  : 'js-tab js-tab-border'
              }
            >
              Shorts
            </div>
            <div
              onClick={() => setjsActive(3)}
              className={jsActive === 3 ? 'js-tab js-active' : 'js-tab'}
            >
              Dormant
            </div>
            <div
              onClick={() => setjsActive(4)}
              className={
                jsActive === 4
                  ? 'js-tab js-active js-tab-border'
                  : 'js-tab js-tab-border'
              }
            >
              Discrepancies
            </div>
            <div
              onClick={() => setjsActive(5)}
              className={jsActive === 5 ? 'js-tab js-active' : 'js-tab'}
            >
              Location
            </div>
          </div>
          {/* AREA SUMMARIES */}
          {jsActive === 1 && (
            <Fragment>
              {/* ENTIRE JOB */}
              <Areas job={job} header='All Spools' />
              {/*  FOR EACH MATERIAL */}
              {job_mats.map((job) => (
                <Areas
                  key={job.materials[0]}
                  job={job}
                  header={job.materials[0]}
                />
              ))}
            </Fragment>
          )}
          {/* SHORTS SUMMARIES */}
          {jsActive === 2 && (
            <Fragment>
              {/* ENTIRE JOB */}
              <Shorts
                job={job}
                header='Total Shorts'
                filtered='Purchased No Material'
              />
              {/* TOTAL PURCHASED */}
              <Shorts job={job} header='Total Shorts' filtered='Purchased' />
              {/* TOTAL NO MATERIAL */}
              <Shorts job={job} header='Total Shorts' filtered='No Material' />
            </Fragment>
          )}
        </Fragment>
      ) : (
        <Loading message='Fetching data from database...' />
      )}
    </Fragment>
  )
}

const mapStateToProps = (state) => ({
  loading: state.jobs.loading,
  job: state.jobs.job,
  job_mats: state.jobs.job_mats,
})
export default connect(mapStateToProps, {
  setJobLoading,
  updateJob,
  updateShorts,
})(Reports)
