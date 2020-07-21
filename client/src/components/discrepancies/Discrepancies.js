import React, { Fragment, useState, useEffect } from 'react'
import { connect } from 'react-redux'
import { updateJobs } from '../../actions/jobs'

const Discrepancies = ({ discrepancies, updateJobs, jobnum }) => {
  const [srNotLl, setSrNotLl] = useState([])
  const [fcIss, setFcIss] = useState([])
  const [notFcNotIss, setNotFcNotIss] = useState([])
  const [fcNotLl, setFcNotLl] = useState([])

  useEffect(() => {
    if (!jobnum) {
      updateJobs()
    }
  }, [updateJobs, jobnum])

  useEffect(() => {
    if (discrepancies) {
      if (jobnum) {
        setSrNotLl(
          discrepancies.filter(
            (disc) => disc.jobnum === jobnum && disc.type === 'sr_not_ll'
          )
        )
        setFcIss(
          discrepancies.filter(
            (disc) => disc.jobnum === jobnum && disc.type === 'fc_iss'
          )
        )
        setNotFcNotIss(
          discrepancies.filter(
            (disc) => disc.jobnum === jobnum && disc.type === 'not_fc_not_iss'
          )
        )
        setFcNotLl(
          discrepancies.filter(
            (disc) => disc.jobnum === jobnum && disc.type === 'fc_not_ll'
          )
        )
      } else {
        setSrNotLl(discrepancies.filter((disc) => disc.type === 'sr_not_ll'))
        setFcIss(discrepancies.filter((disc) => disc.type === 'fc_iss'))
        setNotFcNotIss(
          discrepancies.filter((disc) => disc.type === 'not_fc_not_iss')
        )
        setFcNotLl(discrepancies.filter((disc) => disc.type === 'fc_not_ll'))
      }
    }
  }, [discrepancies, jobnum])
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
            {srNotLl.length === 0 ? (
              <div className='no-discrepancies'>No Discrepancies</div>
            ) : (
              <Fragment>
                {srNotLl.map((each) => (
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
            {fcIss.length === 0 ? (
              <div className='no-discrepancies'>No Discrepancies</div>
            ) : (
              <Fragment>
                {fcIss.map((each) => (
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
            {notFcNotIss.length === 0 ? (
              <div className='no-discrepancies'>No Discrepancies</div>
            ) : (
              <Fragment>
                {notFcNotIss.map((each) => (
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
            {fcNotLl.length === 0 ? (
              <div className='no-discrepancies'>No Discrepancies</div>
            ) : (
              <Fragment>
                {fcNotLl.map((each) => (
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
})
export default connect(mapStateToProps, { updateJobs })(Discrepancies)
