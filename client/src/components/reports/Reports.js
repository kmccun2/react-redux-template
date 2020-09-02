import React, { Fragment, useState, useEffect } from 'react'
import { connect } from 'react-redux'
import {
  setJobLoading,
  setJob,
  downloadReport,
  downloadLoading,
} from '../../actions/job'
import Areas from './Areas'
import Loading from '../misc/Loading'
import Shorts from './Shorts'
import Dormant from './Dormant'
import SpoolShorts from './SpoolShorts'
import { CSVLink } from 'react-csv'
import Discrepancies from '../discrepancies/Discrepancies'
import Location from '../reports/Location'
import ManHours from './ManHours'

const Reports = ({
  match,
  loading,
  job,
  setJob,
  downloadReport,
  downloading,
  downloadLoading,
}) => {
  const [jsActive, setjsActive] = useState(1)
  const [items, setItems] = useState([])
  let jobnum = match.params.job.toString()

  useEffect(() => {
    setJob(jobnum)
  }, [jobnum, setJob])

  // GO BACK TO AREAS ON NEW JOB
  useEffect(() => {
    setjsActive(1)
  }, [jobnum])

  // CREATE ITEMS OBJECT
  useEffect(() => {
    if (job) {
      let all_items = []
      job.spools.map((spool) => {
        spool.items.map((item) => {
          all_items.push(item)
        })
      })
      setItems(all_items)
    }
  }, [job])

  return (
    <Fragment>
      {!loading && job ? (
        <Fragment>
          <div className='download-csv'>
            <CSVLink className='download-btn' data={job.spools}>
              Spools
            </CSVLink>
            {items.length > 0 && (
              <CSVLink className='download-btn' data={items}>
                Items
              </CSVLink>
            )}
            {job.welds.length > 0 && (
              <CSVLink className='download-btn' data={job.welds}>
                Welds
              </CSVLink>
            )}
            <div
              className='download-btn'
              onClick={() => {
                downloadLoading()
                downloadReport(job)
              }}
            >
              {downloading ? 'Downloading...' : 'Summary'}
            </div>
          </div>
          {/* JOB HEADING */}
          <div className='js-heading'>
            {job.client}: {jobnum}
          </div>
          {/* HIGHLIGHTS */}
          <div className='js-highlights'>
            <div className='js-highlight-item'>{job.total} Spools</div>
            <div className='js-highlight-item'>{job.workable} Workable</div>
            <div className='js-highlight-item'>{job.issued} Issued</div>
            <div className='js-highlight-item'>
              {job.workable_manhours} Workable Man Hours
            </div>
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
            <div
              onClick={() => setjsActive(6)}
              className={
                jsActive === 6 ? 'js-tab js-active js-tab-border' : 'js-tab'
              }
              style={{ borderLeft: '1px solid #dfdfdf' }}
            >
              Man Hours
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
                <Shorts shorts={job.count_shorts.total} header='Total Shorts' />
                {/* TOTAL PURCHASED */}
                <Shorts
                  shorts={job.count_shorts.purchased}
                  header='Total Purchased'
                />
                {/* TOTAL NO MATERIAL */}
                <Shorts
                  shorts={job.count_shorts.no_material}
                  header='Total No Material'
                />
              </Fragment>
            )}
            {/* DORMANT SUMMARIES */}
            {jsActive === 3 && (
              <Dormant manyjobs={false} dormant={job.dormant} />
            )}
            {/* DISCREPANCIES */}
            {jsActive === 4 && <Discrepancies type={'one'} />}
            {/* LOCATiON */}
            {jsActive === 5 && <Location />}
            {/* MAN HOURS */}
            {jsActive === 6 && <ManHours />}
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
  jobnums: state.jobs.jobnums,
  downloading: state.job.downloading,
})
export default connect(mapStateToProps, {
  setJobLoading,
  setJob,
  downloadReport,
  downloadLoading,
})(Reports)
