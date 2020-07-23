import React, { Fragment, useState, useEffect } from 'react'
import { connect } from 'react-redux'
import { updateJobs } from '../../actions/jobs'

const Discrepancies = ({ discrepancies, job, type }) => {
  const [used, setUsed] = useState({
    fc_not_ll: [],
    sr_not_ll: [],
    notfc_notiss: [],
    fc_iss: [],
  })

  useEffect(() => {
    if (type === undefined && discrepancies) {
      setUsed(discrepancies)
    }
    if (type === 'one') {
      setUsed(job.discrepancies)
    }
  }, [discrepancies, type])

  return (
    <Fragment>
      <div style={{ marginTop: 60 }} className='js-heading'>
        Discrepancies
      </div>
      <div className='disc-container'>
        {/* STATUS REPORT (NOT LINELIST) */}
        <div className='table-container disc-table'>
          <div className='table-row disc-table-label'>
            In Status Report (Not in Linelist)
          </div>
          <div className='table-header table-row'>
            <div className='disc-col'>Job</div>
            <div className='disc-col'>Piecemark</div>
          </div>
          <Fragment>
            {used.sr_not_ll.length === 0 ? (
              <div className='no-discrepancies'>No Discrepancies</div>
            ) : (
              <Fragment>
                {used.sr_not_ll.map((each) => (
                  <div key={each.piecemark} className='table-row'>
                    <div className='disc-col'>{each.jobnum}</div>
                    <div className='disc-col'>{each.piecemark}</div>
                  </div>
                ))}
              </Fragment>
            )}
          </Fragment>
        </div>
        {/* FORECAST (ISSUED) */}
        <div className='table-container disc-table'>
          <div className='table-row disc-table-label'>In Forecast (Issued)</div>
          <div className='table-header table-row'>
            <div className='disc-col'>Job</div>
            <div className='disc-col'>Spool</div>
          </div>
          <Fragment>
            {used.fc_iss.length === 0 ? (
              <div className='no-discrepancies'>No Discrepancies</div>
            ) : (
              <Fragment>
                {used.fc_iss.map((each) => (
                  <div key={each.spool} className='table-row'>
                    <div className='disc-col'>{each.jobnum}</div>
                    <div className='disc-col'>{each.spool}</div>
                  </div>
                ))}
              </Fragment>
            )}
          </Fragment>
        </div>

        {/* NOT FORECAST (NOT ISSUED) */}
        <div className='table-container disc-table'>
          <div className='table-row disc-table-label'>
            Not in Forecast (Not Issued)
          </div>
          <div className='table-header table-row'>
            <div className='disc-col'>Job</div>
            <div className='disc-col'>Spool</div>
          </div>
          <Fragment>
            {used.notfc_notiss.length === 0 ? (
              <div className='no-discrepancies'>No Discrepancies</div>
            ) : (
              <Fragment>
                {used.notfc_notiss.map((each) => (
                  <div key={each.spool} className='table-row'>
                    <div className='disc-col'>{each.jobnum}</div>
                    <div className='disc-col'>{each.spool}</div>
                  </div>
                ))}
              </Fragment>
            )}
          </Fragment>
        </div>

        {/* FORECAST (NOT LINELIST) */}
        <div className='table-container disc-table'>
          <div className='table-row disc-table-label'>
            In Forecast (Not in Linelist)
          </div>
          <div className='table-header table-row'>
            <div className='disc-col'>Job</div>
            <div className='disc-col'>Spool</div>
          </div>
          <Fragment>
            {used.fc_not_ll.length === 0 ? (
              <div className='no-discrepancies'>No Discrepancies</div>
            ) : (
              <Fragment>
                {used.fc_not_ll.map((each) => (
                  <div key={each.spool} className='table-row'>
                    <div className='disc-col'>{each.jobnum}</div>
                    <div className='disc-col'>{each.spool}</div>
                  </div>
                ))}
              </Fragment>
            )}
          </Fragment>
        </div>
      </div>
    </Fragment>
  )
}

const mapStateToProps = (state) => ({
  discrepancies: state.jobs.discrepancies,
  job: state.job.job,
})
export default connect(mapStateToProps, { updateJobs })(Discrepancies)
