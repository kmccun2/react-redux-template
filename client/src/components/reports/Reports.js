import React, { Fragment, useState, useEffect } from 'react'
import { connect } from 'react-redux'
import { setJobLoading, setJob } from '../../actions/job'
import Areas from './Areas'
import Loading from '../misc/Loading'
import Shorts from './Shorts'
import Dormant from './Dormant'
import SpoolShorts from './SpoolShorts'
import { CSVLink } from 'react-csv'

const Reports = ({ match, loading, job, dormant, job_mats, setJob }) => {
  const [jsActive, setjsActive] = useState(1)
  let jobnum = match.params.job.toString()

  useEffect(() => {
    setJob(jobnum)
  }, [jobnum, setJob])

  // GO BACK TO AREAS ON NEW JOB
  useEffect(() => {
    setjsActive(1)
  }, [jobnum])

  return (
    <Fragment>
      {!loading && job ? (
        <Fragment>
          <div className='download-csv'>
            <CSVLink className='filter-btn' data={job.spools}>
              Download CSV
            </CSVLink>
          </div>
          {/* JOB HEADING */}
          <div className='js-heading'>
            {job.client}: {jobnum}
          </div>
          {/* HIGHLIGHTS */}
          <div className='js-highlights'>
            <div className='js-highlight-item'>{job.total} Spools</div>
            <div className='js-highlight-item'>
              {job.workable + job.workable_not_issued} Workable
            </div>
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
              onClick={() => {
                setjsActive(3)
              }}
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
          <div className='reports-content'>
            {/* AREA SUMMARIES */}
            {jsActive === 1 && (
              <Fragment>
                {/* ENTIRE JOB */}
                <Areas job={job} header='All Spools' />
                {/*  FOR EACH MATERIAL */}
                {job.materials.map((material) => (
                  <Areas
                    key={material.material}
                    job={material}
                    header={material.material}
                  />
                ))}
              </Fragment>
            )}
            {/* SHORTS SUMMARIES */}
            {jsActive === 2 && (
              <Fragment>
                {/* SPOOLS MISSING ITEMS (BY SCOPE) */}
                <SpoolShorts job={job} />
                {/* ENTIRE JOB */}
                <Shorts missing={job.missing} header='Total Shorts' />
                {/* TOTAL PURCHASED */}
                <Shorts
                  missing={job.missing.filter((each) =>
                    each.includes('Purchased')
                  )}
                  header='Total Purchased'
                />
                {/* TOTAL NO MATERIAL */}
                <Shorts
                  missing={job.missing.filter((each) =>
                    each.includes('No Material')
                  )}
                  header='Total No Material'
                />
              </Fragment>
            )}
            {/* DORMANT SUMMARIES */}
            {jsActive === 3 && <Dormant manyjobs={false} dormant={dormant} />}
          </div>
        </Fragment>
      ) : (
        <Loading message='Creating job reports...' />
      )}
    </Fragment>
  )
}

const mapStateToProps = (state) => ({
  loading: state.job.loading,
  job: state.job.job,
  job_mats: state.job.job_mats,
  jobs: state.job.jobs,
  dormant: state.job.dormant,
  jobnums: state.jobs.jobnums,
})
export default connect(mapStateToProps, {
  setJobLoading,
  setJob,
})(Reports)
